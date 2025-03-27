// Calculate relative luminance using sRGB coefficients
export function getLuminance(hex) {
	// Convert hex to RGB
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;

	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
