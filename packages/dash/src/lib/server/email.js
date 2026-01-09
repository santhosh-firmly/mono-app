/**
 * MailerSend email service for sending transactional emails.
 * Server-side only - runs on Cloudflare Workers.
 */

const MAILERSEND_API_URL = 'https://api.mailersend.com/v1/email';

/**
 * Send an email using the MailerSend API.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.toName - Recipient name (optional)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @param {string} apiKey - MailerSend API key
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmail({ to, toName, subject, text, html }, apiKey) {
	if (!apiKey) {
		console.error('MailerSend API key not configured');
		return { success: false, error: 'Email service not configured' };
	}

	const payload = {
		from: {
			email: 'noreply@firmly.ai',
			name: 'Firmly'
		},
		to: [
			{
				email: to,
				...(toName && { name: toName })
			}
		],
		subject,
		text,
		...(html && { html })
	};

	try {
		const response = await fetch(MAILERSEND_API_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (response.status === 202) {
			const messageId = response.headers.get('x-message-id');
			return { success: true, messageId };
		}

		const errorData = await response.json().catch(() => ({}));
		console.error('MailerSend error:', response.status, errorData);

		return {
			success: false,
			error: errorData.message || `Email sending failed with status ${response.status}`
		};
	} catch (error) {
		console.error('MailerSend request error:', error);
		return { success: false, error: 'Failed to send email' };
	}
}

/**
 * Send an OTP verification email.
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit OTP code
 * @param {string} apiKey - MailerSend API key
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendOTPEmail(email, code, apiKey) {
	return sendEmail(
		{
			to: email,
			subject: 'Your Firmly Verification Code',
			text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`,
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #1a1a1a;">Your Verification Code</h2>
					<p style="color: #4a4a4a; font-size: 16px;">Use the following code to verify your email address:</p>
					<div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
						<span style="font-size: 32px; font-family: monospace; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
					</div>
					<p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
					<p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
					<p style="color: #999; font-size: 12px;">firmly.ai</p>
				</div>
			`
		},
		apiKey
	);
}

/**
 * Send a magic link login email.
 * @param {string} email - Recipient email address
 * @param {string} magicLinkUrl - Full URL for the magic link
 * @param {string} apiKey - MailerSend API key
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendMagicLinkEmail(email, magicLinkUrl, apiKey) {
	return sendEmail(
		{
			to: email,
			subject: 'Sign in to Firmly',
			text: `Click the link below to sign in to your Firmly account:\n\n${magicLinkUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this link, please ignore this email.`,
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #1a1a1a;">Sign in to Firmly</h2>
					<p style="color: #4a4a4a; font-size: 16px;">Click the button below to sign in to your account:</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${magicLinkUrl}" style="display: inline-block; background-color: #7979ff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Sign In</a>
					</div>
					<p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
					<p style="color: #7979ff; font-size: 14px; word-break: break-all;">${magicLinkUrl}</p>
					<p style="color: #666; font-size: 14px; margin-top: 20px;">This link will expire in 15 minutes.</p>
					<p style="color: #666; font-size: 14px;">If you didn't request this link, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
					<p style="color: #999; font-size: 12px;">firmly.ai</p>
				</div>
			`
		},
		apiKey
	);
}

/**
 * Send an invitation email to access a merchant dashboard.
 * @param {Object} options - Invite options
 * @param {string} options.email - Recipient email address
 * @param {string} options.merchantDomain - Merchant domain being granted access to
 * @param {string} options.role - Role being granted (owner, editor, viewer)
 * @param {string} options.inviteUrl - Full URL for the invite acceptance
 * @param {string} options.invitedByEmail - Email of the admin who sent the invite
 * @param {string} apiKey - MailerSend API key
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendInviteEmail(
	{ email, merchantDomain, role, inviteUrl, invitedByEmail },
	apiKey
) {
	const roleDescriptions = {
		owner: 'Full access and team management',
		editor: 'Edit merchant settings',
		viewer: 'Read-only access'
	};
	const roleDescription = roleDescriptions[role] || role;

	return sendEmail(
		{
			to: email,
			subject: `You're invited to manage ${merchantDomain} on Firmly`,
			text: `You've been invited to manage the Firmly dashboard for ${merchantDomain}.\n\nRole: ${role} (${roleDescription})\nInvited by: ${invitedByEmail}\n\nClick the link below to accept the invitation:\n\n${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nIf you weren't expecting this invitation, please ignore this email.`,
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #1a1a1a;">You're Invited!</h2>
					<p style="color: #4a4a4a; font-size: 16px;">You've been invited to manage the Firmly dashboard for:</p>
					<div style="background: #f5f5f5; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
						<span style="font-size: 20px; font-weight: 600; color: #1a1a1a;">${merchantDomain}</span>
					</div>
					<p style="color: #4a4a4a; font-size: 14px;"><strong>Role:</strong> ${role} (${roleDescription})</p>
					<p style="color: #4a4a4a; font-size: 14px;"><strong>Invited by:</strong> ${invitedByEmail}</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${inviteUrl}" style="display: inline-block; background-color: #7979ff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
					</div>
					<p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
					<p style="color: #7979ff; font-size: 14px; word-break: break-all;">${inviteUrl}</p>
					<p style="color: #666; font-size: 14px; margin-top: 20px;">This invitation will expire in 7 days.</p>
					<p style="color: #666; font-size: 14px;">If you weren't expecting this invitation, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
					<p style="color: #999; font-size: 12px;">firmly.ai</p>
				</div>
			`
		},
		apiKey
	);
}

/**
 * Send a destination dashboard invitation email.
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.appId - Destination app ID
 * @param {string} options.role - Role being granted (owner, editor, viewer)
 * @param {string} options.inviteUrl - URL to accept the invitation
 * @param {string} options.invitedByEmail - Email of the admin who sent the invite
 * @param {string} apiKey - MailerSend API key
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendDestinationInviteEmail(
	{ email, appId, role, inviteUrl, invitedByEmail },
	apiKey
) {
	const roleDescriptions = {
		owner: 'Full access and team management',
		editor: 'Edit destination settings',
		viewer: 'Read-only access'
	};
	const roleDescription = roleDescriptions[role] || role;

	return sendEmail(
		{
			to: email,
			subject: `You're invited to manage ${appId} on Firmly`,
			text: `You've been invited to manage the Firmly destination dashboard for ${appId}.\n\nRole: ${role} (${roleDescription})\nInvited by: ${invitedByEmail}\n\nClick the link below to accept the invitation:\n\n${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nIf you weren't expecting this invitation, please ignore this email.`,
			html: `
				<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #1a1a1a;">You're Invited!</h2>
					<p style="color: #4a4a4a; font-size: 16px;">You've been invited to manage the Firmly destination dashboard for:</p>
					<div style="background: #f5f5f5; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
						<span style="font-size: 20px; font-weight: 600; color: #1a1a1a;">${appId}</span>
					</div>
					<p style="color: #4a4a4a; font-size: 14px;"><strong>Role:</strong> ${role} (${roleDescription})</p>
					<p style="color: #4a4a4a; font-size: 14px;"><strong>Invited by:</strong> ${invitedByEmail}</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${inviteUrl}" style="display: inline-block; background-color: #7979ff; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
					</div>
					<p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
					<p style="color: #7979ff; font-size: 14px; word-break: break-all;">${inviteUrl}</p>
					<p style="color: #666; font-size: 14px; margin-top: 20px;">This invitation will expire in 7 days.</p>
					<p style="color: #666; font-size: 14px;">If you weren't expecting this invitation, please ignore this email.</p>
					<hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
					<p style="color: #999; font-size: 12px;">firmly.ai</p>
				</div>
			`
		},
		apiKey
	);
}
