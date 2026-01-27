/**
 * Event utility functions for V5
 * Handles cross-browser event binding
 */

/**
 * Binds an event listener to an element with cross-browser support
 * @param {Element|Window} element - The element to bind the event to
 * @param {string} eventName - The name of the event (without 'on' prefix)
 * @param {Function} eventHandler - The event handler function
 * @param {boolean|Object} options - Event listener options
 * @returns {Function} Cleanup function to remove the event listener
 */
export function bindEvent(element, eventName, eventHandler, options = false) {
	if (element.addEventListener) {
		element.addEventListener(eventName, eventHandler, options);
	} else if (element.attachEvent) {
		element.attachEvent('on' + eventName, eventHandler);
	}

	return () => {
		if (element.removeEventListener) {
			element.removeEventListener(eventName, eventHandler, options);
		} else if (element.detachEvent) {
			element.detachEvent('on' + eventName, eventHandler);
		}
	};
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The debounce delay in milliseconds
 * @param {boolean} immediate - Whether to call on leading edge
 * @returns {Function} The debounced function
 */
export function debounce(func, wait, immediate = false) {
	let timeout = null;
	return function (...args) {
		const context = this;
		const callNow = immediate && !timeout;
		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}
