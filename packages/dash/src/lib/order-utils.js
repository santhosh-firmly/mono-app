/**
 * Masks sensitive data like emails and phone numbers for display.
 * @param {string} hashedValue - The value to mask
 * @returns {string} The masked value
 */
export function displayFromHash(hashedValue) {
	if (!hashedValue) return 'N/A';
	return hashedValue.replace(/-.*?-/, ' *** ').replace(/-.*?@/, '***@');
}

/**
 * Extracts the product image URL from a line item.
 * @param {object} item - The line item object
 * @returns {string|undefined} The image URL if available
 */
export function getProductImage(item) {
	return item.image?.url;
}
