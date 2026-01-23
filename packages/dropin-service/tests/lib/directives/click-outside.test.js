import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { clickOutside } from '$lib/directives/click-outside.js';

describe('clickOutside directive', () => {
	let node;
	let outsideElement;
	let callback;
	let action;

	beforeEach(() => {
		node = document.createElement('div');
		node.id = 'target';
		outsideElement = document.createElement('div');
		outsideElement.id = 'outside';
		document.body.appendChild(node);
		document.body.appendChild(outsideElement);
		callback = vi.fn();
	});

	afterEach(() => {
		action?.destroy();
		document.body.innerHTML = '';
	});

	it('calls callback when clicking outside the node', () => {
		action = clickOutside(node, { callback });

		outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).toHaveBeenCalled();
	});

	it('does not call callback when clicking inside the node', () => {
		action = clickOutside(node, { callback });

		node.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).not.toHaveBeenCalled();
	});

	it('does not call callback when active is false', () => {
		action = clickOutside(node, { active: false, callback });

		outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).not.toHaveBeenCalled();
	});

	it('does not call callback when pointer started inside and dragged outside', () => {
		action = clickOutside(node, { callback });

		// Pointer starts inside (use Event since jsdom lacks PointerEvent)
		const pointerDown = new Event('pointerdown', { bubbles: true });
		Object.defineProperty(pointerDown, 'target', { value: node });
		node.dispatchEvent(pointerDown);

		// Click happens outside (simulating drag)
		outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).not.toHaveBeenCalled();
	});

	it('calls callback when pointer started outside', () => {
		action = clickOutside(node, { callback });

		// Pointer starts outside
		const pointerDown = new Event('pointerdown', { bubbles: true });
		Object.defineProperty(pointerDown, 'target', { value: outsideElement });
		outsideElement.dispatchEvent(pointerDown);

		// Click happens outside
		outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).toHaveBeenCalled();
	});

	it('does not call callback when event is prevented', () => {
		action = clickOutside(node, { callback });

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		event.preventDefault();
		outsideElement.dispatchEvent(event);

		expect(callback).not.toHaveBeenCalled();
	});

	it('removes event listeners on destroy', () => {
		action = clickOutside(node, { callback });
		action.destroy();

		outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).not.toHaveBeenCalled();
	});

	it('handles clicking on nested child inside node', () => {
		const child = document.createElement('span');
		node.appendChild(child);
		action = clickOutside(node, { callback });

		child.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(callback).not.toHaveBeenCalled();
	});
});
