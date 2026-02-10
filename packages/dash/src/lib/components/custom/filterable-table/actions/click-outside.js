/**
 * Click outside action for Svelte
 * Calls the provided function when a click happens outside the element
 */
export function clickOutside(node, callback) {
	function handleClick(event) {
		if (!node.contains(event.target)) {
			callback(event);
		}
	}

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
