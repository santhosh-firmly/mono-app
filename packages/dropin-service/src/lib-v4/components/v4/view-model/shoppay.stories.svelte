<script>
	// @ts-nocheck

	import ShopPay from './shoppay.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import FlowSinglePage from '../flow-single-page.svelte';
	import { http } from 'msw';
	import { userEvent, waitFor, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';

	import '../theme.scss';
	import Shoppay from './shoppay.svelte';
	import { writable } from 'svelte/store';

	const cartData = {
		display_name: 'Young Rebelz',
		cart_status: 'active',
		platform_id: 'shopify',
		shop_id: 'youngrebelz.com',
		shop_properties: {
			paypal: {
				clientId:
					'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
				merchantId: 'kumar@harrysholding.com'
			}
		},
		cart_id: '7f43d396-e3f7-4efb-8be3-dfc357cd0a4c',
		urls: {},
		line_items: [
			{
				line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4790',
				sku: '29227235868724',
				base_sku: '3796148518964',
				quantity: 2,
				msrp: {
					currency: 'USD',
					value: 6.5
				},
				price: {
					currency: 'USD',
					value: 6.5
				},
				line_price: {
					currency: 'USD',
					value: 13
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					large:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					grande:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_grande.jpg?v=1565574386',
					medium:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_medium.jpg?v=1565574386',
					compact:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_compact.jpg?v=1565574386',
					small:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_small.jpg?v=1565574386'
				},
				platform_line_item_id: '310b03b0be9f37edb3ae55631fdb8c0a',
				description: 'Plant 5 : Do not order'
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
				type: 'ShopPay',
				wallet: 'shoppay'
			}
		]
	};
	const cart = writable(cartData);
</script>

<Meta title="Checkout V4/View Models/ShopPay Popup" component={ShopPay} tags={['autodocs']} />

<Template>
	<div class="h-screen w-full bg-zinc-200">
		<ShopPay
			isModalOpen={true}
			getHCaptcha={() => {
				return {
					response: 'captchafingerprint'
				};
			}}
		/>
	</div>
</Template>

<Story name="Default">
	<FlowSinglePage />
	<ShopPay
		isModalOpen={true}
		getHCaptcha={() => {
			return {
				response: 'captchafingerprint'
			};
		}}
	/>
</Story>

<Story
	name="Error issuing OTP"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type email and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);

			await waitFor(() => expect(canvas.getByTestId('email-error')).toBeInTheDocument(), {
				timeout: 4000
			});
			const emailError = canvas.getByTestId('email-error');
			await expect(emailError).toBeInTheDocument();
			await expect(emailError.innerText).toEqual('User does not exist on Shop Pay.');
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
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
				http.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
						ctx.status(404),
						ctx.json({
							code: 409,
							error: 'UserNotFound',
							description: 'User does not exist on Shop Pay.'
						})
					);
				})
			]
		}
	}}
/>

<Story
	name="Invalid OTP"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type email and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);
		});

		await step('Type OTP and wait for error', async () => {
			await waitFor(() => expect(canvas.getByTestId('otp-field-0')).toBeInTheDocument(), {
				timeout: 10000
			});
			const firstOtpField = canvas.getByTestId('otp-field-0');
			await userEvent.click(firstOtpField);
			await waitFor(() => expect(document.activeElement).toBe(firstOtpField));
			await userEvent.paste('123456');

			await waitFor(() => expect(canvas.getByTestId('otp-error')).toBeInTheDocument(), {
				timeout: 10000
			});
			const otpError = canvas.getByTestId('otp-error');
			await expect(otpError).toBeInTheDocument();
			await expect(otpError.innerText).toEqual('OTP is invalid. Please try again.');
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
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
				http.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
						ctx.status(200),
						ctx.json({
							access_token: 'dummy-access-token',
							otp_destination: {
								phones: ['(•••) •••-•875']
							}
						})
					);
				}),
				http.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
						ctx.status(409),
						ctx.json({
							code: 409,
							error: 'InvalidKey',
							description: 'OTP is invalid. Please try again.'
						})
					);
				})
			]
		}
	}}
/>

<Story
	name="Successful Login"
	args={{
		cart
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type email and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getByTestId('continue-with-button');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);
		});

		await step('Type OTP and wait for success', async () => {
			await waitFor(() => expect(canvas.getByTestId('otp-field-0')).toBeInTheDocument(), {
				timeout: 10000
			});
			const firstOtpField = canvas.getByTestId('otp-field-0');
			await userEvent.click(firstOtpField);
			await waitFor(() => expect(document.activeElement).toBe(firstOtpField));
			await userEvent.paste('123456');
		});

		await step('Close Modal', async () => {
			const firstOtpField = canvas.getByTestId('close-modal-button');
			await userEvent.click(firstOtpField);
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
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
				http.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
						ctx.status(200),
						ctx.json({
							access_token: 'dummy-access-token',
							otp_destination: {
								phones: ['(•••) •••-•875']
							}
						})
					);
				}),
				http.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(
						// ctx.delay(100),
						ctx.status(200),
						ctx.json({
							status: 200,
							payment_method_options: [
								{
									type: 'CreditCard',
									art: '',
									id: '249351882',
									wallet: 'shoppay',
									last_four: '8798',
									month: 3,
									year: 2030,
									card_type: 'visa',
									billing_info: {
										first_name: 'John',
										last_name: 'Smith',
										address1: '123 Beautiful St.',
										address2: '',
										city: 'Newcastle',
										state_or_province: 'WA',
										state_name: 'Washington',
										postal_code: '98056',
										country: 'United States',
										phone: '+14255551234'
									}
								}
							],
							shipping_info_options: [
								{
									first_name: 'John',
									last_name: 'Smith',
									phone: '+14255551234',
									address1: '123 Beautiful St.',
									address2: '',
									city: 'Newcastle',
									state_or_province: 'WA',
									country: 'US',
									postal_code: '98056',
									email: 'johnsmith@example.com'
								}
							],
							access_token: 'dummy-access-token'
						})
					);
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} />
	<Shoppay
		isModalOpen={true}
		getHCaptcha={() => {
			return {
				response: 'captchafingerprint'
			};
		}}
	/>
</Story>
