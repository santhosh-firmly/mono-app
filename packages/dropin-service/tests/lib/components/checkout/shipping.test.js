import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Shipping from '$lib/components/checkout/shipping.svelte';

describe('Shipping', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders as a container div', () => {
		const { container } = render(Shipping);

		const wrapper = container.querySelector('div');
		expect(wrapper).toBeInTheDocument();
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
		expect(wrapper).toHaveClass('gap-4');
	});

	it('renders with flex column layout', () => {
		const { container } = render(Shipping);

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex-col');
	});
});
