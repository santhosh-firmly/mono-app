import { json } from '@sveltejs/kit';
import { getMerchantAccess, getUserIdByEmail, addPendingInvite } from '$lib/server/user.js';
import { sendInviteEmail } from '$lib/server/email.js';
import { createAuditLog, AuditEventTypes } from '$lib/server/merchant.js';
import { validateBusinessEmail } from '$lib/server/email-validation.js';

/**
 * POST /merchant/[domain]/api/team/invite
 * Send an invitation to join the merchant team.
 * Body: { email, role }
 */
export async function POST({ locals, params, platform, request, url }) {
	const { userId, email: senderEmail, isFirmlyAdmin } = locals.session;
	const { domain } = params;
	const kv = platform?.env?.OTP_STORE;
	const apiKey = platform?.env?.MAILERSEND_API_KEY;

	if (!kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		// Verify current user is an owner (check DashUserDO) or a Firmly admin
		let isOwner = isFirmlyAdmin === true;
		let currentRole = null;
		if (!isOwner) {
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);
			currentRole = currentAccess?.role;
			isOwner = currentRole === 'owner';
		}

		if (!isOwner) {
			return json({ error: 'Only owners can invite team members' }, { status: 403 });
		}

		// Determine actor type for audit log
		const actorType = isFirmlyAdmin ? 'firmly_admin' : currentRole || 'user';

		const { email, role } = await request.json();

		// Validate required fields
		if (!email || !role) {
			return json({ error: 'Email and role are required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate business email (block free email providers)
		const emailValidation = validateBusinessEmail(email);
		if (!emailValidation.valid) {
			return json({ error: emailValidation.error }, { status: 400 });
		}

		// Validate role
		const validRoles = ['owner', 'editor', 'viewer'];
		if (!validRoles.includes(role)) {
			return json(
				{ error: 'Invalid role. Must be owner, editor, or viewer' },
				{ status: 400 }
			);
		}

		// Role hierarchy: only owners (not editors) can invite as owner
		// This is a defense-in-depth check - currently only owners can invite at all
		if (role === 'owner' && currentRole !== 'owner' && !isFirmlyAdmin) {
			return json({ error: 'Only owners can invite new owners' }, { status: 403 });
		}

		// Generate invite token (64 hex chars = 32 bytes = 256 bits)
		const tokenBytes = new Uint8Array(32);
		crypto.getRandomValues(tokenBytes);
		const token = Array.from(tokenBytes)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		// Calculate expiry (7 days)
		const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

		// Store invite in KV with 7-day TTL
		const inviteData = {
			email,
			merchantDomain: domain,
			role,
			invitedBy: userId,
			invitedByEmail: senderEmail,
			expiresAt,
			type: 'merchant_team_invite'
		};

		await kv.put(`invite:${token}`, JSON.stringify(inviteData), {
			expirationTtl: 7 * 24 * 60 * 60 // 7 days in seconds
		});

		// If invitee already has an account, store pending invite in their DashUserDO
		const inviteeUser = await getUserIdByEmail({ platform, email });
		if (inviteeUser) {
			await addPendingInvite({
				platform,
				userId: inviteeUser.userId,
				invite: {
					token,
					merchantDomain: domain,
					role,
					invitedByEmail: senderEmail,
					expiresAt: new Date(expiresAt).toISOString()
				}
			});
		}

		// Build invite URL
		const baseUrl = url.origin;
		const inviteUrl = `${baseUrl}/invite?token=${token}`;

		// Send invite email
		const emailResult = await sendInviteEmail(
			{
				email,
				merchantDomain: domain,
				role,
				inviteUrl,
				invitedByEmail: senderEmail
			},
			apiKey
		);

		if (!emailResult.success) {
			// Clean up KV entry if email fails
			await kv.delete(`invite:${token}`);
			return json(
				{ error: emailResult.error || 'Failed to send invitation email' },
				{ status: 500 }
			);
		}

		// Create audit log for the invitation
		await createAuditLog({
			platform,
			merchantDomain: domain,
			eventType: AuditEventTypes.TEAM_MEMBER_INVITED,
			actorId: userId,
			actorEmail: senderEmail,
			targetEmail: email,
			details: { role },
			isFirmlyAdmin,
			actorType
		});

		return json({
			success: true,
			message: `Invitation sent to ${email}`,
			expiresAt
		});
	} catch (error) {
		console.error('Error sending team invite:', error);
		return json({ error: 'Failed to send invitation' }, { status: 500 });
	}
}
