<script>
	// @ts-nocheck

	import FlowSinglePage from '../flow-single-page.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import '../theme.scss';
	import { writable } from 'svelte/store';
	import { rest } from 'msw';
	import '$lib/browser/api-firmly';
	import { expect } from '@storybook/jest';
	import { userEvent, waitFor, within } from '@storybook/testing-library';

	let isOrderPlaced;

	const cartDataLoggedInUser = {
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
					value: 11.99
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
				line_item_id: 'dce0999c-a09e-44db-8328-76d97dfcd30b'
			}
		],
		shipping_info_options: [
			{
				first_name: 'Romeu',
				last_name: 'Palos De Gouvea',
				phone: '4253368875',
				address1: '7167 126th Pl SE',
				address2: '',
				city: 'Renton',
				state_or_province: 'WA',
				country: 'United States',
				postal_code: '98056',
				email: 'romeo@firmly.ai'
			}
		],
		total: {
			currency: 'USD',
			value: 52.8
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
			value: 4.84
		},
		cart_discount: {
			currency: 'USD',
			value: 11.99
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
				label: '20% OFF',
				discount: {
					currency: 'USD',
					value: 11.99
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
							value: 9.99
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
						line_item_id: 'dce0999c-a09e-44db-8328-76d97dfcd30b'
					}
				],
				total: {
					currency: 'USD',
					value: 44
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
					value: 4.04
				},
				cart_discount: {
					currency: 'USD',
					value: 9.99
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
						label: '20% OFF',
						discount: {
							currency: 'USD',
							value: 9.99
						}
					}
				]
			}
		},
		session: {
			requires_login: true,
			is_email_registered: true,
			is_logged_in: true,
			cookies: [
				'AM_CUSTOMER=33414908; expires=Fri, 19 Jul 2024 15:46:42 GMT; Max-Age=15780000; path=/; domain=.adoreme.com; secure; samesite=lax',
				'am_auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlJ6bFMwRVZycnFWS3duOXRmTnFpVDJQMXFlMGZPWmRiejZWcHVVMFBCTTgifQ.eyJleHAiOjE3MjE0MDQwMDIsImlzcyI6Ikd3LU1haW4iLCJpYXQiOjE3MDU2MjQwMDIsImF1ZCI6InNlc3Npb25faW1wZXJzb25hdGlvbiIsImp0aSI6IjQyMTIyNjRkLTUxYzEtNDNkZC04NGExLTE1MjkxNGFkZGQ2YyIsInN1YiI6MzM0MTQ5MDgsInNjb3BlcyI6WyJmdWxsX2xvZ2luIiwiYW1fYWRtaW4iLCJhbV9hZG1pbjpmaXJtbHkiXX0.F_VwrI_gUNiDL3l3o_6jfc-apf6pduJBGppFUcahI7joU-5urRogBMdI7n2f8Zr9ItStTG93xDFDxSgrBWV35zNjipp-lSc3Sex8eA3sePq7v7pndgA2yXSqvpY_nyHp2EEO1w7bzIRyssvATWYBJ-TJwVgoEOqj2jKUrBAu-3-PIfx-T9jxcNVnCxSPQOavOTFA559yuMkhUxgm-FFnTThb9SRM53Fowv8CibvvAz8RaHQBTaQ-GhcI5_7FA1chvhL4pYLod5as_xAwy7E7yjHYQLiBSLQmh1KWNxygDyNrn3QCES9oolBTdMyXG9VunL7a2dQ0NuqF-qTFyhVSAA; expires=Fri, 19 Jul 2024 15:46:42 GMT; Max-Age=15780000; path=/; domain=.adoreme.com; secure; httponly; samesite=lax'
			],
			accepts_otp: [],
			accepts_membership: ['vip']
		},
		payment_method_options: [
			{
				id: 'card_id_1',
				type: 'CreditCard',
				wallet: 'merchant',
				card_type: 'Visa',
				last_four: '2834',
				month: '11',
				year: '2029',
				billing_info: {
					first_name: 'fistname',
					last_name: 'lastame',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Renton',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '1231234123'
				}
			},
			{
				id: 'card_id_2',
				type: 'CreditCard',
				wallet: 'merchant',
				card_type: 'Visa',
				last_four: '8798',
				month: '3',
				year: '2030',
				billing_info: {
					first_name: 'fistname',
					last_name: 'lastame',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Renton',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '1231234123'
				}
			},
			{
				id: 'card_id_3',
				type: 'CreditCard',
				wallet: 'merchant',
				card_type: 'Visa',
				last_four: '8798',
				month: '3',
				year: '2030',
				billing_info: {
					first_name: 'fistname',
					last_name: 'lastame',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Renton',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '1231234123'
				}
			}
		]
	};

	const cartDataLoggedInUserWithShipping = {
		...cartDataLoggedInUser,
		shipping_info: {
			email: 'romeo@firmly.ai',
			first_name: 'Romeu',
			last_name: 'Palos de Gouvea',
			phone: '4253368875',
			address1: '7367 126th Pl SE',
			address2: '',
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
			estimated_delivery: 'January 26 - January 31'
		},
		shipping_method_options: [
			{
				sku: 'united_states_continental',
				description: 'FREE Standard Shipping',
				price: {
					currency: 'USD',
					value: 0
				},
				estimated_delivery: 'January 26 - January 31'
			},
			{
				sku: 'priority_shipping',
				description: 'Priority Shipping',
				price: {
					currency: 'USD',
					value: 4.95
				},
				estimated_delivery: 'January 25 - January 29'
			},
			{
				sku: 'expedited_shipping',
				description: 'Express Shipping',
				price: {
					currency: 'USD',
					value: 14.95
				},
				estimated_delivery: 'January 24 - January 26'
			}
		],
		payment_handle:
			'e90fea27-1dab-46be-a1fc-ab35153b478a|VWQTHjQjKXoaJjDLRG1WuZRZLPPY/SFxOHCy99AsETUF/v5Z9uSZAD/uHB1VUEyrOWfp3DLK/ALJGf2GoM8iPtxR9lqftw7MoKOJorQ7QGXzkq0lZk8/T0gRTu5UCkbtWHq8CrodHncTIdwRxta2QfkVj9xTzaYYlrkYgluGBMZch+2dJU+SF9lL1JABDHQf14UaGeCG/d/OG+Ro6yOLN4v/B+ni1KkQSgD9sNjigtlDlfiDa2F6NX4xVGeGoBKEmh+Ni5hGBZjEIUa4xhHMl93lBZ+W3CzRftBKM6sajVGe7bELUg=='
	};

	const orderDataLoggedInUser = {
		platform_order_number: '409875115',
		line_items: [
			{
				sku: 'MAG000037',
				base_sku: 'MAG000037',
				quantity: 3,
				msrp: {
					currency: 'USD',
					value: 39.95
				},
				price: {
					currency: 'USD',
					value: 39.95
				},
				line_price: {
					currency: 'USD',
					value: 119.85
				},
				line_discount: {
					currency: 'USD',
					value: 0
				},
				vip_discount: false,
				variant_handles: ['eyJ0eXBlIjoiU2l6ZSIsInZhbHVlIjoicyJ9'],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/100008.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '0',
				description: 'Bryna (3-Pack)',
				variant_description: 's',
				line_item_id: '00000000-0000-0000-0000-000000000000'
			},
			{
				sku: 'PCT123280',
				base_sku: 'PCT123280',
				quantity: 2,
				msrp: {
					currency: 'USD',
					value: 64.95
				},
				price: {
					currency: 'USD',
					value: 64.95
				},
				line_price: {
					currency: 'USD',
					value: 129.9
				},
				line_discount: {
					currency: 'USD',
					value: 49.95
				},
				vip_discount: false,
				variant_handles: [
					'eyJ0eXBlIjoiVG9wIFNpemUiLCJ2YWx1ZSI6IjMyYSJ9',
					'eyJ0eXBlIjoiUGFudHkgU2l6ZSIsInZhbHVlIjoiaGlnaCBjdXQgeHMifQ=='
				],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/118036.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '1',
				description: 'Avara Unlined',
				variant_description: '32a, high cut xs',
				line_item_id: '00000000-0000-0000-0000-000000000000'
			}
		],
		shipping_info: {
			email: 'email',
			first_name: 'first_name',
			last_name: 'last_name',
			address1: 'Microsoft Way',
			city: 'Redmond',
			state_or_province: 'WA',
			state_name: 'Washington',
			country: 'United States',
			postal_code: '98052'
		},
		shipping_info_options: [
			{
				first_name: 'first_name',
				last_name: 'last_name',
				email: 'email'
			}
		],
		total: {
			currency: 'USD',
			value: 219.98
		},
		sub_total: {
			currency: 'USD',
			value: 249.75
		},
		shipping_total: {
			currency: 'USD',
			value: 0
		},
		tax: {
			currency: 'USD',
			value: 20.18
		},
		cart_discount: {
			currency: 'USD',
			value: 49.95
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
				step: 2,
				label: '2 sets for $79.95',
				discount: {
					currency: 'USD',
					value: 49.95
				}
			}
		],
		session: {
			requires_login: true,
			is_email_registered: false,
			is_logged_in: true,
			cookies: ['am_auth=test'],
			accepts_otp: [],
			accepts_membership: ['vip']
		},
		urls: {
			thank_you_page: 'https://www.adoreme.com/sales/order/view/order_id/409875115'
		},
		billing_info: {
			first_name: 'first_name',
			last_name: 'last_name',
			email: 'email'
		},
		handle:
			'eyJ0aGFua1lvdVBhZ2VVcmwiOiJodHRwczovL3d3dy5hZG9yZW1lLmNvbS9zYWxlcy9vcmRlci92aWV3L29yZGVyX2lkLzQwOTg3NTExNSIsImNvb2tpZXMiOlsiYW1fYXV0aD10ZXN0Il19'
	};

	function forceNotLoggedIn(data) {
		const cartDataNotLoggedInUser = structuredClone(data);
		cartDataNotLoggedInUser.session.requires_login = true;
		cartDataNotLoggedInUser.session.is_email_registered = true;
		cartDataNotLoggedInUser.session.is_logged_in = false;
		return cartDataNotLoggedInUser;
	}

	const cartLoggedInUser = writable(cartDataLoggedInUser);
	// const cartNotLoggedInUser = writable(forceNotLoggedIn(cartDataLoggedInUser));
