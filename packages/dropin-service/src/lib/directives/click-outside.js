/**
 * Svelte action that triggers a callback when a click occurs outside the specified node.
 *
 * @param {HTMLElement} node - The element to detect outside clicks for
 * @param {Object} options - Configuration options
 * @param {boolean} [options.active=true] - Whether the click-outside detection is active
 * @param {Function} options.callback - Function to call when an outside click is detected
 * @returns {Object} Svelte action lifecycle object with destroy method
 *
 * @example
 * <div use:clickOutside={{ callback: handleOutsideClick }}>
 *   Content
 * </div>
 */
export function clickOutside(node, { active = true, callback }) {
	let isPointerInsideReactiveArea = false;

	/**
	 * Tracks where the pointer interaction started.
	 * This prevents the modal from closing when users select text inside
	 * and drag outside (the click event would fire outside, but we know
	 * the interaction originated inside).
	 */
	const handlePointerDown = (event) => {
		isPointerInsideReactiveArea = node.contains(event.target);
	};

	/**
	 * Handles click events and triggers the callback only for intentional outside clicks.
	 *
	 * Conditions for triggering the callback:
	 * - node exists (defensive check)
	 * - click target is outside the node
	 * - event hasn't been prevented by another handler
	 * - the pointer interaction did NOT start inside the node (prevents text selection drag issues)
	 */
	const handleClick = (event) => {
		if (
			node &&
			!node.contains(event.target) &&
			!event.defaultPrevented &&
			!isPointerInsideReactiveArea
		) {
			callback(event);
		}
	};

	if (active) {
		document.addEventListener('pointerdown', handlePointerDown, true);
		document.addEventListener('click', handleClick, true);
	}

	return {
		destroy() {
			document.removeEventListener('pointerdown', handlePointerDown, true);
			document.removeEventListener('click', handleClick, true);
		}
	};
}
