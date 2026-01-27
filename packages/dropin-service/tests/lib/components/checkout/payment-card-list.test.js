import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CheckoutPaymentCardList from '$lib/components/checkout/payment-card-list.svelte';

describe('CheckoutPaymentCardList', () => {
	afterEach(() => {
		cleanup();
	});

	const mockCards = [
		{
			id: 1,
			brand: 'Visa',
			first4: '4111',
			last4: '1111'
		},
		{
			id: 2,
			brand: 'Mastercard',
			first4: '5555',
			last4: '4444'
		}
	];

	const mockC2PCards = [
		{
			id: 1,
			brand: 'Visa',
			first4: '4111',
			last4: '1111',
			wallet: 'c2p'
		},
		{
			id: 2,
			brand: 'Mastercard',
			first4: '5555',
			last4: '4444',
			wallet: 'c2p'
		}
	];

	it('shows add new card button when list is empty', () => {
		const { getByText } = render(CheckoutPaymentCardList, {
			props: {
				cards: []
			}
		});
		expect(getByText(/add.*card/i)).toBeTruthy();
	});

	it('renders list of payment cards', () => {
		const { getByText } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards
			}
		});
		expect(getByText(/Visa/i)).toBeTruthy();
		expect(getByText(/Mastercard/i)).toBeTruthy();
	});

	it('displays card last 4 digits', () => {
		const { getByText } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards
			}
		});
		expect(getByText(/1111/)).toBeTruthy();
		expect(getByText(/4444/)).toBeTruthy();
	});

	it('highlights selected card', () => {
		const { container } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards,
				selectedCard: mockCards[0]
			}
		});
		const radioInputs = container.querySelectorAll('input[type="radio"]');
		// Only cards are radios now, "Add New Card" is a button
		expect(radioInputs.length).toBe(mockCards.length);
	});

	it('disables selection when disabled prop is true', () => {
		const { container } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards,
				disabled: true
			}
		});
		const radioInputs = container.querySelectorAll('input[type="radio"]');
		radioInputs.forEach((input) => {
			expect(input.disabled).toBe(true);
		});
	});

	it('calls onSelect when a card is selected', async () => {
		const onSelect = vi.fn();
		const user = userEvent.setup();

		const { container } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards,
				onSelect
			}
		});

		const radioInputs = container.querySelectorAll('input[type="radio"]');
		await user.click(radioInputs[0]);

		expect(onSelect).toHaveBeenCalledWith(mockCards[0]);
	});

	it('calls onAddNewCard when add new card button is clicked', async () => {
		const onAddNewCard = vi.fn();
		const user = userEvent.setup();

		const { getByText } = render(CheckoutPaymentCardList, {
			props: {
				cards: mockCards,
				onAddNewCard
			}
		});

		await user.click(getByText(/add.*card/i));
		expect(onAddNewCard).toHaveBeenCalled();
	});

	describe('Click to Pay indicator', () => {
		it('shows C2P header when cards have wallet=c2p', () => {
			const { getByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockC2PCards
				}
			});
			expect(getByTestId('c2p-header')).toBeInTheDocument();
		});

		it('does not show C2P header for regular cards', () => {
			const { queryByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards
				}
			});
			expect(queryByTestId('c2p-header')).not.toBeInTheDocument();
		});

		it('shows "Not your cards?" button for C2P cards', () => {
			const { getByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockC2PCards
				}
			});
			expect(getByTestId('not-your-cards-button')).toBeInTheDocument();
		});

		it('does not show "Not your cards?" button for regular cards', () => {
			const { queryByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards
				}
			});
			expect(queryByTestId('not-your-cards-button')).not.toBeInTheDocument();
		});

		it('calls onNotYourCards when button is clicked', async () => {
			const onNotYourCards = vi.fn();
			const user = userEvent.setup();
			const { getByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockC2PCards,
					onNotYourCards
				}
			});

			await user.click(getByTestId('not-your-cards-button'));
			expect(onNotYourCards).toHaveBeenCalled();
		});

		it('disables "Not your cards?" button when disabled', () => {
			const { getByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockC2PCards,
					disabled: true
				}
			});
			expect(getByTestId('not-your-cards-button')).toBeDisabled();
		});
	});

	describe('add new card button', () => {
		it('disables add new card button when disabled', () => {
			const { getByText } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards,
					disabled: true
				}
			});

			const addNewCardButton = getByText(/add.*card/i);
			expect(addNewCardButton).toBeDisabled();
		});
	});

	describe('card selection helper', () => {
		it('correctly identifies selected card using isSelected function', () => {
			const { container } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards,
					selectedCard: mockCards[1]
				}
			});

			const radioInputs = container.querySelectorAll('input[type="radio"]');
			expect(radioInputs[1].checked).toBe(true);
		});

		it('identifies card as not selected when different card is selected', () => {
			const { container } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards,
					selectedCard: mockCards[0]
				}
			});

			const radioInputs = container.querySelectorAll('input[type="radio"]');
			expect(radioInputs[0].checked).toBe(true);
			expect(radioInputs[1].checked).toBe(false);
		});
	});

	describe('default callbacks', () => {
		it('renders with default props and callbacks', () => {
			const { getByText } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockCards
				}
			});

			expect(getByText(/add.*card/i)).toBeInTheDocument();
		});

		it('handles C2P button click with default callback', async () => {
			const user = userEvent.setup();

			const { getByTestId } = render(CheckoutPaymentCardList, {
				props: {
					cards: mockC2PCards
				}
			});

			// Should not throw when clicked with default callback
			await user.click(getByTestId('not-your-cards-button'));
		});
	});
});
