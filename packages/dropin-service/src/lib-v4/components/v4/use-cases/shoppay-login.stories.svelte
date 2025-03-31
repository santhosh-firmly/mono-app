<script>
	// @ts-nocheck

	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import FlowSinglePage from '../flow-single-page.svelte';
	import { writable } from 'svelte/store';
	import { rest, HttpResponse } from 'msw';
	import { userEvent, waitFor, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';

	const cartData = {
		display_name: 'Firmly Test Store',
		cart_status: 'active',
		platform_id: 'shopify',
		shop_id: 'firmlyai.myshopify.com',
		cart_id: 'ac33cecc-681c-4e14-be91-eb7944daf665',
		urls: {},
		line_items: [
			{
				line_item_id: '5931473d-505a-43eb-a106-4ac79089445f',
				sku: '43624719843576',
				base_sku: '7921742577912',
				quantity: 5,
				msrp: {
					currency: 'USD',
					value: 2
				},
				price: {
					currency: 'USD',
					value: 2
				},
				line_price: {
					currency: 'USD',
					value: 10
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
					large:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
					grande:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_grande.jpg?v=1674229252',
					medium:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_medium.jpg?v=1674229252',
					compact:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_compact.jpg?v=1674229252',
					small:
						'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_small.jpg?v=1674229252'
				},
				platform_line_item_id: 'a75679ae770754fd93e477980753e3d5',
				description: 'Cheapest Car in the world',
				variant_description: 'Cheapest Car in the world'
			}
		],
		sub_total: {
			currency: 'USD',
			value: 10
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
			value: 10
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

	const cartDataWithOptionalPhone = {
		...cartData,
		shop_properties: {
			optional_fields: {
				shipping_phone: true
			}
		}
	};

	const cart = writable(cartData);
	const cartWithOptionalPhone = writable(cartDataWithOptionalPhone);

	const unlockCompleteResponseWithoutPhone = {
		payment_method_options: [],
		shipping_info_options: [
			{
				first_name: 'John',
				last_name: 'Smith',
				address1: '123 Phones Ln',
				address2: '',
				city: 'Bastrop',
				state_or_province: 'TX',
				country: 'US',
				postal_code: '78602',
				email: 'john_smith@firmly.ai'
			}
		],
		access_token:
			'e90fea27-1dab-46be-a1fc-ab35153b478a|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'
	};

	const unlockCompleteResponseMultipleAddresses = structuredClone(
		unlockCompleteResponseWithoutPhone
	);
	unlockCompleteResponseMultipleAddresses.shipping_info_options.push({
		first_name: 'John',
		last_name: 'Smith',
		address1: '1603 Green Valley Circle',
		address2: '',
		city: 'Manhattan',
		state_or_province: 'KS',
		country: 'US',
		phone: '18027771111',
		postal_code: '66502',
		email: 'john_smith@firmly.ai'
	});

	const unlockCompleteResponse = structuredClone(unlockCompleteResponseWithoutPhone);
	unlockCompleteResponse.shipping_info_options[0].phone = '18027771111';

	const shippingInfoResponseWithoutPhone = {
		...cartData,
		shipping_info: {
			first_name: 'John',
			last_name: 'Smith',
			address1: '123 Phones Ln',
			city: 'Bastrop',
			state_or_province: 'TX',
			state_name: 'Texas',
			country: 'United States',
			postal_code: '78602',
			email: 'john_smith@firmly.ai'
		},
		shipping_method_options: [
			{
				sku: 'shopify-best%20shipping%20ever-9.00',
				description: 'best shipping ever',
				price: {
					currency: 'USD',
					value: 0
				},
				estimated_delivery: ''
			},
			{
				sku: 'usps-PriorityExpress-200.00',
				description: 'Priority Mail Express',
				price: {
					currency: 'USD',
					value: 200
				},
				estimated_delivery: '1 business day'
			}
		],
		shipping_method: {
			sku: 'shopify-best%20shipping%20ever-9.00',
			description: 'best shipping ever',
			price: {
				currency: 'USD',
				value: 0
			},
			estimated_delivery: ''
		}
	};

	const shippingInfoResponseWithPhone = structuredClone(shippingInfoResponseWithoutPhone);
	shippingInfoResponseWithPhone.shipping_info.phone = '18027771111';

	const unlockStartResponse = {
		access_token: 'dummy-access-token',
		otp_destination: {
			phones: ['(•••) •••-•111']
		}
	};

	const loginWithShopPayStep = async (canvas, user) => {
		const shopPayButton = canvas.getByTestId('shoppay-button');
		await user.click(shopPayButton);
		const emailInput = canvas.getByTestId('email-input-base-login');
		emailInput.focus();
		await user.type(emailInput, 'nomail@gmail.com');
		const continueWithShoppayButton = canvas.getByTestId('continue-with-button');
		await continueWithShoppayButton.click();

		await waitFor(() => expect(canvas.getByTestId('otp-field-0')).toBeInTheDocument(), {
			timeout: 10000
		});
		const firstOtpField = canvas.getByTestId('otp-field-0');
		await userEvent.click(firstOtpField);
		await waitFor(() => expect(document.activeElement).toBe(firstOtpField));
		await userEvent.paste('123456');
	};
</script>

<Meta title="Checkout V4/Use Cases/ShopPay Login" parameters={{}} />

<Story
	name="One ShopPay address with phone. Phone is optional."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		// Address fields must not be collapsed and filled with information from ShopPay address
		await expect(canvas.getByTestId('address1').value).toEqual('123 Phones Ln');
		await expect(canvas.getByTestId('city').value).toEqual('Bastrop');
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponse));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage cart={cartWithOptionalPhone} />
</Story>

<Story
	name="One ShopPay address without phone. Phone is optional."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		// Address fields must not be collapsed and filled with information from ShopPay address
		await expect(canvas.getByTestId('address1').value).toEqual('123 Phones Ln');
		await expect(canvas.getByTestId('city').value).toEqual('Bastrop');
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseWithoutPhone));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithoutPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage cart={cartWithOptionalPhone} />
</Story>

