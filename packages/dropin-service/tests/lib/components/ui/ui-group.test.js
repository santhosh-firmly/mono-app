import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UiGroup from '$lib/components/ui/group.svelte';

describe('UiGroup', () => {
	it('renders vertical group by default', () => {
		const { container } = render(UiGroup, {
			props: {
				horizontal: false
			}
		});

		const group = container.querySelector('.input-group');
		expect(group).toBeInTheDocument();
		expect(group).not.toHaveClass('horizontal');
	});

	it('renders horizontal group when horizontal prop is true', () => {
		const { container } = render(UiGroup, {
			props: {
				horizontal: true
			}
		});

		const group = container.querySelector('.input-group');
		expect(group).toHaveClass('horizontal');
	});
});
