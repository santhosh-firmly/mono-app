/**
 * DOM Automation Utilities
 *
 * Functions for programmatic DOM interaction (typing, clicking, waiting).
 * Used by the flow player for automated checkout demos.
 */

/**
 * Delays execution for a specified time.
 * @param {number} ms - Milliseconds to wait
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<void>} Resolves after delay or rejects on abort
 */
export const sleep = (ms, signal) =>
	new Promise((resolve, reject) => {
		const timeout = setTimeout(resolve, ms);
		signal?.addEventListener('abort', () => {
			clearTimeout(timeout);
			const error = new Error('Aborted');
			error.name = 'AbortError';
			reject(error);
		});
	});

/**
 * Types text into an input element with realistic key events.
 * @param {HTMLInputElement} element - The input element to type into
 * @param {string} text - The text to type
 * @param {Object} [options] - Typing options
 * @param {number} [options.delay=30] - Delay between keystrokes (ms)
 * @param {boolean} [options.clear=true] - Clear existing value first
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<void>}
 */
export async function typeIntoElement(element, text, options = {}) {
	const { delay = 30, clear = true, signal } = options;

	element.focus();

	if (clear) {
		element.value = '';
		element.dispatchEvent(
			new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' })
		);
	}

	for (const char of text) {
		const keyCode = char.charCodeAt(0);
		const isLetter = /[a-zA-Z]/.test(char);
		const code = isLetter ? `Key${char.toUpperCase()}` : `Digit${char}`;

		element.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: char,
				code,
				keyCode,
				charCode: keyCode,
				bubbles: true,
				cancelable: true
			})
		);

		element.value += char;

		element.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				inputType: 'insertText',
				data: char
			})
		);

		element.dispatchEvent(
			new KeyboardEvent('keyup', {
				key: char,
				code,
				keyCode,
				charCode: keyCode,
				bubbles: true
			})
		);

		await sleep(delay, signal);
	}

	element.dispatchEvent(new Event('change', { bubbles: true }));
	element.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
}

/**
 * Simulates a click on an element with mouse events.
 * @param {HTMLElement} element - The element to click
 */
export function clickElement(element) {
	element.focus();
	element.dispatchEvent(
		new MouseEvent('mousedown', {
			bubbles: true,
			cancelable: true,
			view: window
		})
	);
	element.dispatchEvent(
		new MouseEvent('mouseup', {
			bubbles: true,
			cancelable: true,
			view: window
		})
	);
	element.dispatchEvent(
		new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window
		})
	);
}

/**
 * Waits for an element matching the selector to appear.
 * @param {string} selector - CSS selector(s) to find (comma-separated)
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=5000] - Max wait time (ms)
 * @param {Document|Element} [options.container=document] - Search container
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<Element>} The found element
 * @throws {Error} If element not found within timeout
 */
export async function waitForElement(selector, options = {}) {
	const { timeout = 5000, container = document, signal } = options;
	const start = Date.now();

	while (Date.now() - start < timeout) {
		if (signal?.aborted) {
			const error = new Error('Aborted');
			error.name = 'AbortError';
			throw error;
		}

		const selectors = selector.split(',').map((s) => s.trim());

		for (const sel of selectors) {
			const element = container.querySelector(sel);
			if (element && element.offsetParent !== null) {
				return element;
			}
		}

		await sleep(100, signal);
	}

	throw new Error(`Element "${selector}" not found within ${timeout}ms`);
}

/**
 * Waits for specific text to appear in the container.
 * @param {string} text - The text to search for
 * @param {Object} [options] - Wait options
 * @param {number} [options.timeout=5000] - Max wait time (ms)
 * @param {Document|Element} [options.container=document] - Search container
 * @param {AbortSignal} [options.signal] - Abort signal
 * @returns {Promise<boolean>} True when text is found
 * @throws {Error} If text not found within timeout
 */
export async function waitForText(text, options = {}) {
	const { timeout = 5000, container = document, signal } = options;
	const start = Date.now();

	while (Date.now() - start < timeout) {
		if (signal?.aborted) {
			const error = new Error('Aborted');
			error.name = 'AbortError';
			throw error;
		}

		if (container.textContent?.includes(text)) {
			return true;
		}
		await sleep(100, signal);
	}

	throw new Error(`Text "${text}" not found within ${timeout}ms`);
}

/**
 * Finds an element by its text content (case-insensitive).
 * @param {Document|Element} container - Container to search within
 * @param {string} tagName - HTML tag name to search for
 * @param {string} text - Text to match (partial, case-insensitive)
 * @returns {Element|null} The matching element or null
 */
export function findElementByText(container, tagName, text) {
	const elements = container.querySelectorAll(tagName);

	for (const el of elements) {
		if (el.textContent?.toLowerCase().includes(text.toLowerCase())) {
			return el;
		}
	}

	return null;
}
