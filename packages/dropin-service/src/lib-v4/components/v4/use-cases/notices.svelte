<script>
	// @ts-nocheck

	import FlowSinglePage from '../flow-single-page.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import '../theme.css';
	import { writable } from 'svelte/store';
	import { http } from 'msw';
	import '$lib-v4/browser/api-firmly';
	import { expect } from '@storybook/jest';
	import { userEvent, waitFor, within } from '@storybook/testing-library';

	let isOrderPlaced;

	const cartData = {
		display_name: 'Adore Me',
		cart_status: 'active',
		platform_id: 'adoreme',
		shop_id: 'adoreme.com',
		cart_id: '9144457d-a318-4126-ad1a-05d33d9fb9b6',
		urls: {
			privacy_policy: 'https://www.adoreme.com/privacy-policy'
		},
		line_items: [
			{
				sku: 'PCT156663',
				base_sku: 'PCT156663',
				quantity: 1,
				msrp: {
					currency: 'USD',
					value: 59.95
				},
				price: {
					currency: 'USD',
					value: 59.95
				},
				line_price: {
					currency: 'USD',
					value: 59.95
				},
				line_discount: {
					currency: 'USD',
					value: 10
				},
				vip_discount: false,
				variant_handles: [
					'eyJ0eXBlIjoiQnJhIFNpemUiLCJ2YWx1ZSI6IjMyYSJ9',
					'eyJ0eXBlIjoiUGFudHkgU2l6ZSIsInZhbHVlIjoiYmlraW5pIHMifQ=='
				],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/153199.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '0',
				description: 'Kalila Unlined',
				variant_description: '32a, bikini s',
				line_item_id: '7823f304-0c6e-493e-80f7-b8ef066f2ae3'
			}
		],
		total: {
			currency: 'USD',
			value: 49.95
		},
		sub_total: {
			currency: 'USD',
			value: 59.95
		},
		shipping_total: {
			currency: 'USD',
			value: 0
		},
		tax: {
			currency: 'USD',
			value: 0
		},
		cart_discount: {
			currency: 'USD',
			value: 10
		},
		store_credit: {
			currency: 'USD',
			value: 0
		},
		available_store_credit: {
			currency: 'USD',
			value: 0
		},
		reward_points: {
			currency: 'USD',
			value: 0
		},
		available_reward_points: {
			currency: 'USD',
			value: 0
		},
		cart_discount_breakdown: [
			{
				is_vip: false,
				step: 1,
				label: '$10 OFF',
				discount: {
					currency: 'USD',
					value: 10
				}
			}
		],
		merchant_custom_data: {
			alternative_cart_details: {
				vip_option: true,
				line_items: [
					{
						sku: 'PCT156663',
						base_sku: 'PCT156663',
						quantity: 1,
						msrp: {
							currency: 'USD',
							value: 59.95
						},
						price: {
							currency: 'USD',
							value: 49.95
						},
						line_price: {
							currency: 'USD',
							value: 49.95
						},
						line_discount: {
							currency: 'USD',
							value: 19.98
						},
						variant_handles: [
							'eyJ0eXBlIjoiQnJhIFNpemUiLCJ2YWx1ZSI6IjMyYSJ9',
							'eyJ0eXBlIjoiUGFudHkgU2l6ZSIsInZhbHVlIjoiYmlraW5pIHMifQ=='
						],
						image: {
							url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/153199.jpg'
						},
						requires_shipping: true,
						platform_line_item_id: '0',
						description: 'Kalila Unlined',
						variant_description: '32a, bikini s',
						line_item_id: '7823f304-0c6e-493e-80f7-b8ef066f2ae3'
					}
				],
				total: {
					currency: 'USD',
					value: 29.97
				},
				sub_total: {
					currency: 'USD',
					value: 49.95
				},
				shipping_total: {
					currency: 'USD',
					value: 0
				},
				tax: {
					currency: 'USD',
					value: 0
				},
				cart_discount: {
					currency: 'USD',
					value: 19.98
				},
				store_credit: {
					currency: 'USD',
					value: 0
				},
				available_store_credit: {
					currency: 'USD',
					value: 0
				},
				reward_points: {
					currency: 'USD',
					value: 0
				},
				available_reward_points: {
					currency: 'USD',
					value: 0
				},
				cart_discount_breakdown: [
					{
						label: 'First VIP set 40% OFF',
						discount: {
							currency: 'USD',
							value: 19.98
						}
					}
				]
			}
		},
		session: {
			requires_login: true,
			is_email_registered: false,
			is_logged_in: false,
			cookies: [],
			accepts_otp: ['phone', 'email'],
			accepts_membership: ['vip']
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			}
		]
	};

	const cartDataWithShipping = {
		display_name: 'Adore Me',
		cart_status: 'active',
		platform_id: 'adoreme',
		shop_id: 'adoreme.com',
		cart_id: '9144457d-a318-4126-ad1a-05d33d9fb9b6',
		urls: {
			privacy_policy: 'https://www.adoreme.com/privacy-policy'
		},
		line_items: [
			{
				sku: 'PCT156663',
				base_sku: 'PCT156663',
				quantity: 1,
				msrp: {
					currency: 'USD',
					value: 59.95
				},
				price: {
					currency: 'USD',
					value: 59.95
				},
				line_price: {
					currency: 'USD',
					value: 59.95
				},
				line_discount: {
					currency: 'USD',
					value: 10
				},
				vip_discount: false,
				variant_handles: [
					'eyJ0eXBlIjoiQnJhIFNpemUiLCJ2YWx1ZSI6IjMyYSJ9',
					'eyJ0eXBlIjoiUGFudHkgU2l6ZSIsInZhbHVlIjoiYmlraW5pIHMifQ=='
				],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/153199.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '0',
				description: 'Kalila Unlined',
				variant_description: '32a, bikini s',
				line_item_id: '7823f304-0c6e-493e-80f7-b8ef066f2ae3'
			}
		],
		shipping_info: {
			email: 'romeo@firmly.ai',
			first_name: 'Romeu',
			last_name: 'Palos de Gouvea',
			phone: '4253368875',
			address1: '7367 126th PL SE',
			city: 'Newcastle',
			postal_code: '98056',
			state_or_province: 'WA',
			country: 'United States',
			state_name: 'Washington'
		},
		shipping_method: {
			sku: 'united_states_continental',
			description: 'FREE Standard Shipping',
			price: {
				currency: 'USD',
				value: 0
			},
			estimated_delivery: 'January 25 - January 30'
		},
		shipping_method_options: [
			{
				sku: 'united_states_continental',
				description: 'FREE Standard Shipping',
				price: {
					currency: 'USD',
					value: 0
				},
				estimated_delivery: 'January 25 - January 30'
			},
			{
				sku: 'priority_shipping',
				description: 'Priority Shipping',
				price: {
					currency: 'USD',
					value: 4.95
				},
				estimated_delivery: 'January 24 - January 26'
			},
			{
				sku: 'expedited_shipping',
				description: 'Express Shipping',
				price: {
					currency: 'USD',
					value: 14.95
				},
				estimated_delivery: 'January 23 - January 25'
			}
		],
		total: {
			currency: 'USD',
			value: 54.99
		},
		sub_total: {
			currency: 'USD',
			value: 59.95
		},
		shipping_total: {
			currency: 'USD',
			value: 0
		},
		tax: {
			currency: 'USD',
			value: 5.04
		},
		cart_discount: {
			currency: 'USD',
			value: 10
		},
		store_credit: {
			currency: 'USD',
			value: 0
		},
		available_store_credit: {
			currency: 'USD',
			value: 0
		},
		reward_points: {
			currency: 'USD',
			value: 0
		},
		available_reward_points: {
			currency: 'USD',
			value: 0
		},
		cart_discount_breakdown: [
			{
				is_vip: false,
				step: 1,
				label: '$10 OFF',
				discount: {
					currency: 'USD',
					value: 10
				}
			}
		],
		merchant_custom_data: {
			alternative_cart_details: {
				vip_option: true,
				line_items: [
					{
						sku: 'PCT156663',
						base_sku: 'PCT156663',
						quantity: 1,
						msrp: {
							currency: 'USD',
							value: 59.95
						},
						price: {
							currency: 'USD',
							value: 49.95
						},
						line_price: {
							currency: 'USD',
							value: 49.95
						},
						line_discount: {
							currency: 'USD',
							value: 19.98
						},
						variant_handles: [
							'eyJ0eXBlIjoiQnJhIFNpemUiLCJ2YWx1ZSI6IjMyYSJ9',
							'eyJ0eXBlIjoiUGFudHkgU2l6ZSIsInZhbHVlIjoiYmlraW5pIHMifQ=='
						],
						image: {
							url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/153199.jpg'
						},
						requires_shipping: true,
						platform_line_item_id: '0',
						description: 'Kalila Unlined',
						variant_description: '32a, bikini s',
						line_item_id: '7823f304-0c6e-493e-80f7-b8ef066f2ae3'
					}
				],
				total: {
					currency: 'USD',
					value: 29.97
				},
				sub_total: {
					currency: 'USD',
					value: 49.95
				},
				shipping_total: {
					currency: 'USD',
					value: 0
				},
				tax: {
					currency: 'USD',
					value: 0
				},
				cart_discount: {
					currency: 'USD',
					value: 19.98
				},
				store_credit: {
					currency: 'USD',
					value: 0
				},
				available_store_credit: {
					currency: 'USD',
					value: 0
				},
				reward_points: {
					currency: 'USD',
					value: 0
				},
				available_reward_points: {
					currency: 'USD',
					value: 0
				},
				cart_discount_breakdown: [
					{
						label: 'First VIP set 40% OFF',
						discount: {
							currency: 'USD',
							value: 19.98
						}
					}
				]
			}
		},
		session: {
			requires_login: true,
			is_email_registered: false,
			is_logged_in: false,
			cookies: [],
			accepts_otp: ['phone', 'email'],
			accepts_membership: ['vip']
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			}
		],
		payment_handle:
			'e90fea27-1dab-46be-a1fc-ab35153b478a|iGcyvPK0YDYmVO8CwPtWhoimeHN7+z8V8zgaLhAp5pWB/UxLJMiMTW65shG+isKJJyedDhFANbFDKj6o1RX1OypZm0smZEmYu4CB1ReXjKqhUwnOlKK7WaLUisk4lbRWJ6uKAYenfHPmMAv4G/6rEJDoJY9NAXbBbxL9MLxzvj+Itve75ALdW2sjAvxfbgx3sI0xJmG2GDlp9oGLRQ2utYKgg5B6Iyc0GHGJmQO8ULF5azF97IJ3G7o22FbyPOlhFybyjgD11I8+kGRVZmkpwBpwEzxLeQy5eTQ3K5wfUHJIHZdyjQ=='
	};

	const cartDataWithShippingAndSession = {
		...cartDataWithShipping,
		session: {
			requires_login: true,
			is_email_registered: true,
			is_logged_in: false,
			cookies: [],
			accepts_otp: ['phone', 'email'],
			accepts_membership: ['vip']
		}
	};

	const cart = writable(cartData);
