<script>
	// @ts-nocheck
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import PromoCodes from './promo-codes.svelte';
	import { userEvent, waitFor, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';
	import './theme.scss';
</script>

<Meta title="Checkout V4/Checkout/Promo Codes" component={PromoCodes} tags={['autodocs']} />

<Template let:args>
	<div class="adoreme-dark bg-fy-primary rounded-lg p-8">
		<PromoCodes {...args} />
	</div>
</Template>

<Story
	name="Default"
	args={{
		addPromoCodeCallback: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 2000); // 2000 milliseconds = 2 seconds
			});
		},
		clearPromoCodesCallback: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 2000); // 2000 milliseconds = 2 seconds
			});
		}
	}}
/>

<Story
	name="Add promo code"
	args={{
		addPromoCodeCallback: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 2000); // 2000 milliseconds = 2 seconds
			});
		},
		clearPromoCodesCallback: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 2000); // 2000 milliseconds = 2 seconds
			});
		}
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step('Insert valid promocode', async () => {
			const addPromoCodeButton = canvas.getByTestId('add-promo-code-button');
			await userEvent.click(addPromoCodeButton);

			let promoCodeInput;

			await waitFor(() => {
				promoCodeInput = canvas.getByTestId('promo-code-input');
				expect(promoCodeInput).toBeInTheDocument();
			});

			await userEvent.keyboard('VALID_PROMO_CODE');

			const applyPromoCodeButton = canvas.getByTestId('apply-promo-code-button');
			await userEvent.click(applyPromoCodeButton);
		});
	}}
/>

<Story
	name="Clear promo codes"
	args={{
		clearPromoCodesCallback: () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, 1000); // 1000 milliseconds = 1 seconds
			});
		},
		coupons: ['VALID_PROMO_CODE']
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Remove promo code', async () => {
			await waitFor(
				() => expect(canvas.getByTestId('remove-promo-codes-button')).toBeInTheDocument(),
				{
					timeout: 4000
				}
			);

			const removePromoCodesButton = canvas.getByTestId('remove-promo-codes-button');
			await userEvent.click(removePromoCodesButton);
		});
	}}
/>

<Story
	name="Insert invalid promo code"
	args={{
		addPromoCodeCallback: () => {
			throw Error();
		},
		clearPromoCodesCallback: () => {
			throw Error();
		}
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step('Insert wrong promocode', async () => {
			const addPromoCodeButton = canvas.getByTestId('add-promo-code-button');
			await userEvent.click(addPromoCodeButton);

			let promoCodeInput;

			await waitFor(() => {
				promoCodeInput = canvas.getByTestId('promo-code-input');
				expect(promoCodeInput).toBeInTheDocument();
			});

			await userEvent.keyboard('WRONG_PROMO_CODE');

			const applyPromoCodeButton = canvas.getByTestId('apply-promo-code-button');
			await userEvent.click(applyPromoCodeButton);

			expect(canvas.getByTestId('promo-code-error')).toBeInTheDocument();
		});
	}}
/>

<Story
	name="Single Promo code applied"
	args={{
		coupons: ['coupon1']
	}}
/>

<Story
	name="Several Promo codes applied"
	args={{
		coupons: ['coupon1', 'coupon2', 'coupon3', 'coupon4', 'coupon5', 'coupon6', 'coupon7']
	}}
/>

<Story
	name="Clearing promo codes"
	args={{
		coupons: ['coupon1', 'coupon2', 'coupon3', 'coupon4', 'coupon5', 'coupon6', 'coupon7']
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step('Clear promo codes', async () => {
			await waitFor(
				() => expect(canvas.getByTestId('remove-promo-codes-button')).toBeInTheDocument(),
				{
					timeout: 4000
				}
			);

			const removePromoCodesButton = canvas.getByTestId('remove-promo-codes-button');
			await userEvent.click(removePromoCodesButton);
		});
	}}
/>
