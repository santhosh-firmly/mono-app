<script>
	// @ts-nocheck

	import FlowSinglePage from '../flow-single-page.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import { writable } from 'svelte/store';
	import { rest } from 'msw';
	import '$lib/browser/api-firmly';
	import { expect } from '@storybook/jest';
	import {
		userEvent,
		waitFor,
		waitForElementToBeRemoved,
		within
	} from '@storybook/testing-library';

	let isOrderPlaced;

	const cartData = {
		display_name: 'Firmly Test Store',
		cart_status: 'active',
		platform_id: 'shopify',
		shop_id: 'firmlyai.myshopify.com',
		cart_id: 'caadd7be-d20d-43d3-a8ba-4800d6aed125',
		urls: {},
		line_items: [
			{
				line_item_id: '7c03330e-d2b9-41bd-9d46-49bd047e370c',
				sku: '44086251946232',
				base_sku: '8150885859576',
				quantity: 5,
				msrp: {
					currency: 'USD',
					value: 15
				},
				price: {
					currency: 'USD',
					value: 1
				},
				line_price: {
					currency: 'USD',
					value: 5
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_large.webp?v=1697915810',
					large:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_large.webp?v=1697915810',
					grande:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_grande.webp?v=1697915810',
					medium:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_medium.webp?v=1697915810',
					compact:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_compact.webp?v=1697915810',
					small:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Hooded_Sweatshirt-Women-White-Front1_1024x1024_2x_31a64276-5339-4cce-b272-16e7ee6d3e59_small.webp?v=1697915810'
				},
				platform_line_item_id: 'fbedee7487108c782231de926566c421',
				description: 'White Hoodie',
				variant_description: 'XL'
			},
			{
				line_item_id: '90d89dc8-8246-4339-8d24-482cb7c62fe8',
				sku: '44086284812536',
				base_sku: '8150908403960',
				quantity: 10,
				msrp: {
					currency: 'USD',
					value: 10
				},
				price: {
					currency: 'USD',
					value: 0.8
				},
				line_price: {
					currency: 'USD',
					value: 8
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_large.webp?v=1697916407',
					large:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_large.webp?v=1697916407',
					grande:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_grande.webp?v=1697916407',
					medium:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_medium.webp?v=1697916407',
					compact:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_compact.webp?v=1697916407',
					small:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/files/Baby_Jersey_Bodysuit-Front_1024x1024_2x_ec583b61-8518-4b65-a9ea-66a79360435d_small.webp?v=1697916407'
				},
				platform_line_item_id: '3d4672b319b5b59b382b0113fd9c7650',
				description: 'Baby Jersey Bodysuit White',
				variant_description: '6 months'
			}
		],
		sub_total: {
			currency: 'USD',
			value: 13
		},
		cart_discount: {
			currency: 'USD',
			value: 0
		},
		shipping_total: {
			currency: 'USD',
			value: 4.9
		},
		tax: {
			currency: 'USD',
			value: 1.82
		},
		total: {
			currency: 'USD',
			value: 19.72
		},
		shipping_method_options: [
			{
				sku: 'shopify-Economy-0.00',
				description: 'Economy',
				price: {
					currency: 'USD',
					value: 0
				},
				estimated_delivery: '5 to 8 business days'
			},
			{
				sku: 'shopify-Standard-4.90',
				description: 'Standard',
				price: {
					currency: 'USD',
					value: 4.9
				},
				estimated_delivery: '3 to 4 business days'
			}
		],
		shipping_method: {
			sku: 'shopify-Standard-4.90',
			description: 'Standard',
			price: {
				currency: 'USD',
				value: 4.9
			},
			estimated_delivery: '3 to 4 business days'
		},
		shipping_info_options: [
			{
				first_name: 'Romeu',
				last_name: 'Gouvea',
				phone: '+5535988782143',
				address1: '7367 126th Place Southeast',
				city: 'Newcastle',
				state_or_province: 'WA',
				country: 'US',
				postal_code: '98056',
				email: 'romeo@firmly.ai'
			}
		],
		shipping_info: {
			first_name: 'Romeu',
			last_name: 'Gouvea',
			phone: '5535988782143',
			address1: '7367 126th Place Southeast',
			city: 'Newcastle',
			state_or_province: 'WA',
			state_name: 'Washington',
			country: 'United States',
			postal_code: '98056',
			email: 'romeo@firmly.ai'
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			},
			{
				type: 'PayPal',
				wallet: 'paypal'
			},
			{
				type: 'CreditCard',
				art: '',
				id: '213879546',
				wallet: 'shoppay',
				last_four: '5726',
				month: 4,
				year: 2025,
				card_type: 'master',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Gouvea',
					address1: '7367 126th Place Southeast',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+5535988782143'
				}
			}
		],
		payment_handle:
			'e90fea27-1dab-46be-a1fc-ab35153b478a|/1BnnCI8xQEvdOE5wwaIT7/s6HyST7i6Hv/CaQB0i6Vo+ZXzgPpbklBUtFwGyT8cUgLxMc/PZRnbTaZKDEsSPl3yUqYkpu/acai70l6/0croo8FaPHoU5kNCPlE+YKLcGQ5t167JuAjNnxxSK63X9TzUT7VJcbnLJ4daCded2365p+6sqvbTCoWtfEHK9xHWO5YHq+r7Kfbwc7oGDKrW7vKcFKQrYyWGz7+yl5KTwBrvzUdpadna4/42dOo8Blu7fCk8iL20mdYSS+6b25kkEAy/2vHKYPCjMovi2nOqxV3nCtmYx/bzHBFBSt/8ycwWhH0Y/KHS87/Wkx+7ahdJZkdAjm5MUtIBRXIM'
	};

	const cartDataWithCoupon = {
		...cartData,
		cart_discount: {
			currency: 'USD',
			value: 4.9
		},
		shipping_total: {
			currency: 'USD',
			value: 0
		},
		tax: {
			currency: 'USD',
			value: 0
		},
		total: {
			currency: 'USD',
			value: 13
		},
		coupons: ['FREESHIPPING']
	};

	const cart = writable(cartData);
