<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import Checkout from './checkout.svelte';
	import { initializeBuyNow, resetBuyNow } from '$lib/states/buy-now.svelte.js';
	import { initializeCheckout, resetCheckout } from '$lib/states/checkout/index.svelte.js';
	import { initializeClickToPay, resetClickToPay } from '$lib/states/click-to-pay.svelte.js';
	import { getNotices, resetNotices } from '$lib/states/notices.svelte.js';
	import MOCKED_CART from '$lib/assets/cart.json';

	const MOCKED_STORE_INFO = {
		logoUrl: 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png'
	};

	const LIQUID_IV_MERCHANT = {
		primaryColor: '#e3f8f9',
		actionColor: '#35cad0',
		largeLogo:
			"data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='liv-logo' data-name='Layer 2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 737.78 122.51'%3E%3Cg%3E%3Cg%3E%3Cpolygon style='stroke-width:0px;fill:%23004e72;' points='168.94 93.65 168.94 9.71 146.69 9.71 146.69 114.77 209.78 114.77 209.78 93.65 168.94 93.65'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='223.12' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M413.15,9.82v67.51c0,6.82-2.05,18.26-15.76,18.26-10.89,0-16.89-6.48-16.89-18.26V9.82h-22.14v67.51c0,12.26,4.04,22.43,11.68,29.41,6.86,6.27,16.54,9.73,27.24,9.73,23.45,0,38.01-15,38.01-39.15V9.82h-22.14Z'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M338.76,93.7l-1.01-.7c2.68-5.82,4.18-12.45,4.18-19.61v-24.3c0-24.54-17.45-43.05-40.6-43.05s-40.6,18.51-40.6,43.05v24.3c0,24.54,17.45,43.05,40.6,43.05,7.17,0,13.8-1.78,19.53-4.97-.47-.36-.93-.68-1.4-1.06-6.04-4.86-13.15-10.05-21.06-10.05v-6.12c-10.75-1.55-15.69-11.51-15.69-20.84v-24.3c0-10.15,5.83-21.07,18.63-21.07s18.63,10.92,18.63,21.07v24.3c0,2.25-.29,4.54-.88,6.74-.74-.47-1.43-.88-2.05-1.21-5.65-3-10.99-4.78-18.42-4.78v19.94c9.1,0,16.83,5.6,23.36,10.86,9.12,7.33,17.22,10.6,26.26,10.6h2.88v-19.42c-6.13,0-9.67-1.05-12.35-2.43Z'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='449.39' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M566.38,70.69h0c0-.46-.02-19.3-.04-19.76-.92-20.74-14.51-41.22-43.3-41.22h-34.83v105.06h34.83c12.82,0,23.67-4.15,31.39-12,7.51-7.64,11.83-18.75,11.96-30.67,0-.47,0-.94,0-1.41ZM523.04,93.09h-12.7V31.16h12.7c14.58,0,21.14,10.09,21.14,19.93,0,.42.05,19.22.06,19.64,0,.35.01.69.01,1.03,0,7.25-2.07,11.85-5.75,15.63-3.68,3.78-8.88,5.7-15.46,5.7Z'/%3E%3Crect style='stroke-width:0px;fill:%23004e72;' x='593.14' y='9.71' width='22.14' height='105.06'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M637.48,92.27c-7.75,0-11.81,5.9-11.81,11.72s4.06,11.72,11.81,11.72,11.81-5.9,11.81-11.72-4.06-11.72-11.81-11.72Z'/%3E%3Cpolygon style='stroke-width:0px;fill:%23004e72;' points='697.38 9.71 675.83 83.49 654.38 9.71 629.65 9.71 665.68 115.11 686.08 115.11 722.11 9.71 697.38 9.71'/%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M713.23,92.27c-7.75,0-11.81,5.9-11.81,11.72s4.06,11.72,11.81,11.72,11.81-5.9,11.81-11.72-4.06-11.72-11.81-11.72Z'/%3E%3C/g%3E%3Cg%3E%3Cpath style='stroke-width:0px;fill:%23fff' d='M34.18,69.07c0-1.05.1-2.1.26-3.12.37-2.16,1.1-4.28,2.21-6.27.22-.38.45-.77.7-1.15l.03-.07s.02-.05.04-.07l7.43-13.05,1.59-2.77,6.95-12.01,6.94,12.01,1.58,2.77,7.42,13.05s.04.05.05.07l.04.07c.24.38.47.77.68,1.15,1.12,1.99,1.87,4.1,2.22,6.27.17,1.02.28,2.07.28,3.12,0,10.59-8.62,19.21-19.21,19.21-10.6,0-19.21-8.63-19.21-19.21Z'/%3E%3Cg%3E%3Cpath style='stroke-width:0px;fill:%230075c8;' d='M34.25,69.03c0-1.05.1-2.1.27-3.13.37-2.17,1.1-4.29,2.22-6.28.22-.39.45-.77.7-1.15l.03-.07s.02-.05.04-.07l7.44-13.08,1.59-2.78,6.87-11.88V0c-.44,0-.89.1-1.22.29L1.22,29.71C.54,30.1,0,31.05,0,31.84v58.84c0,.77.54,1.73,1.22,2.12l50.97,29.42c.33.2.75.29,1.21.29v-34.23c-10.57-.06-19.14-8.68-19.14-19.25Z'/%3E%3Cpath style='stroke-width:0px;fill:%2300a7e1' d='M105.59,29.71L54.62.29c-.32-.2-.77-.29-1.21-.29v30.61s.09-.16.09-.16l6.95,12.04,1.58,2.78,7.44,13.08s.04.04.05.07l.04.07c.24.38.47.77.68,1.15,1.13,1.99,1.87,4.11,2.22,6.28.17,1.02.28,2.07.28,3.13,0,10.61-8.64,19.24-19.24,19.25-.03,0-.07,0-.1,0v34.23c.44,0,.89-.09,1.23-.29l50.97-29.42c.68-.39,1.23-1.35,1.23-2.12V31.84c0-.78-.55-1.74-1.23-2.13Z'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cpath style='stroke-width:0px;fill:%23004e72;' d='M737.78,18.25c0,2.61-2.07,4.67-4.72,4.67s-4.67-2.02-4.67-4.63,2.07-4.67,4.72-4.67,4.67,2.02,4.67,4.63ZM736.85,18.27c0-2.2-1.62-3.79-3.77-3.79s-3.77,1.59-3.77,3.79,1.62,3.77,3.77,3.77,3.77-1.57,3.77-3.77ZM731.41,16.01h2c.93,0,1.62.56,1.62,1.46,0,.69-.41,1.18-1.03,1.38l1.23,1.68h-1.03l-1.12-1.59h-.8v1.59h-.86v-4.52ZM732.27,16.74v1.49h1.03c.56,0,.88-.28.88-.73s-.32-.75-.88-.75h-1.03Z'/%3E%3C/svg%3E"
	};

	const MOCKED_STORAGE = {
		credit_cards: [
			{ id: 1, brand: 'Visa', first4: '4111', last4: '1234' },
			{ id: 2, brand: 'Mastercard', first4: '5111', last4: '5678' }
		],
		shipping_addresses: [
			{
				id: 1,
				first_name: 'John',
				last_name: 'Smith',
				phone: '2065550123',
				address1: '123 Main Street',
				city: 'Seattle',
				state_or_province: 'WA',
				country: 'United States',
				postal_code: '98101',
				email: 'john.smith@example.com'
			}
		]
	};

	const SHIPPING_METHOD_OPTIONS = [
		{
			sku: 'standard',
			description: 'Standard Shipping (5-7 days)',
			price: { currency: 'USD', value: 5.99, number: 599, symbol: '$' }
		},
		{
			sku: 'express',
			description: 'Express Shipping (2-3 days)',
			price: { currency: 'USD', value: 12.99, number: 1299, symbol: '$' }
		}
	];

	const CLEAN_CART = {
		cart_status: 'active',
		platform_id: MOCKED_CART.platform_id,
		shop_id: MOCKED_CART.shop_id,
		cart_id: MOCKED_CART.cart_id,
		line_items: MOCKED_CART.line_items,
		sub_total: MOCKED_CART.sub_total,
		tax: MOCKED_CART.tax,
		total: MOCKED_CART.total,
		payment_method_options: MOCKED_CART.payment_method_options
	};

	const MULTI_ITEM_CART = {
		...CLEAN_CART,
		line_items: [
			{
				line_item_id: 'item-1',
				sku: 'SKU-HYDRATION-LEMON',
				quantity: 2,
				price: { currency: 'USD', value: 24.99, number: 2499, symbol: '$' },
				line_price: { currency: 'USD', value: 49.98, number: 4998, symbol: '$' },
				image: {
					url: 'https://cdn.shopify.com/s/files/1/1338/1013/files/EY_BP_14ct_PDP_bf83aa1f-f190-48fe-90ef-8687109775cc_large.jpg?v=1726869385'
				},
				description: 'Hydration Multiplier - Lemon Lime',
				variant_description: 'Lemon Lime / 16 Pack'
			},
			{
				line_item_id: 'item-2',
				sku: 'SKU-HYDRATION-STRAWBERRY',
				quantity: 1,
				price: { currency: 'USD', value: 24.99, number: 2499, symbol: '$' },
				line_price: { currency: 'USD', value: 24.99, number: 2499, symbol: '$' },
				image: {
					url: 'https://cdn.shopify.com/s/files/1/1338/1013/products/HM_Strawberry_30ct_large.png?v=1695749589'
				},
				description: 'Hydration Multiplier - Strawberry',
				variant_description: 'Strawberry / 30 Pack'
			},
			{
				line_item_id: 'item-3',
				sku: 'SKU-ENERGY-YUZU',
				quantity: 1,
				price: { currency: 'USD', value: 27.99, number: 2799, symbol: '$' },
				line_price: { currency: 'USD', value: 27.99, number: 2799, symbol: '$' },
				image: {
					url: 'https://cdn.shopify.com/s/files/1/1338/1013/files/LIV_Energy_YuzuPineapple_Packaging_30ct_large.png?v=1695749732'
				},
				description: 'Energy Multiplier - Yuzu Pineapple',
				variant_description: 'Yuzu Pineapple / 14 Pack'
			},
			{
				line_item_id: 'item-4',
				sku: 'SKU-SLEEP-BLUEBERRY',
				quantity: 3,
				price: { currency: 'USD', value: 23.99, number: 2399, symbol: '$' },
				line_price: { currency: 'USD', value: 71.97, number: 7197, symbol: '$' },
				image: {
					url: 'https://cdn.shopify.com/s/files/1/1338/1013/files/Sleep_BlueberryLavender_10ct_large.png?v=1695749845'
				},
				description: 'Sleep Multiplier - Blueberry Lavender',
				variant_description: 'Blueberry Lavender / 10 Pack'
			}
		],
		sub_total: { currency: 'USD', value: 174.93, number: 17493, symbol: '$' },
		total: { currency: 'USD', value: 180.92, number: 18092, symbol: '$' }
	};

	const { Story } = defineMeta({
		title: 'Views/Checkout',
		component: Checkout,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			onGoBack: fn(),
			onUseFastCheckout: fn(),
			onPlaceOrder: fn()
		}
	});

	function createStates(checkoutOverrides = {}, noticesConfig = []) {
		resetBuyNow();
		resetCheckout();
		resetClickToPay();
		resetNotices();

		const buyNow = initializeBuyNow('checkout');

		const checkout = initializeCheckout({
			cart: checkoutOverrides.cart ?? MOCKED_CART,
			store: MOCKED_STORE_INFO,
			pending: checkoutOverrides.pending ?? { cart: false },
			domain: 'example.com'
		});

		checkout.initializeForms(
			checkout.cart?.shipping_info || {},
			checkout.cart?.billing_info || {}
		);

		if (checkoutOverrides.storage) checkout.storage = checkoutOverrides.storage;
		if (checkoutOverrides.selectedCardId)
			checkout.selectedCardId = checkoutOverrides.selectedCardId;
		if (checkoutOverrides.useBillingAddress !== undefined)
			checkout.useBillingAddress = checkoutOverrides.useBillingAddress;

		const c2p = initializeClickToPay();

		const notices = getNotices();
		noticesConfig.forEach((notice) => notices.add(notice));

		return { buyNow, checkout, c2p, notices };
	}

	const stateFactories = {
		loading: () => createStates({ pending: { cart: true } }),
		loaded: () => createStates({ cart: CLEAN_CART }),
		withShippingAndPromocode: () =>
			createStates({
				cart: {
					...MOCKED_CART,
					promo_codes: ['SAVE20'],
					sub_total: { currency: 'USD', value: 24.99, number: 2499, symbol: '$' },
					total: { currency: 'USD', value: 25.98, number: 2598, symbol: '$' }
				}
			}),
		withFullData: () =>
			createStates({
				cart: { ...MOCKED_CART, billing_info: MOCKED_CART.shipping_info },
				storage: MOCKED_STORAGE,
				selectedCardId: 1
			}),
		calculating: () =>
			createStates({
				cart: {
					...MOCKED_CART,
					shipping_method: SHIPPING_METHOD_OPTIONS[0],
					shipping_method_options: SHIPPING_METHOD_OPTIONS
				},
				pending: { cart: false, UPDATE_SHIPPING_METHOD: true }
			}),
		shippingFilledSelectMethod: () =>
			createStates({
				cart: {
					...MOCKED_CART,
					shipping_method: undefined,
					shipping_method_options: SHIPPING_METHOD_OPTIONS
				}
			}),
		shippingAndPaymentSelectMethod: () =>
			createStates({
				cart: {
					...MOCKED_CART,
					shipping_method: undefined,
					shipping_method_options: SHIPPING_METHOD_OPTIONS
				},
				storage: MOCKED_STORAGE,
				selectedCardId: 1
			}),
		liquidIvMerchant: () => createStates({ cart: CLEAN_CART }),
		readyToPlaceOrder: () =>
			createStates({
				cart: MOCKED_CART,
				storage: MOCKED_STORAGE,
				selectedCardId: 1
			}),
		withPendingRemoval: () => {
			const states = createStates({ cart: MOCKED_CART });
			const firstItem = MOCKED_CART.line_items[0];
			if (firstItem) {
				states.checkout.pendingRemovals = {
					[firstItem.sku]: {
						sku: firstItem.sku,
						image: firstItem.image?.url,
						title: firstItem.description,
						description: firstItem.variant_description,
						price: firstItem.line_price?.value,
						quantity: firstItem.quantity,
						variantHandles: firstItem.variant_handles || []
					}
				};
			}
			return states;
		},
		multipleItems: () => createStates({ cart: MULTI_ITEM_CART }),
		withPromoCodeError: () =>
			createStates({ cart: MOCKED_CART }, [
				{
					type: 'error',
					message: 'The promo code "SAVE50" is invalid or expired.',
					duration: 0
				}
			]),
		withMultipleErrors: () =>
			createStates({ cart: MOCKED_CART }, [
				{
					type: 'error',
					message: 'The promo code "INVALID" could not be applied.',
					duration: 0
				},
				{
					type: 'warning',
					message: 'Some items in your cart have limited availability.',
					duration: 0
				}
			])
	};
