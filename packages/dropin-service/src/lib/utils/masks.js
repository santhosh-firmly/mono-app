export function phoneMask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		// Remove any non-digit characters from the input
		const digits = value.replace(/\D/g, '');

		// Handle different lengths of input progressively
		if (digits.length === 0) return '';
		if (digits.length === 1) return `(${digits}`;
		if (digits.length === 2) return `(${digits}`;
		if (digits.length === 3) return `(${digits})`;
		if (digits.length > 3 && digits.length < 6)
			return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		if (digits.length >= 6 && digits.length < 10) {
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
		}

		// Handle 11 digits (with country code)
		if (digits.length >= 10) {
			const hasCountryCode = digits.length === 11;
			if (hasCountryCode) {
				return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
			}
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
		}

		return digits;
	}

	return value;
}

export function phoneUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

export function zipCodeMask(value, { locale = 'en-US' } = {}) {
	// example: 12345-1234, 12345
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';
		if (digits.length <= 5) return digits;
		if (digits.length > 5) {
			return `${digits.slice(0, 5)}-${digits.slice(5)}`;
		}
		return digits;
	}

	return value;
}

export function zipCodeUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

export function creditCardMask(value, { locale = 'en-US' } = {}) {
	// example: 1234, 1234 5678, 1234 5678 9012, 1234 5678 9012 3456
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';

		// Split into groups of 4 and join with spaces
		const groups = digits.match(/.{1,4}/g) || [];
		return groups.join(' ');
	}
	return value;
}

export function creditCardUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

export function monthYearMask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';
		if (digits.length <= 2) return digits;
		return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
	}

	return value;
}

export function monthYearUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}