<Story
	name="Two ShopPay addresses (One with phone). Phone is optional."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		await waitFor(() => expect(canvas.getByTestId('change-shipping-button')).toBeVisible(), {
			timeout: 10000
		});

		canvas.getByTestId('change-shipping-button').click();

		// Address fields must collapsed and the first option must be selected
		await waitFor(() => expect(canvas.getByTestId('address-radio-0')).toBeChecked(), {
			timeout: 10000
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseMultipleAddresses));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithoutPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage cart={cartWithOptionalPhone} />
</Story>

<Story
	name="Two ShopPay addresses (One with phone). Shipping information collapsed."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		await waitFor(() => expect(canvas.getByTestId('change-shipping-button')).toBeVisible(), {
			timeout: 10000
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseMultipleAddresses));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithoutPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage cart={cartWithOptionalPhone} />
</Story>

<Story
	name="One ShopPay address with phone. Phone is mandatory."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		// Address fields must not be collapsed and filled with information from ShopPay address
		await expect(canvas.getByTestId('address1').value).toEqual('123 Phones Ln');
		await expect(canvas.getByTestId('city').value).toEqual('Bastrop');
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponse));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} />
</Story>

<Story
	name="One ShopPay address without phone. Phone is mandatory."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on phone input field
		await waitFor(() => expect(canvas.getByTestId('phone')).toHaveFocus(), {
			timeout: 10000
		});

		// Address fields must not be collapsed and filled with information from ShopPay address
		await expect(canvas.getByTestId('address1').value).toEqual('123 Phones Ln');
		await expect(canvas.getByTestId('city').value).toEqual('Bastrop');
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseWithoutPhone));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithoutPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} />
</Story>

<Story
	name="Two ShopPay addresses (One with phone). Phone is mandatory."
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});

		await waitFor(() => expect(canvas.getByTestId('change-shipping-button')).toBeVisible(), {
			timeout: 10000
		});

		canvas.getByTestId('change-shipping-button').click();
		// Address fields must collapsed and the second address (Address with phone) must be selected
		await waitFor(() => expect(canvas.getByTestId('address-radio-1')).toBeChecked(), {
			timeout: 10000
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseMultipleAddresses));
				}),
				rest.post('*/cart/shipping-info', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(shippingInfoResponseWithPhone));
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} />
</Story>

<Story
	name="Bad response SetShippingInfo"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Log in with ShopPay', async () => {
			await loginWithShopPayStep(canvas, user);
		});

		// Focus must be on credit card
		await waitFor(() => expect(canvas.getByTestId('number')).toHaveFocus(), {
			timeout: 10000
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/wallets/shoppay/unlock-start', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockStartResponse));
				}),
				rest.post('*/api/v1/wallets/shoppay/unlock-complete', async (req, res, ctx) => {
					return res(ctx.status(200), ctx.json(unlockCompleteResponseMultipleAddresses));
				}),
				rest.post('*/cart/shipping-info', async () => {
					return new HttpResponse(null, { status: 401 });
				})
			]
		}
	}}
>
	<FlowSinglePage {cart} />
</Story>