</script>

<script>
	let purchaseLoading = $state(false);
	let purchaseSuccess = $state(false);

	function handlePlaceOrder() {
		purchaseLoading = true;
		setTimeout(() => {
			purchaseLoading = false;
			purchaseSuccess = true;
		}, 2000);
	}

	// Interactive Removal Checkout wrapper component
	class InteractiveCheckoutState {
		#baseCheckout;
		cart = $state(null);
		pendingRemovals = $state({});
		removalCountdowns = $state({});
		#removalTimeouts = {};
		#countdownIntervals = {};

		constructor(checkout) {
			this.#baseCheckout = checkout;
			this.cart = checkout.cart ? { ...checkout.cart } : null;
		}

		get store() {
			return this.#baseCheckout.store;
		}

		get domain() {
			return this.#baseCheckout.domain;
		}

		get pending() {
			return this.#baseCheckout.pending;
		}

		get shippingForm() {
			return this.#baseCheckout.shippingForm;
		}

		get billingForm() {
			return this.#baseCheckout.billingForm;
		}

		get storage() {
			return this.#baseCheckout.storage;
		}

		get selectedCard() {
			return this.#baseCheckout.selectedCard;
		}

		get selectedCardId() {
			return this.#baseCheckout.selectedCardId;
		}

		get totalPrice() {
			return this.#baseCheckout.totalPrice;
		}

		get itemsQuantity() {
			return this.cart?.line_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
		}

		get lineItems() {
			const pendingSkus = new Set(Object.keys(this.pendingRemovals));

			return (this.cart?.line_items || []).map((item, index) => ({
				sku: item.sku,
				image: item.image?.url,
				title: item.description,
				description: item.variant_description,
				price: item.line_price?.value,
				quantity: item.quantity,
				variantHandles: item.variant_handles,
				pendingRemoval: pendingSkus.has(item.sku),
				originalIndex: index
			}));
		}

		get isCartLoading() {
			return this.#baseCheckout.isCartLoading;
		}

		get hadInitialShippingMethod() {
			return this.#baseCheckout.hadInitialShippingMethod;
		}

		get emailAutofillDetected() {
			return this.#baseCheckout.emailAutofillDetected;
		}

		get canPlaceOrder() {
			return this.#baseCheckout.canPlaceOrder;
		}

		get isPaymentReady() {
			return this.#baseCheckout.isPaymentReady;
		}

		get hasStoredCards() {
			return this.#baseCheckout.hasStoredCards;
		}

		get useBillingAddress() {
			return this.#baseCheckout.useBillingAddress;
		}

		set useBillingAddress(value) {
			this.#baseCheckout.useBillingAddress = value;
		}

		get errors() {
			return this.#baseCheckout.errors || {};
		}

		get shippingAutocomplete() {
			return (
				this.#baseCheckout.shippingAutocomplete || {
					completions: [],
					selectedAddress: null,
					isLoading: false
				}
			);
		}

		get billingAutocomplete() {
			return (
				this.#baseCheckout.billingAutocomplete || {
					completions: [],
					selectedAddress: null,
					isLoading: false
				}
			);
		}

		get placeOrderPending() {
			return this.#baseCheckout.placeOrderPending;
		}

		get orderResult() {
			return this.#baseCheckout.orderResult;
		}

		initializeForms(...args) {
			return this.#baseCheckout.initializeForms?.(...args);
		}

		syncEmailToCart() {
			return this.#baseCheckout.syncEmailToCart?.();
		}

		submitShippingIfReady() {
			return this.#baseCheckout.submitShippingIfReady?.();
		}

		formatShippingAddress(info) {
			return this.#baseCheckout.formatShippingAddress?.(info) || '';
		}

		searchAddress(query, type) {
			return this.#baseCheckout.searchAddress?.(query, type);
		}

		selectAddress(option, type) {
			return this.#baseCheckout.selectAddress?.(option, type);
		}

		selectShippingMethod(sku) {
			return this.#baseCheckout.selectShippingMethod?.(sku);
		}

		setPaymentFormData(data) {
			return this.#baseCheckout.setPaymentFormData?.(data);
		}

		useFastCheckout(method) {
			return this.#baseCheckout.useFastCheckout?.(method);
		}

		placeOrder(method) {
			return this.#baseCheckout.placeOrder?.(method);
		}

		async removeLineItem(sku, autoConfirmDelay = 10000) {
			const item = this.cart?.line_items?.find((i) => i.sku === sku);
			if (!item) return false;

			// Just mark as pending removal (don't remove from cart yet)
			this.pendingRemovals = { ...this.pendingRemovals, [sku]: true };

			// Clear existing timers
			this.#clearRemovalTimers(sku);

			// Start countdown
			const countdownSeconds = Math.ceil(autoConfirmDelay / 1000);
			this.removalCountdowns = { ...this.removalCountdowns, [sku]: countdownSeconds };

			this.#countdownIntervals[sku] = setInterval(() => {
				const current = this.removalCountdowns[sku];
				if (current > 1) {
					this.removalCountdowns = { ...this.removalCountdowns, [sku]: current - 1 };
				} else {
					this.confirmRemoval(sku);
				}
			}, 1000);

			this.#removalTimeouts[sku] = setTimeout(() => {
				this.confirmRemoval(sku);
			}, autoConfirmDelay);

			return true;
		}

		#clearRemovalTimers(sku) {
			if (this.#removalTimeouts[sku]) {
				clearTimeout(this.#removalTimeouts[sku]);
				delete this.#removalTimeouts[sku];
			}
			if (this.#countdownIntervals[sku]) {
				clearInterval(this.#countdownIntervals[sku]);
				delete this.#countdownIntervals[sku];
			}
		}

		async undoRemoval(sku) {
			if (!this.pendingRemovals[sku]) return false;

			this.#clearRemovalTimers(sku);

			// Simulate delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Remove from pending
			this.pendingRemovals = Object.fromEntries(
				Object.entries(this.pendingRemovals).filter(([key]) => key !== sku)
			);
			this.removalCountdowns = Object.fromEntries(
				Object.entries(this.removalCountdowns).filter(([key]) => key !== sku)
			);

			return true;
		}

		confirmRemoval(sku) {
			this.#clearRemovalTimers(sku);

			// Actually remove from cart now
			if (this.cart) {
				this.cart = {
					...this.cart,
					line_items: this.cart.line_items.filter((i) => i.sku !== sku)
				};
			}

			this.pendingRemovals = Object.fromEntries(
				Object.entries(this.pendingRemovals).filter(([key]) => key !== sku)
			);
			this.removalCountdowns = Object.fromEntries(
				Object.entries(this.removalCountdowns).filter(([key]) => key !== sku)
			);
		}

		async updateLineItem(sku, quantity) {
			console.log('Update line item:', sku, quantity);
			return true;
		}

		async addPromo(code) {
			console.log('Add promo:', code);
			return { success: true };
		}

		async removeAllPromos() {
			console.log('Remove all promos');
			return true;
		}
	}