</script>

<Meta
	title="Checkout V4/Use Cases/Merchant Login"
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Click to Pay and Merchant cards"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		await step('Verify if the forms are collapsed', async () => {
			await waitFor(() => expect(canvas.getAllByText(/Change/i).length).toEqual(3), {
				timeout: 5000
			});
		});

		await step('Place Order', async () => {
			const placeOrderButton = canvas.getByText(/Place Order/i);
			await waitFor(() => expect(placeOrderButton).not.toBeDisabled(), {
				timeout: 5000
			});
			await user.click(placeOrderButton);

			await waitFor(() => expect(placeOrderButton).not.toBeInTheDocument(), {
				timeout: 5000
			});
		});
	}}
	parameters={{
		msw: {
			handlers: [
				rest.post('*/api/v1/browser-session', async (req, res, ctx) =>
					res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					)
				),
				rest.get('*/cart/consents', async (req, res, ctx) =>
					res(
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
					)
				),
				rest.post('*/session/create-otp', async (req, res, ctx) => res(ctx.status(404))),
				rest.post('*/cart/shipping-info', async (req, res, ctx) =>
					res(ctx.status(200), ctx.json(cartDataLoggedInUserWithShipping))
				),
				rest.post('*/session/join', async (req, res, ctx) => res(ctx.status(500))),
				rest.post('*/cart/complete-order-with-saved-payment', async (req, res, ctx) =>
					res(ctx.status(200), ctx.delay(1000), ctx.json(orderDataLoggedInUser))
				)
			]
		}
	}}
>
	<FlowSinglePage cart={cartLoggedInUser} {isOrderPlaced} />
</Story>
