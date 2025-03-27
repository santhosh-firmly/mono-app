export function clickOutside(node, { active = true, callback }) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			callback(event);
		}
	};

	if (active) {
		document.addEventListener('click', handleClick, true);
	}

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
