function isButtonInFirstRow(button, containerBounds) {
	return button.getBoundingClientRect().top - containerBounds.top < 10;
}

function isButtonOverflowingContainer(button, boundsRight) {
	return button.getBoundingClientRect().right > boundsRight;
}

/**
 * Calculate visible count when all buttons are in DOM
 * @param {HTMLElement} container - The filter row container
 * @returns {number} Number of buttons that can be visible
 */
export function calculateVisibleCountFromDOM(container, allButtons) {
	if (!container) return 0;

	const containerBounds = container.getBoundingClientRect();

	// Can we fit all buttons in the container?
	const canFitAllButtons = allButtons.every(
		(button) =>
			!isButtonOverflowingContainer(button, containerBounds.right) &&
			isButtonInFirstRow(button, containerBounds)
	);
	if (canFitAllButtons) {
		return allButtons.length;
	}

	// If not, we need to calculate how many buttons must be hidden so the more filters button is in the first row.
	const moreFiltersButton = container.querySelector('.more-filters-button');
	const moreFiltersButtonRight = moreFiltersButton.getBoundingClientRect().right;
	const lastFilterButtonRight = allButtons[allButtons.length - 1].getBoundingClientRect().right;

	let buffer = moreFiltersButtonRight - lastFilterButtonRight;

	if (buffer < 0) {
		// If the buffer is less than 0, it means the "more filters" button is not in the first row.
		buffer = moreFiltersButtonRight - containerBounds.left;
	}

	// Find the index of the first button that is not in the first row or is overflowing the container
	const index = allButtons.findIndex(
		(button) =>
			isButtonOverflowingContainer(button, containerBounds.right - buffer) ||
			!isButtonInFirstRow(button, containerBounds)
	);

	// If no button is found, we need to show all buttons
	return index === -1 ? allButtons.length : index;
}
