/**
 * Color Utilities
 *
 * Functions for color calculations and transformations.
 */

/**
 * Calculates the relative luminance of a hex color.
 * @param {string} hex - Hex color code (e.g., #ffffff)
 * @returns {number} Luminance value (0-1) where 0 is dark and 1 is light
 */
export function getLuminance(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