</script>

<Meta
	title="Checkout V4/Use Cases/Using Promo Codes"
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Applying coupons with apply button"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Type promo code', async () => {
			const addPromoButton = canvas.getByTestId('add-promo-code-button');
			addPromoButton.click();
			await user.keyboard('FREESHIPPING');
		});

		await step('Click on Apply', async () => {
			const applyPromoButton = canvas.getByTestId('apply-promo-code-button');
			applyPromoButton.click();
		});

		await step('Verify if promo code is shown', async () => {
			// Wait for some coupon to show up in in the screen
			await waitFor(() => canvas.getByTestId('add-promo-code-button'), {
				timeout: 4000
			});

			const promoCodes = canvas.getAllByTestId('applied-promo-code');
			expect(promoCodes.some((e) => e.innerText === 'FREESHIPPING')).toBe(true);

			const clearPromoButton = canvas.getByTestId('remove-promo-codes-button');
			expect(clearPromoButton).toBeInTheDocument();
		});

		await step('Clear promo codes', async () => {
			const clearPromoButton = canvas.getByTestId('remove-promo-codes-button');
			clearPromoButton.click();
		});

		await step('Verify if promo codes were removed', async () => {
			await waitForElementToBeRemoved(() => canvas.queryByText('FREESHIPPING'), {
				timeout: 4000
			});
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				rest.get('*/cart/consents', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							consents: [
								{
									id: '71b35917-7de4-4b3e-b421-bc37f80f38ce',
									ui_slot: 'ABOVE_PLACE_ORDER_BUTTON',
									text: 'Keep me up to date on news and exclusive offers! I agree to the %fterms{"text": "Text Terms"}%, and consent to receive recurring automated marketing texts from on behalf of Adore Me, at the phone number provided. Consent is not a condition of any purchase. Reply STOP to stop. Msg & data rates may apply.\n',
									type: 'marketing',
									explicit: true,
									rich_text: false,
									required: false,
									revokable: true,
									signed: false
								}
							]
						})
					);
				}),
				rest.post('*/cart/promo-codes', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(cartDataWithCoupon));
				}),
				rest.delete('*/cart/promo-codes', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(cartData));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} {isOrderPlaced} />
</Story>

<Story
	name="Applying coupons with Enter"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Type promo code', async () => {
			const addPromoButton = canvas.getByTestId('add-promo-code-button');
			addPromoButton.click();
			await user.keyboard('FREESHIPPING{enter}');
		});

		await step('Verify if promo code is shown', async () => {
			// Wait for some coupon to show up in in the screen
			await waitFor(() => canvas.getByTestId('add-promo-code-button'), {
				timeout: 4000
			});

			const promoCodes = canvas.getAllByTestId('applied-promo-code');
			expect(promoCodes.some((e) => e.innerText === 'FREESHIPPING')).toBe(true);

			const clearPromoButton = canvas.getByTestId('remove-promo-codes-button');
			expect(clearPromoButton).toBeInTheDocument();
		});

		await step('Clear promo codes', async () => {
			const clearPromoButton = canvas.getByTestId('remove-promo-codes-button');
			clearPromoButton.click();
		});

		await step('Verify if promo codes were removed', async () => {
			await waitForElementToBeRemoved(() => canvas.queryByText('FREESHIPPING'), {
				timeout: 4000
			});
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				rest.get('*/cart/consents', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							consents: [
								{
									id: '71b35917-7de4-4b3e-b421-bc37f80f38ce',
									ui_slot: 'ABOVE_PLACE_ORDER_BUTTON',
									text: 'Keep me up to date on news and exclusive offers! I agree to the %fterms{"text": "Text Terms"}%, and consent to receive recurring automated marketing texts from on behalf of Adore Me, at the phone number provided. Consent is not a condition of any purchase. Reply STOP to stop. Msg & data rates may apply.\n',
									type: 'marketing',
									explicit: true,
									rich_text: false,
									required: false,
									revokable: true,
									signed: false
								}
							]
						})
					);
				}),
				rest.post('*/cart/promo-codes', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.delay(1000), ctx.json(cartDataWithCoupon));
				}),
				rest.delete('*/cart/promo-codes', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.delay(1000), ctx.json(cartData));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} {isOrderPlaced} />
</Story>