</script>

{#snippet InteractiveRemovalCheckout(args)}
	{@const interactiveCheckout = new InteractiveCheckoutState(args.checkout)}
	<Checkout
		checkout={interactiveCheckout}
		c2p={args.c2p}
		paypalFastCheckoutButton={args.paypalFastCheckoutButton}
		paypalPaymentButton={args.paypalPaymentButton}
		onGoBack={args.onGoBack}
	/>
{/snippet}

{#snippet mockPaypalFastCheckoutButton()}
	<button
		class="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-[#ffc439] hover:bg-[#f0b72f]"
		onclick={() => console.log('PayPal Fast Checkout clicked')}
	>
		<svg width="100" height="24" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
			<path
				fill="#003087"
				d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"
			></path>
			<path
				fill="#003087"
				d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.137 10.6 C 36.237 10.4 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z"
			></path>
			<path
				fill="#003087"
				d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z"
			></path>
			<path
				fill="#009cde"
				d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18 C 62.037 17.5 62.437 17.1 63.037 17.1 L 65.537 17.1 C 70.637 17.1 73.637 14.6 74.437 9.7 C 74.737 7.6 74.437 5.9 73.437 4.7 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.737 9.1 68.637 10.1 Z"
			></path>
			<path
				fill="#009cde"
				d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.637 10.6 C 91.637 10.4 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.737 15.3 85.937 16.2 85.737 17.2 Z"
			></path>
			<path
				fill="#009cde"
				d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"
			></path>
		</svg>
	</button>
{/snippet}

{#snippet mockPaypalPaymentButton()}
	<button
		class="flex h-12.5 w-full cursor-pointer items-center justify-center gap-2 rounded bg-[#ffc439] hover:bg-[#f0b72f]"
		onclick={() => console.log('PayPal Payment clicked')}
	>
		<span class="text-sm font-medium text-[#003087]">Pay with</span>
		<svg width="80" height="20" viewBox="0 0 101 32" xmlns="http://www.w3.org/2000/svg">
			<path
				fill="#003087"
				d="M 12.237 2.8 L 4.437 2.8 C 3.937 2.8 3.437 3.2 3.337 3.7 L 0.237 23.7 C 0.137 24.1 0.437 24.4 0.837 24.4 L 4.537 24.4 C 5.037 24.4 5.537 24 5.637 23.5 L 6.437 18.1 C 6.537 17.6 6.937 17.2 7.537 17.2 L 10.037 17.2 C 15.137 17.2 18.137 14.7 18.937 9.8 C 19.237 7.7 18.937 6 17.937 4.8 C 16.837 3.5 14.837 2.8 12.237 2.8 Z M 13.137 10.1 C 12.737 12.9 10.537 12.9 8.537 12.9 L 7.337 12.9 L 8.137 7.7 C 8.137 7.4 8.437 7.2 8.737 7.2 L 9.237 7.2 C 10.637 7.2 11.937 7.2 12.637 8 C 13.137 8.4 13.337 9.1 13.137 10.1 Z"
			></path>
			<path
				fill="#003087"
				d="M 35.437 10 L 31.737 10 C 31.437 10 31.137 10.2 31.137 10.5 L 30.937 11.5 L 30.637 11.1 C 29.837 9.9 28.037 9.5 26.237 9.5 C 22.137 9.5 18.637 12.6 17.937 17 C 17.537 19.2 18.037 21.3 19.337 22.7 C 20.437 24 22.137 24.6 24.037 24.6 C 27.337 24.6 29.237 22.5 29.237 22.5 L 29.037 23.5 C 28.937 23.9 29.237 24.3 29.637 24.3 L 33.037 24.3 C 33.537 24.3 34.037 23.9 34.137 23.4 L 36.137 10.6 C 36.237 10.4 35.837 10 35.437 10 Z M 30.337 17.2 C 29.937 19.3 28.337 20.8 26.137 20.8 C 25.037 20.8 24.237 20.5 23.637 19.8 C 23.037 19.1 22.837 18.2 23.037 17.2 C 23.337 15.1 25.137 13.6 27.237 13.6 C 28.337 13.6 29.137 14 29.737 14.6 C 30.237 15.3 30.437 16.2 30.337 17.2 Z"
			></path>
			<path
				fill="#003087"
				d="M 55.337 10 L 51.637 10 C 51.237 10 50.937 10.2 50.737 10.5 L 45.537 18.1 L 43.337 10.8 C 43.237 10.3 42.737 10 42.337 10 L 38.637 10 C 38.237 10 37.837 10.4 38.037 10.9 L 42.137 23 L 38.237 28.4 C 37.937 28.8 38.237 29.4 38.737 29.4 L 42.437 29.4 C 42.837 29.4 43.137 29.2 43.337 28.9 L 55.837 10.9 C 56.137 10.6 55.837 10 55.337 10 Z"
			></path>
			<path
				fill="#009cde"
				d="M 67.737 2.8 L 59.937 2.8 C 59.437 2.8 58.937 3.2 58.837 3.7 L 55.737 23.6 C 55.637 24 55.937 24.3 56.337 24.3 L 60.337 24.3 C 60.737 24.3 61.037 24 61.037 23.7 L 61.937 18 C 62.037 17.5 62.437 17.1 63.037 17.1 L 65.537 17.1 C 70.637 17.1 73.637 14.6 74.437 9.7 C 74.737 7.6 74.437 5.9 73.437 4.7 C 72.237 3.5 70.337 2.8 67.737 2.8 Z M 68.637 10.1 C 68.237 12.9 66.037 12.9 64.037 12.9 L 62.837 12.9 L 63.637 7.7 C 63.637 7.4 63.937 7.2 64.237 7.2 L 64.737 7.2 C 66.137 7.2 67.437 7.2 68.137 8 C 68.637 8.4 68.737 9.1 68.637 10.1 Z"
			></path>
			<path
				fill="#009cde"
				d="M 90.937 10 L 87.237 10 C 86.937 10 86.637 10.2 86.637 10.5 L 86.437 11.5 L 86.137 11.1 C 85.337 9.9 83.537 9.5 81.737 9.5 C 77.637 9.5 74.137 12.6 73.437 17 C 73.037 19.2 73.537 21.3 74.837 22.7 C 75.937 24 77.637 24.6 79.537 24.6 C 82.837 24.6 84.737 22.5 84.737 22.5 L 84.537 23.5 C 84.437 23.9 84.737 24.3 85.137 24.3 L 88.537 24.3 C 89.037 24.3 89.537 23.9 89.637 23.4 L 91.637 10.6 C 91.637 10.4 91.337 10 90.937 10 Z M 85.737 17.2 C 85.337 19.3 83.737 20.8 81.537 20.8 C 80.437 20.8 79.637 20.5 79.037 19.8 C 78.437 19.1 78.237 18.2 78.437 17.2 C 78.737 15.1 80.537 13.6 82.637 13.6 C 83.737 13.6 84.537 14 85.137 14.6 C 85.737 15.3 85.937 16.2 85.737 17.2 Z"
			></path>
			<path
				fill="#009cde"
				d="M 95.337 3.3 L 92.137 23.6 C 92.037 24 92.337 24.3 92.737 24.3 L 95.937 24.3 C 96.437 24.3 96.937 23.9 97.037 23.4 L 100.237 3.5 C 100.337 3.1 100.037 2.8 99.637 2.8 L 96.037 2.8 C 95.637 2.8 95.437 3 95.337 3.3 Z"
			></path>
		</svg>
	</button>
{/snippet}

{#snippet template(args)}
	{@const states = args.stateFactory()}
	<Checkout
		{...args}
		buyNow={states.buyNow}
		checkout={states.checkout}
		c2p={states.c2p}
		paypalFastCheckoutButton={mockPaypalFastCheckoutButton}
		paypalPaymentButton={mockPaypalPaymentButton}
	/>
{/snippet}

<Story name="Loading" args={{ stateFactory: stateFactories.loading }} {template} />

<Story name="Loaded" args={{ stateFactory: stateFactories.loaded }} {template} />

<Story
	name="With Shipping Data and Promocode"
	args={{ stateFactory: stateFactories.withShippingAndPromocode }}
	{template}
/>

<Story name="With Full Data" args={{ stateFactory: stateFactories.withFullData }} {template} />

<Story name="Calculating" args={{ stateFactory: stateFactories.calculating }} {template} />

<Story
	name="Shipping Filled - Select Method"
	args={{ stateFactory: stateFactories.shippingFilledSelectMethod }}
	{template}
/>

<Story
	name="Shipping and Payment - Select Method"
	args={{ stateFactory: stateFactories.shippingAndPaymentSelectMethod }}
	{template}
/>

{#snippet liquidIvTemplate(args)}
	{@const states = args.stateFactory()}
	<Checkout
		{...args}
		buyNow={states.buyNow}
		checkout={states.checkout}
		c2p={states.c2p}
		merchant={LIQUID_IV_MERCHANT}
		paypalFastCheckoutButton={mockPaypalFastCheckoutButton}
		paypalPaymentButton={mockPaypalPaymentButton}
	/>
{/snippet}

<Story
	name="Liquid IV Theme"
	args={{ stateFactory: stateFactories.liquidIvMerchant }}
	template={liquidIvTemplate}
/>

{#snippet readyToPlaceOrderTemplate(args)}
	{@const states = args.stateFactory()}
	<Checkout
		{...args}
		buyNow={states.buyNow}
		checkout={states.checkout}
		c2p={states.c2p}
		paypalFastCheckoutButton={mockPaypalFastCheckoutButton}
		paypalPaymentButton={mockPaypalPaymentButton}
		{purchaseLoading}
		{purchaseSuccess}
		onPlaceOrder={handlePlaceOrder}
	/>
{/snippet}

<Story
	name="Ready to Place Order"
	args={{ stateFactory: stateFactories.readyToPlaceOrder }}
	template={readyToPlaceOrderTemplate}
/>

<Story
	name="With Pending Removal"
	args={{ stateFactory: stateFactories.withPendingRemoval }}
	{template}
/>

<Story
	name="With Promo Code Error Notice"
	args={{ stateFactory: stateFactories.withPromoCodeError }}
	{template}
/>

<Story
	name="With Multiple Error Notices"
	args={{ stateFactory: stateFactories.withMultipleErrors }}
	{template}
/>

{#snippet interactiveRemovalTemplate(args)}
	{@const states = args.stateFactory()}
	{@render InteractiveRemovalCheckout({
		checkout: states.checkout,
		c2p: states.c2p,
		paypalFastCheckoutButton: mockPaypalFastCheckoutButton,
		paypalPaymentButton: mockPaypalPaymentButton,
		onGoBack: args.onGoBack
	})}
{/snippet}

<Story
	name="Interactive Removal Flow"
	args={{ stateFactory: stateFactories.multipleItems }}
	template={interactiveRemovalTemplate}
/>