</script>

<Meta
	title="Checkout V4/Use Cases/Merchant Login"
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Guest order creating account"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Add email', async () => {
			const email = canvas.getByTestId('email-input');
			email.focus();
			await user.type(email, 'nomail@gmail.com');
		});

		await step('Add shipping information', async () => {
			const name = canvas.getByTestId('name');
			const address1 = canvas.getByTestId('address1');
			const enterManually = canvas.getByTestId('extend');
			await user.click(enterManually);
			const address2 = canvas.getByTestId('address2');
			const city = canvas.getByTestId('city');
			const state = canvas.getByTestId('state');
			const postalCode = canvas.getByTestId('postalCode');
			const phone = canvas.getByTestId('phone');

			name.focus();
			await user.type(name, 'John Doe');
			address1.focus();
			await user.type(address1, '1 Microsoft Way');
			address2.focus();
			await user.type(address2, '21st Floor');
			city.focus();
			await user.type(city, 'Redmond');
			state.focus();
			await user.type(state, 'WA');
			postalCode.focus();
			await user.type(postalCode, '98052');
			phone.focus();
			await user.type(phone, '4255551234');
		});

		await step('Add credit card information', async () => {
			const number = canvas.getByTestId('number');
			const expiry = canvas.getByTestId('expiry');
			const cvv = canvas.getByTestId('verification_value');

			number.focus();
			await user.type(number, '4111 1111 1111 1111');
			expiry.focus();
			await user.type(expiry, '12/30');
			cvv.focus();
			await user.type(cvv, '123');
		});

		await step('Place Order', async () => {
			const placeOrderButton = canvas.getByText(/Place Order/i);
			await waitFor(() => expect(placeOrderButton).not.toBeDisabled());
			await user.click(placeOrderButton);

			// TODO: Enable Storybook to run with HTTPS so the encryption can be performed while placing order.
			// await waitFor(() => expect(isOrderPlaced).to.be.true());
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
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
				http.get('*/cart/consents', async (req, res, ctx) => {
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
				http.post('*/session/create-otp', async (req, res, ctx) => {
					return res(ctx.status(404));
				}),
				http.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(cartDataWithShipping));
				}),
				http.post('*/session/join', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(cartDataWithShippingAndSession));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} {isOrderPlaced} />
</Story>
