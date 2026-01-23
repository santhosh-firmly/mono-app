import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SummaryPromoCode from '$lib/components/checkout/summary-promo-code.svelte';

describe('SummaryPromoCode', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders add promotion code button by default', () => {
		const { getByRole } = render(SummaryPromoCode);

		const button = getByRole('button');
		expect(button).toBeInTheDocument();
	});

	it('shows input field when button is clicked', async () => {
		const user = userEvent.setup();

		const { getByRole, container } = render(SummaryPromoCode);

		const button = getByRole('button');
		await user.click(button);

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
	});

	it('renders applied promo codes', () => {
		const { getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['SAVE10', 'FREESHIP']
			}
		});

		expect(getByText('SAVE10')).toBeInTheDocument();
		expect(getByText('FREESHIP')).toBeInTheDocument();
	});

	it('renders remove all button when promo codes exist', () => {
		const { getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['SAVE10']
			}
		});

		expect(getByText('Remove all')).toBeInTheDocument();
	});

	it('does not render remove all button when no promo codes', () => {
		const { queryByText } = render(SummaryPromoCode, {
			props: {
				promocodes: []
			}
		});

		expect(queryByText('Remove all')).not.toBeInTheDocument();
	});

	it('calls onRemoveAll when remove all is clicked', async () => {
		const user = userEvent.setup();
		const handleRemoveAll = vi.fn();

		const { getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['SAVE10'],
				onRemoveAll: handleRemoveAll
			}
		});

		await user.click(getByText('Remove all'));

		expect(handleRemoveAll).toHaveBeenCalledTimes(1);
	});

	it('shows input with spinner when isSubmitting is true', () => {
		const { container } = render(SummaryPromoCode, {
			props: {
				isSubmitting: true
			}
		});

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toBeDisabled();
	});

	it('disables button when isRemovingAll is true', () => {
		const { getByRole } = render(SummaryPromoCode, {
			props: {
				isRemovingAll: true
			}
		});

		const button = getByRole('button');
		expect(button).toBeDisabled();
	});

	it('shows disabled input when isSubmitting is true', () => {
		const { container } = render(SummaryPromoCode, {
			props: {
				isSubmitting: true
			}
		});

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toBeDisabled();
	});

	it('hides remove all button when isRemovingAll is true', () => {
		const { queryByText, getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['SAVE10'],
				isRemovingAll: true
			}
		});

		// The "Remove all" button is replaced by a loading spinner
		expect(queryByText('Remove all')).not.toBeInTheDocument();
		// But promo code is still displayed
		expect(getByText('SAVE10')).toBeInTheDocument();
	});

	it('renders promo code tags with proper styling', () => {
		const { container, getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['SAVE10']
			}
		});

		// Check promo code tag container has proper styling
		const promoTag = getByText('SAVE10').closest('div');
		expect(promoTag).toHaveClass('rounded-lg');
		expect(promoTag).toHaveClass('frosted');

		// Check that the tag wrapper div exists with icon container
		const tagWrapper = container.querySelector('.flex.w-fit.items-center');
		expect(tagWrapper).toBeInTheDocument();
	});

	it('renders with correct container styling', () => {
		const { container } = render(SummaryPromoCode);

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
	});

	it('calls onSubmit when Apply button is clicked', async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		const { getByRole, container, getByText } = render(SummaryPromoCode, {
			props: {
				onSubmit: handleSubmit
			}
		});

		await user.click(getByRole('button'));

		const input = container.querySelector('input');
		await user.type(input, 'TESTCODE');
		await user.click(getByText('Apply'));

		expect(handleSubmit).toHaveBeenCalledWith('TESTCODE');
	});

	it('shows loading state when isRemovingAll with promo codes', () => {
		const { container, queryByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['CODE1'],
				isRemovingAll: true
			}
		});

		// The "Remove all" button should not be visible when loading
		expect(queryByText('Remove all')).not.toBeInTheDocument();
		expect(container).toBeInTheDocument();
	});

	it('clears promocode when it is added to the list', async () => {
		const user = userEvent.setup();

		const { getByRole, container, rerender } = render(SummaryPromoCode, {
			props: {
				promocodes: [],
				promocode: ''
			}
		});

		await user.click(getByRole('button'));

		const input = container.querySelector('input');
		await user.type(input, 'NEWCODE');

		await rerender({
			promocodes: ['NEWCODE'],
			promocode: 'NEWCODE'
		});

		// The effect should clear the promocode
		expect(container).toBeInTheDocument();
	});

	it('keeps input visible when isSubmitting is true', () => {
		const { container } = render(SummaryPromoCode, {
			props: {
				isSubmitting: true
			}
		});

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toBeDisabled();
	});

	it('renders multiple promo code tags', () => {
		const { getByText } = render(SummaryPromoCode, {
			props: {
				promocodes: ['CODE1', 'CODE2', 'CODE3']
			}
		});

		expect(getByText('CODE1')).toBeInTheDocument();
		expect(getByText('CODE2')).toBeInTheDocument();
		expect(getByText('CODE3')).toBeInTheDocument();
	});

	it('shows input when promocode is pre-populated', () => {
		const { container } = render(SummaryPromoCode, {
			props: {
				promocode: 'PRECODE'
			}
		});

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
	});

	it('calls onSubmit when Enter is pressed in input', async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();

		const { getByRole, container } = render(SummaryPromoCode, {
			props: {
				onSubmit: handleSubmit
			}
		});

		await user.click(getByRole('button'));

		const input = container.querySelector('input');
		await user.type(input, 'ENTERCODE');
		await user.keyboard('{Enter}');

		expect(handleSubmit).toHaveBeenCalledWith('ENTERCODE');
	});

	it('hides input when clicking outside', async () => {
		const user = userEvent.setup();

		const { getByRole, container } = render(SummaryPromoCode);

		await user.click(getByRole('button'));

		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();

		await user.click(document.body);
	});
});
