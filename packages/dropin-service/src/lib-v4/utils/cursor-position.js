/**
 * Restores cursor position after input formatting (e.g., credit cards, phone numbers, dates)
 *
 * @param {HTMLInputElement} inputElement - The input element
 * @param {string} oldValue - Value before formatting
 * @param {string} newValue - Value after formatting
 * @param {number} cursorPosition - Original cursor position
 */
export function restoreCursorPosition(inputElement, oldValue, newValue, cursorPosition) {
	// Early return if restoration is not needed
	if (!inputElement || oldValue === newValue || cursorPosition == null) return;

	requestAnimationFrame(() => {
		// Count digits before cursor in old value
		const digitsBefore = oldValue.slice(0, cursorPosition).replace(/\D/g, '').length;

		// Find position after same number of digits in new value
		let newCursorPosition = 0;
		let digitCount = 0;

		for (let i = 0; i < newValue.length; i++) {
			if (/\d/.test(newValue[i])) {
				digitCount++;
			}
			if (digitCount >= digitsBefore) {
				newCursorPosition = i + 1;
				break;
			}
		}

		inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
	});
}
