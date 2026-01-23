/**
 * Svelte action that detects browser autofill events on form inputs.
 * Listens for CSS animation triggers to detect when autofill occurs.
 * @param {HTMLElement} node - The DOM element to monitor
 * @param {Function} [callback] - Function called when autofill is detected
 * @returns {{ destroy: Function }} Cleanup object for the action
 */
export function autofillDetection(node, callback) {
	function handleAnimationStart(e) {
		if (e.animationName.includes('autofill-in')) {
			callback?.();
		}
	}

	node.addEventListener('animationstart', handleAnimationStart);

	return {
		destroy() {
			node.removeEventListener('animationstart', handleAnimationStart);
		}
	};
}
