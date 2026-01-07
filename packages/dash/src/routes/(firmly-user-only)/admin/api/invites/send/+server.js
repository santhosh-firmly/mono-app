import { json } from '@sveltejs/kit';
import { sendInviteEmail } from '$lib/server/email.js';
import { getUserIdByEmail, addPendingInvite } from '$lib/server/user.js';
import { createAuditLog, AuditEventTypes } from '$lib/server/merchant.js';
import { validateBusinessEmail } from '$lib/server/email-validation.js';

/**
 * POST /admin/api/invites/send
 * Send an invitation email to grant merchant dashboard access.
 * Body: { email, merchantDomain, role }
 */
export async function POST({ request, platform, locals, url }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;
	const apiKey = platform?.env?.MAILERSEND_API_KEY;

	if (!db || !kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		const { email, merchantDomain, role } = await request.json();

		// Validate required fields
		if (!email || !merchantDomain || !role) {
			return json({ error: 'Email, merchantDomain, and role are required' }, { status: 400 });
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

		// Get admin info for the invite
		const invitedBy = locals.authInfo?.oid || locals.authInfo?.sub || 'unknown';
		const invitedByEmail =
			locals.authInfo?.preferred_username || locals.authInfo?.email || 'admin@firmly.ai';

		// Check if dashboard exists, create if not (auto-create on first invite)
		const existingDashboard = await db
			.prepare('SELECT domain FROM merchant_dashboards WHERE domain = ?')
			.bind(merchantDomain)
			.first();

		if (!existingDashboard) {
			// Auto-create dashboard entry for this merchant
			await db
				.prepare(
					`INSERT INTO merchant_dashboards (domain, created_by, status)
					 VALUES (?, ?, 'pending')`
				)
				.bind(merchantDomain, invitedBy)
				.run();
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
			merchantDomain,
			role,
			invitedBy,
			invitedByEmail,
			expiresAt,
			type: 'merchant_invite',
			isFirmlyAdmin: true
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
					merchantDomain,
					role,
					invitedByEmail,
					expiresAt: new Date(expiresAt).toISOString(),
					isFirmlyAdmin: true
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
				merchantDomain,
				role,
				inviteUrl,
				invitedByEmail
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

		// Create audit log for the invitation (marked as Firmly admin action)
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.TEAM_MEMBER_INVITED,
			actorId: invitedBy,
			actorEmail: invitedByEmail,
			targetEmail: email,
			details: { role, source: 'admin' },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return json({
			success: true,
			message: `Invitation sent to ${email}`,
			expiresAt
		});
	} catch (error) {
		console.error('Error sending invite:', error);
		return json({ error: 'Failed to send invitation' }, { status: 500 });
	}
}
