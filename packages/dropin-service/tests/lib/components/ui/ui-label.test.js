import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UiLabel from '$lib/components/ui/label.svelte';

describe('UiLabel', () => {
	it('renders label text', () => {
		const { getByText } = render(UiLabel, {
			props: {
				label: 'Input Label'
			}
		});

		const label = getByText('Input Label');
		expect(label).toBeInTheDocument();
	});

	it('displays error message with correct styling', () => {
		const { getByText } = render(UiLabel, {
			props: {
				label: 'Input Label',
				errorMessage: 'This field is required'
			}
		});

		const errorMsg = getByText('This field is required');

		expect(errorMsg).toBeInTheDocument();
		expect(errorMsg).toHaveClass('text-danger');
	});
});
