import { json } from '@sveltejs/kit';
import {
	getOrCreateUser,
	getUser,
	createSession,
	removePendingInvite as removePendingInviteFromUser
} from '$lib/server/user.js';
import {
	addTeamMember,
	removePendingInvite as removePendingInviteFromMerchant
} from '$lib/server/merchant.js';

/**
 * POST /api/invite/accept
 * Accept an invitation and grant merchant access.
 * Body: { token, profile?, verificationCode? }
 * - profile: required for new users
 * - verificationCode: required for new users (OTP sent via /api/invite/send-otp)
 */
export async function POST({ request, platform, cookies }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;
	const jwtSecret = platform?.env?.JWT_SECRET;

	if (!db || !kv || !jwtSecret) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		const { token, profile, verificationCode } = await request.json();

		if (!token) {
			return json({ error: 'Token is required' }, { status: 400 });
		}

		// Get invite from KV
		const stored = await kv.get(`invite:${token}`);

		if (!stored) {
			return json({ error: 'Invalid or expired invitation' }, { status: 404 });
		}

		const inviteData = JSON.parse(stored);

		// Check if expired
		if (Date.now() > inviteData.expiresAt) {
			await kv.delete(`invite:${token}`);
			return json({ error: 'This invitation has expired' }, { status: 410 });
		}

		const { email, merchantDomain, role } = inviteData;

		// Check if user already exists
		let user = await getUser({ platform, email });

		if (!user) {
			// New user - profile and OTP verification required
			if (!profile || !profile.name) {
				return json(
					{ error: 'Profile information is required for new users' },
					{ status: 400 }
				);
			}

			// OTP verification required for new users
			if (!verificationCode) {
				return json(
					{ error: 'Email verification code is required for new users' },
					{ status: 400 }
				);
			}

			// Validate OTP code format (6 digits)
			if (!/^\d{6}$/.test(verificationCode)) {
				return json({ error: 'Invalid verification code format' }, { status: 400 });
			}

			// Get and verify OTP
			const otpStored = await kv.get(`invite-otp:${token}`);
			if (!otpStored) {
				return json(
					{ error: 'Verification code not found or expired. Please request a new code.' },
					{ status: 400 }
				);
			}

			const otpData = JSON.parse(otpStored);

			// Check OTP expiration
			if (Date.now() > otpData.expiresAt) {
				await kv.delete(`invite-otp:${token}`);
				return json(
					{ error: 'Verification code has expired. Please request a new code.' },
					{ status: 400 }
				);
			}

			// Verify OTP matches
			if (otpData.code !== verificationCode) {
				return json({ error: 'Invalid verification code' }, { status: 400 });
			}

			// Verify OTP is for the right invite
			if (otpData.inviteToken !== token || otpData.email !== email) {
				return json({ error: 'Verification code mismatch' }, { status: 400 });
			}

			// OTP valid - clean up
			await kv.delete(`invite-otp:${token}`);

			// Create new user with profile
			user = await getOrCreateUser({
				platform,
				email,
				profile: {
					name: profile.name,
					company: profile.company || '',
					title: profile.title || '',
					location: profile.location || ''
				}
			});
		}

		// Add to MerchantDO team and DashUserDO (with audit logging)
		await addTeamMember({
			platform,
			merchantDomain,
			userId: user.userId,
			userEmail: email,
			role,
			grantedBy: inviteData.invitedBy,
			actor: { id: user.userId, email }
		});

		// Update merchant_dashboards with owner_user_id if this is an owner invite
		if (role === 'owner') {
			await db
				.prepare(
					`UPDATE merchant_dashboards
					 SET owner_user_id = ?, status = 'active'
					 WHERE domain = ? AND owner_user_id IS NULL`
				)
				.bind(user.userId, merchantDomain)
				.run();
		}

		// Get device info from request
		const userAgent = request.headers.get('user-agent') || '';
		const ipAddress =
			request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';

		// Create session
		const { token: sessionToken } = await createSession({
			platform,
			userId: user.userId,
			email: user.email,
			userAgent,
			ipAddress,
			jwtSecret
		});

		// Delete the invite token (single use)
		await kv.delete(`invite:${token}`);

		// Remove from MerchantDO pending invites
		await removePendingInviteFromMerchant({ platform, merchantDomain, token });

		// Remove from user's pending invites (if it was stored there)
		await removePendingInviteFromUser({ platform, userId: user.userId, token });

		// Set session cookie
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 // 7 days - JWT inside expires every 30min and gets renewed
		});

		return json({
			success: true,
			redirectTo: `/merchant/${merchantDomain}`
		});
	} catch (error) {
		console.error('Error accepting invite:', error);
		return json({ error: 'Failed to accept invitation' }, { status: 500 });
	}
}
