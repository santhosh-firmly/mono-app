/**
 * Email validation utility for blocking free/common email providers
 */

const BLOCKED_DOMAINS = [
	// Major free email providers
	'gmail.com',
	'googlemail.com',
	'yahoo.com',
	'yahoo.co.uk',
	'yahoo.fr',
	'yahoo.de',
	'yahoo.it',
	'yahoo.es',
	'yahoo.ca',
	'yahoo.com.br',
	'yahoo.co.in',
	'yahoo.co.jp',
	'hotmail.com',
	'hotmail.co.uk',
	'hotmail.fr',
	'hotmail.de',
	'hotmail.it',
	'hotmail.es',
	'outlook.com',
	'outlook.co.uk',
	'live.com',
	'live.co.uk',
	'msn.com',
	'aol.com',
	'aol.co.uk',
	'icloud.com',
	'me.com',
	'mac.com',
	'mail.com',
	'email.com',
	'usa.com',
	'protonmail.com',
	'proton.me',
	'pm.me',
	'zoho.com',
	'zohomail.com',
	'yandex.com',
	'yandex.ru',
	'gmx.com',
	'gmx.de',
	'gmx.net',
	'web.de',
	'mail.ru',
	'inbox.com',
	'fastmail.com',
	'tutanota.com',
	'tutamail.com',

	// Temporary/disposable email providers
	'mailinator.com',
	'guerrillamail.com',
	'guerrillamail.net',
	'guerrillamail.org',
	'sharklasers.com',
	'grr.la',
	'guerrillamail.biz',
	'tempmail.com',
	'temp-mail.org',
	'throwaway.email',
	'throwawaymail.com',
	'10minutemail.com',
	'10minmail.com',
	'minutemail.com',
	'yopmail.com',
	'yopmail.fr',
	'trashmail.com',
	'trashmail.net',
	'dispostable.com',
	'mailnesia.com',
	'maildrop.cc',
	'getnada.com',
	'fakeinbox.com',
	'tempail.com',
	'mohmal.com',
	'discard.email',
	'mailcatch.com',
	'mytrashmail.com',
	'spamgourmet.com'
];

/**
 * Check if an email domain is blocked
 * @param {string} email - The email address to check
 * @returns {boolean} - True if the domain is blocked
 */
function isBlockedEmailDomain(email) {
	if (!email || typeof email !== 'string') {
		return false;
	}
	const domain = email.split('@')[1]?.toLowerCase();
	if (!domain) {
		return false;
	}
	return BLOCKED_DOMAINS.includes(domain);
}

/**
 * Validate that an email is a business email (not from a blocked domain)
 * @param {string} email - The email address to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export function validateBusinessEmail(email) {
	if (!email || typeof email !== 'string') {
		return { valid: false, error: 'Email address is required' };
	}

	if (!email.includes('@')) {
		return { valid: false, error: 'Invalid email address format' };
	}

	if (isBlockedEmailDomain(email)) {
		return {
			valid: false,
			error: 'Please use a business email address. Free email providers are not allowed.'
		};
	}

	return { valid: true };
}
