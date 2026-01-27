import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { autofillDetection } from '$lib/directives/autofill-detection.js';

describe('autofillDetection directive', () => {
	let node;
	let callback;
	let action;

	beforeEach(() => {
		node = document.createElement('input');
		document.body.appendChild(node);
		callback = vi.fn();
	});

	afterEach(() => {
		action?.destroy();
		document.body.innerHTML = '';
	});

	function createAnimationEvent(animationName) {
		const event = new Event('animationstart', { bubbles: true });
		event.animationName = animationName;
		return event;
	}

	it('calls callback when autofill animation starts', () => {
		action = autofillDetection(node, callback);

		node.dispatchEvent(createAnimationEvent('autofill-in'));

		expect(callback).toHaveBeenCalled();
	});

	it('does not call callback for other animations', () => {
		action = autofillDetection(node, callback);

		node.dispatchEvent(createAnimationEvent('fade-in'));

		expect(callback).not.toHaveBeenCalled();
	});

	it('handles null callback gracefully', () => {
		action = autofillDetection(node, null);

		expect(() => node.dispatchEvent(createAnimationEvent('autofill-in'))).not.toThrow();
	});

	it('handles undefined callback gracefully', () => {
		action = autofillDetection(node, undefined);

		expect(() => node.dispatchEvent(createAnimationEvent('autofill-in'))).not.toThrow();
	});

	it('handles animation name containing autofill-in as part of longer name', () => {
		action = autofillDetection(node, callback);

		node.dispatchEvent(createAnimationEvent('custom-autofill-in-animation'));

		expect(callback).toHaveBeenCalled();
	});

	it('removes event listener on destroy', () => {
		action = autofillDetection(node, callback);
		action.destroy();

		node.dispatchEvent(createAnimationEvent('autofill-in'));

		expect(callback).not.toHaveBeenCalled();
	});
});
