<script>
	// @ts-nocheck
	import * as Yup from 'yup';
	import { Required } from '$lib-v4/browser/localization.js';
	import ShopPayIcon from '../common/svg/shop-pay-icon.svelte';
	import Paypal from '../payment/paypal.svelte';
	import Address from './address.svelte';
	import FooterLinks from './footer-links.svelte';
	import Footer from './footer.svelte';
	import Group from './group.svelte';
	import Overview from './overview.svelte';
	import PaymentTabs from './payment-tabs/payment-tabs.svelte';
	import ShippingMethodSelector from './shipping-method-selector.svelte';
	import Summary from './summary.svelte';
	import { isEqual } from '$lib-v4/browser/dash.js';
	import { writable } from 'svelte/store';
	import { postOrderPlaced, postQuantityUpdated, postSignIn } from '$lib-v4/browser/cross.js';
	import LoginButton from './login-button.svelte';
	import Shoppay from './view-model/shoppay.svelte';
	import ClickToPay from './view-model/click-to-pay.svelte';
	import { BASE_LOGIN_STEPS, NEW_CARD_OPTION, NEW_SHIPPING_ADDRESS } from '$lib-v4/constants.js';
	import MerchantLogin from './view-model/merchant-login.svelte';
	import Checkbox from './checkbox.svelte';
	import ShippingAddress from './shipping-address.svelte';
	import { slide } from 'svelte/transition';
	import { formatCurrency } from '$lib-v4/utils';
	import { fadeSlide } from './transitions.js';
	import ExistingCreditCard from './existing-credit-card.svelte';
	import Notices from './notices.svelte';
	import TermsPopup from './terms-popup.svelte';
	import { getRandonPassword } from '$lib-v4/browser/api-manager.js';
	import { createEventDispatcher } from 'svelte';
	import Header from './header.svelte';
	import classNames from 'classnames';

	const dispatch = createEventDispatcher();
	/**
	 * Cart object representing the current cart contents and configurations
	 */
	export let cart = writable();

	// Check if there are optional fields
	let optionalFields = {};
	$: {
		optionalFields = $cart?.shop_properties?.optional_fields || {};
	}

	export let PUBLIC_DISABLE_HCAPTCHA = false;

	// Progress control variables
	export let shippingInfoInProgress = false;
	export let shippingMethodInProgress = false;
	export let placeOrderInProgress = false;

	// Merchant info variables
	export let largeLogo;
	export let smallLogo;
	export let termsOfUse;
	export let privacyPolicy;

	// Controls the express payment buttons
	let allowMerchantLogin = true;
	let allowShopPay = false;
	let allowPayPal = false;

	let paypalConnected = false;
	let paypalPayerId = '';

	// Stitching header expanded state
	let toggleHeaderExpanded;

	/**
	 * Boolean variable to control if the line items are expanded or not in the Order Summary above the place order button
	 */
	let toggleLineItemsExpanded;

	/**
	 * Boolean variable to control if ShopPay modal is open or not
	 */
	let isShopPayOpen = false;
	// let shopPayAccessToken;

	/**
	 * Boolean variable to control if merchant login modal is open or not
	 */
	let isMerchantLoginOpen = false;

	/**
	 * Boolean variable to control if terms modal is open or not
	 */
	let isTermsPopupOpen = false;

	/**
	 * Boolean variable to control wether or not to redirect when order is placed
	 */
	export let redirectOnPlaceOrder = true;

	/**
	 * Boolean variable to control wether or not to redirect when order is placed in case of Iframe
	 */
	export let isParentIframed = false;

	let showMiniOverview;

	let selectedPaymentMethod;
	let selectedCardOption;
	let selectedShippingAddress;

	/**
	 * Boolean variable to control if Click To Pay modal is open or not
	 */
	let isC2POpen = false;
	let c2pOTPDestination;
	let tokenizeC2P;
	let c2pUnlockStart;
	let isC2PInProgress;
	let c2pCards;
	let isUserLoggedInC2p;
	let isCvvRequired = false;
	let cvvConfirmationValue = '';

	/**
	 * Boolean variable to set the first card from C2P if needed
	 */
	let setFirstCard;

	let headerDisplay = 'email';
	let subheaderName = 'name';

	export let isOrderPlaced = false;

	// Determine which methods are allowed when the cart is updated
	$: {
		allowShopPay = false;
		// allowShopPay = $cart?.payment_method_options?.some(
		// 	(p) => p.type === 'ShopPay' || p.wallet === 'shoppay'
		// );
		allowPayPal =
			// TODO: Improve all adapters to return the following field correctly
			// $cart?.payment_method_options?.some((p) => p.type === 'PayPal') &&
			$cart?.shop_properties?.paypal;
		allowMerchantLogin = $cart?.session?.requires_login && !$cart?.session?.is_logged_in;
	}

	// Automatically set the first shipping info option when cart is loaded
	$: {
		if ($cart?.shipping_info_options?.[0]) {
			if (savedAddresses.length < 1) {
				savedAddresses = savedAddresses.concat($cart?.shipping_info_options);
			}

			if (!$cart?.shipping_info) {
				const savedAddress = selectFirstValidAddress($cart.shipping_info_options);
				setShippingInfo?.(savedAddress);
				onSetShippingInfo(savedAddress);
			} else {
				if (!selectedShippingAddress) {
					let shippingOption = savedAddresses?.find((shipping) =>
						Object.keys(shipping).every(
							(key) => $cart?.shipping_info[key] === shipping[key]
						)
					);
					selectedShippingAddress = shippingOption || NEW_SHIPPING_ADDRESS;
				}
			}
		}
	}

	let itemCount = 0;
	$: {
		itemCount = $cart?.line_items?.reduce?.((sum, l) => sum + l.quantity, 0) || 0;
	}

	// Forms and form errors
	let emailField;
	let email;
	let email_error = '';
	let shipping_info_error;
	let getShippingInfo;
	let setShippingInfo;
	let shouldTryFocusOnPaymentTab = false;
	let isShippingAddrComplete = false;

	let shouldChangeTheFocus;

	$: {
		if ((isShippingAddrComplete || savedAddresses.length > 0) && shouldChangeTheFocus) {
			shouldTryFocusOnPaymentTab = true;
		}
	}

	let place_order_error = '';

	// Collapsed checkout
	let collapsedStateShipping = true;
	let collapsedStateShippingMethod = true;
	let collapsedStatePayment = true;
	let previousCart;

	// Update the shipping and contact forms when the cart is updated
	$: {
		// Shipping Address
		if (setShippingInfo && $cart?.shipping_info) {
			setShippingInfo($cart.shipping_info);
		}
	}

	// Boolean flag to check if the savedCreditCard was already auto-select. If so, we don't keep doing this.
	let savedCreditCardAutoSelected = false;

	// Updated Saved Credit Cards when the cart is updated
	$: {
		savedCreditCards = ($cart?.payment_method_options || []).concat(c2pCards || []);

		// Try to auto select the credit cards or a new card
		if (
			(!selectedCardOption || setFirstCard || savedCreditCards.length !== 0) &&
			!savedCreditCardAutoSelected
		) {
			selectedCardOption =
				savedCreditCards.filter((c) => c.last_four)?.[0]?.id ||
				savedCreditCards.filter((c) => c.last_four)?.[0]?.pan ||
				NEW_CARD_OPTION;

			// set this flag to true so that we don't keep selecting the first credit card all the time
			if (selectedCardOption !== NEW_CARD_OPTION) {
				savedCreditCardAutoSelected = true;
			}

			setFirstCard = false;
		}

		if (
			($cart && !previousCart) ||
			($cart && paypalConnected && !previousCart?.payment_method?.attributes?.paypal_token)
		) {
			setEmail();
			// A cart got added to the page. i.e., Session Transfer has just been performed.
			// Collapse the shipping info if there is already one set to the cart.
			collapsedStateShipping = !!$cart.shipping_info || !!$cart.shipping_info_options?.[0];
			// Collapse the shipping method if there is already one set to the cart.
			collapsedStateShippingMethod =
				!!$cart.shipping_method || !!$cart.shipping_info_options?.[0];
			// Collapse the shipping method if there is already one set to the cart.
			collapsedStatePayment = selectedCardOption && selectedCardOption !== NEW_CARD_OPTION;
			if (collapsedStatePayment && !selectedPaymentMethod) {
				selectedPaymentMethod = 'CreditCard';
			}

			// Reset the errors
			email_error = '';
			shipping_info_error = '';
			place_order_error = '';

			if (email) {
				validateEmail(true);
			}

			if (selectedPaymentMethod !== 'PayPal' && email && isC2PAvailable()) {
				validateAndSubmitContactInfo();
			}

			// Automatically set the shipping info if there is none yet set.
			if (!$cart.shipping_info && $cart.shipping_info_options?.[0]) {
				// Update fields so the user understands what is happening.
				setShippingInfo?.(savedAddresses[0]);
				onSetShippingInfo(savedAddresses[0]);
			}
		}
		previousCart = $cart;
	}

	let validateAndSubmitShipping;
	let validateCreditCard;

	let creditCard;
	let savedCreditCards = [];
	let savedAddresses = [];

	let focusOnPhone;

	/**
	 * Wheter billing address should be the same as shipping as default
	 */
	let isBillingSameShipping = true;

	let getBillingInfo;

	function generateShippingInfoObj() {
		const shippingInfo = collapsedStateShipping ? $cart.shipping_info : getShippingInfo();
		return {
			...shippingInfo,
			email
		};
	}

	function generateBillingInfoObj() {
		return {
			...getBillingInfo(),
			email
		};
	}

	function setEmail() {
		email =
			email || $cart?.shipping_info?.email || $cart?.shipping_info_options?.[0]?.email || '';
	}

	function areModalsClosed() {
		return !isC2POpen && !isShopPayOpen && !isMerchantLoginOpen;
	}

	async function addLineItem(sku, quantity, variantHandles) {
		let totalQuantity = 0;
		try {
			shippingMethodInProgress = true;
			const result = await window.firmly.cartAddLineItem(sku, quantity, variantHandles);
			if (result.status === 200) {
				result.data.line_items.forEach((item) => {
					totalQuantity += item.quantity;
				});
				cart.set(result.data);
			} else {
				// TODO: Show error to the user
			}
		} finally {
			shippingMethodInProgress = false;
			postQuantityUpdated(totalQuantity);
		}
	}

	async function updateQuantity(item, quantity) {
		let totalQuantity = 0;
		try {
			shippingMethodInProgress = true;
			const productIdentifier =
				$cart.platform_id === 'bigcommerce' ? item.base_sku : item.sku;
			const result = await window.firmly.cartUpdateSku(
				productIdentifier,
				quantity,
				item.variant_handles
			);

			if (result.status === 200) {
				// Only add an UNDO notice if it is not the last item.
				// The current behavior is to close the checkout window if it is
				// the last item.
				if (result.data?.line_items?.length > 0) {
					// If the item was removed, add an UNDO action in the notices.
					result.data.line_items.forEach((item) => {
						totalQuantity += item.quantity;
					});

					if (quantity === 0) {
						notices = notices.concat({
							text: `Product ${item.description} has been removed.`,
							timeout: 15000,
							undoCallback: () =>
								addLineItem(productIdentifier, item.quantity, item.variant_handles),
							closeable: true,
							image: item.image?.url
						});
					}
				}

				cart.set(result.data);
			} else {
				// TODO: Show error to the user
			}
		} finally {
			shippingMethodInProgress = false;
			postQuantityUpdated(totalQuantity);
		}
	}

	function contactAndShippingChanged(shippingInfo) {
		const cartShippingInfo = {
			first_name: $cart?.shipping_info?.first_name,
			last_name: $cart?.shipping_info?.last_name,
			address1: $cart?.shipping_info?.address1,
			address2: $cart?.shipping_info?.address2,
			city: $cart?.shipping_info?.city,
			state_or_province: $cart?.shipping_info?.state_or_province,
			postal_code: $cart?.shipping_info?.postal_code,
			phone: $cart?.shipping_info?.phone,
			country: $cart?.shipping_info?.country,
			email: $cart?.shipping_info?.email
		};

		return !isEqual(shippingInfo, cartShippingInfo);
	}

	function canSubmitPhone(shippingInfo) {
		return optionalFields.shipping_phone || shippingInfo?.phone;
	}

	// Callbacks from components/views interactions
	async function onSetShippingInfo(newShippingInfo) {
		const shippingInfo = newShippingInfo || generateShippingInfoObj();

		if (!canSubmitPhone(shippingInfo)) {
			// If phone is mandatory but not filled, we focus on that field and cancel shipping info submission
			if (focusOnPhone) {
				shouldChangeTheFocus = false;
				focusOnPhone();
			}
		} else if (contactAndShippingChanged(shippingInfo) && (await validateEmail())) {
			try {
				shippingInfoInProgress = true;

				// Store the original cart state to restore if the API call fails
				const originalCart = $cart;

				// Create a temporary optimistic update for the UI
				// This clones the current cart and updates the shipping info
				const optimisticCart = { ...$cart, shipping_info: { ...shippingInfo } };
				cart.set(optimisticCart);

				// Make the actual API call
				const result = await window.firmly.cartUpdateShippingInfo(shippingInfo);

				if (result.status === 200) {
					// Real update from the server
					cart.set(result.data);
					shipping_info_error = '';
				} else {
					// Restore the original cart state if there's an error
					cart.set(originalCart);
					shipping_info_error =
						result.data?.description || 'Please, verify your shipping address';
					selectedShippingAddress = NEW_SHIPPING_ADDRESS;
					collapsedStateShipping = false;
					collapsedStateShippingMethod = false;
				}
			} catch (e) {
				shipping_info_error = e.description || 'Please, verify your shipping address';
				selectedShippingAddress = NEW_SHIPPING_ADDRESS;
				collapsedStateShipping = false;
				collapsedStateShippingMethod = false;
			} finally {
				shippingInfoInProgress = false;
			}
		}
	}

	async function validateEmail(showSchemaErrors) {
		try {
			email_error = '';
			await Yup.string().email().required(Required).validate(email);
			return true;
		} catch (e) {
			if (showSchemaErrors || e.type !== 'required') {
				email_error = e.message;
			}
			return false;
		}
	}

	function isC2PAvailable() {
		return true;
	}

	let merchantLoginCurrentStep;
	let canCloseMechantLoginModal = true;

	async function merchantLoginCreateOtp(email) {
		const createOtpResponse = await window.firmly.sessionCreateOtp(email);

		// User exists on merchant. OTP is required.
		if (createOtpResponse.status === 200) {
			merchantLoginCurrentStep = BASE_LOGIN_STEPS.WAITING_OTP;
			canCloseMechantLoginModal = false;
			isMerchantLoginOpen = true;
			return true;
		}

		return false;
	}

	let previouslyValidatedEmail = '';

	async function validateAndSubmitContactInfo() {
		const isEmailValid = (await validateEmail()) && email !== previouslyValidatedEmail;

		previouslyValidatedEmail = email;

		if (isEmailValid) {
			if (
				$cart.session?.requires_login &&
				!$cart.session?.is_logged_in &&
				areModalsClosed()
			) {
				await merchantLoginCreateOtp(email);
			}

			if (isC2PAvailable() && areModalsClosed() && !isUserLoggedInC2p && !isC2PInProgress) {
				await c2pUnlockStart(email);
			}

			await validateAndSubmitShipping();
		}
	}

	async function onSetShippingMethod({ detail: shippingMethodSku }) {
		try {
			shippingMethodInProgress = true;
			const result = await window.firmly.cartUpdateDelivery(shippingMethodSku);
			if (result.status === 200) {
				cart.set(result.data);
			}
		} catch (e) {
			// TODO: Show error to the user
			console.error('Failed when setting shipping method', e);
		} finally {
			shippingMethodInProgress = false;
		}
	}

	function onCreditCardUpdated(data) {
		creditCard = data;
	}

	let getConsentsInProgress = false;
	let consentsRetrieved = false;
	let marketingConsent;
	let isMarketingConsentSigned;

	async function getConsents() {
		if (!getConsentsInProgress) {
			getConsentsInProgress = true;
			const consents = await window.firmly.getConsents();
			marketingConsent = (consents?.data?.consents || []).find(
				(consent) => consent.type === 'marketing'
			);

			if (marketingConsent) {
				// If the Marketing Consent exists, let's process the metadata to see if there is any terms to be shown to the user
				const results = marketingConsent.text.split(/(%fterms{.*?}%)/g);
				marketingConsent.parts = results.map((e) => {
					if (e.startsWith('%fterms')) {
						const stringifiedJson = e.replace(/^%fterms/, '').replace(/%$/, '');
						const text = JSON.parse(stringifiedJson).text;
						return {
							type: 'terms',
							content: text
						};
					}

					return {
						type: 'text',
						content: e
					};
				});
			}

			consentsRetrieved = true;
			getConsentsInProgress = false;
		}
	}

	// Get consents when the cart is available
	$: if (typeof window !== 'undefined' && $cart && !marketingConsent && !consentsRetrieved) {
		getConsents();
	}

	function onPaypalHandler(cartData) {
		selectedPaymentMethod = 'PayPal';
		paypalConnected = true;
		email = cartData?.shipping_info?.email;
		cart.set(cartData);
	}

	async function placeOrderPayPal() {
		const isEmailvalid = await validateEmail(true);
		const isShippingValid = await isShippingAddressValid();

		const attributes = {
			paypal_token: $cart.payment_method?.attributes?.paypal_token,
			payer_id: paypalPayerId
		};

		if (isEmailvalid && isShippingValid) {
			const completeOrderResponse = await window.firmly.paypalCompleteOrder(attributes);
			if (completeOrderResponse.status !== 200) {
				place_order_error = completeOrderResponse.data.description;
				return;
			}

			return completeOrderResponse.data;
		}
	}

	async function placeOrderManualCreditCard() {
		let completeOrderResponse;
		const billingInfo = isBillingSameShipping
			? generateShippingInfoObj()
			: generateBillingInfoObj();
		const ccInfo = {
			credit_card: {
				name: `${billingInfo.first_name} ${billingInfo.last_name || ''}`.trim(),
				...creditCard
			},
			billing_info: billingInfo
		};

		completeOrderResponse = await window.firmly.paymentCompleteOrderV3(
			ccInfo,
			$cart.payment_handle
		);

		if (completeOrderResponse.status !== 200) {
			place_order_error =
				completeOrderResponse.data.description || completeOrderResponse.data;
			return;
		}

		if (completeOrderResponse.data.notice) {
			// Update cart, so we can show the notice and update the cart
			cart.set(completeOrderResponse.data);
			return;
		} else {
			return completeOrderResponse.data;
		}
	}

	let notices = [];

	const noticesMapping = {
		CART_ITEMS_REMOVED: {
			text: 'Cart has changed. Please review the cart.',
			timeout: 15000,
			undoable: false,
			closeable: true
		}
	};

	$: {
		if ($cart?.notice) {
			notices = notices || [];
			const newNotices = $cart.notice.map((notice) => ({
				...noticesMapping[notice],
				id: crypto.randomUUID() // To avoid race condition when deleting a notice
			}));

			notices = notices.concat(newNotices);
		}
	}

	async function placeOrderMerchant(selectedCard) {
		const placeOrderResponse = await window.firmly.cartSavedPaymentCompleteOrder(
			selectedCard.id || selectedCard.pan
		);
		if (placeOrderResponse.status !== 200) {
			place_order_error = placeOrderResponse.data?.description || placeOrderResponse.data;
			return;
		}

		return placeOrderResponse.data;
	}

	async function placeOrderShopPay() {
		const tokenizeResponse = await window.firmly.paymentShopPayTokenize(selectedCardOption);
		if (tokenizeResponse.status !== 200) {
			place_order_error = tokenizeResponse.data.description || tokenizeResponse.data;
			return;
		}

		const placeOrderResponse = await window.firmly.cartCompleteOrder(
			tokenizeResponse.data.token
		);
		if (placeOrderResponse.status !== 200) {
			place_order_error = placeOrderResponse.data.description || placeOrderResponse.data;
			return;
		}

		return placeOrderResponse.data;
	}

	async function placeOrderC2P(selectedCard, additionalData = {}) {
		const tokenizeResponse = await tokenizeC2P(
			selectedCard,
			additionalData,
			cvvConfirmationValue
		);

		if (tokenizeResponse.cvv_required) {
			isCvvRequired = true;
			return;
		}

		if (tokenizeResponse?.token) {
			isCvvRequired = false;
			cvvConfirmationValue = '';

			const placeOrderResponse = await window.firmly.cartCompleteOrder(
				tokenizeResponse.token
			);
			if (placeOrderResponse.status !== 200) {
				place_order_error = placeOrderResponse.data.description || placeOrderResponse.data;
				return;
			}

			return placeOrderResponse.data;
		} else if (tokenizeResponse.place_order_error) {
			place_order_error = tokenizeResponse.place_order_error;
		}
	}

	async function isShippingAddressValid() {
		if (validateAndSubmitShipping) {
			// Verify if typed shipping info needs to be validated and submitted.
			return !selectedShippingAddress || selectedShippingAddress === NEW_SHIPPING_ADDRESS
				? await validateAndSubmitShipping(true, false)
				: true;
		} else {
			// Shipping info already exists in cart.
			return !!$cart.shipping_info;
		}
	}

	async function placeOrderCreditCard(additionalData) {
		const isEmailvalid = await validateEmail(true);
		const isShippingValid = await isShippingAddressValid();

		if (selectedCardOption === NEW_CARD_OPTION) {
			const isCreditCardValid = await validateCreditCard(null, true);

			if (isEmailvalid && isShippingValid && isCreditCardValid) {
				return placeOrderManualCreditCard();
			}
		} else {
			const selectedCard =
				savedCreditCards.find((c) => c.id === selectedCardOption) ||
				savedCreditCards.find((c) => c.pan === selectedCardOption);
			if (selectedCard.wallet === 'shoppay' && isEmailvalid && isShippingValid) {
				return placeOrderShopPay();
			} else if (selectedCard.wallet === 'c2p' && isEmailvalid && isShippingValid) {
				return placeOrderC2P(selectedCard, additionalData);
			} else if (
				(selectedCard.wallet === 'merchant' || selectedCard.wallet === 'test') &&
				isEmailvalid &&
				isShippingValid
			) {
				return placeOrderMerchant(selectedCard);
			}
		}
	}

	async function registerEmailOnMerchant() {
		if ($cart.session?.requires_login && !$cart.session?.is_email_registered) {
			const pass = getRandonPassword();
			const result = await window.firmly.sessionJoin(pass);
			if (result.status === 200) {
				cart.set(result.data);
				postSignIn(result.data.session.cookies);
			} else {
				place_order_error = 'There was an error while placing the order';
				// TODO: This needs to raise a crashlytics alert.
				throw new Error('Unable to create a client account on the merchant');
			}
		}
	}

	async function onPlaceOrder(additionalData = {}) {
		try {
			placeOrderInProgress = true;

			if ($cart.session?.requires_login) {
				// Validate the email on the order before trying to create OTP or register the account
				const isEmailvalid = await validateEmail(true);
				if (!isEmailvalid) {
					// Focusing on the email field from a button click action cannot be done synchonously.
					// For it to be effective, run as a timer.
					setTimeout(() => {
						emailField.focus();
					}, 10);
					return;
				}

				// Verify if the merchant requires login and user is logged in
				if ($cart.session?.is_email_registered && !$cart.session?.is_logged_in) {
					// This merchant requires login, the email exists in the merchant database
					// however, the customer is not yet logged in.
					const result = await merchantLoginCreateOtp($cart.shipping_info.email);
					if (!result) {
						place_order_error = 'Failed to issue an OTP for this user';
					}
					return;
				}

				await registerEmailOnMerchant();
			}

			if (isMarketingConsentSigned) {
				const marketingConsentToSign = {
					consents: [
						{
							id: marketingConsent.id
						}
					]
				};

				await window.firmly.setConsents(marketingConsentToSign);
			}

			let orderPlaceResponse;
			if (selectedPaymentMethod === 'CreditCard') {
				orderPlaceResponse = await placeOrderCreditCard(additionalData);
			} else if (selectedPaymentMethod === 'PayPal') {
				orderPlaceResponse = await placeOrderPayPal();
			} else {
				// Unexpected
			}

			if (orderPlaceResponse) {
				isOrderPlaced = true;
				if (
					redirectOnPlaceOrder &&
					orderPlaceResponse.urls?.thank_you_page &&
					!isParentIframed
				) {
					postOrderPlaced(
						orderPlaceResponse.urls.thank_you_page,
						orderPlaceResponse.session
					);
				} else {
					dispatch('orderPlacedEvent', {
						order: orderPlaceResponse
					});
				}
			}
		} finally {
			placeOrderInProgress = false;
		}
	}

	function selectFirstValidAddress(savedAddresses = []) {
		let shippingInfoToSet;

		if (savedAddresses.length > 0) {
			// If phone is optional, we get the first address. Otherwise, we need to find the first address with phone set up
			shippingInfoToSet = optionalFields.shipping_phone
				? savedAddresses[0]
				: savedAddresses.find((address) => address.phone);

			// If phone is mandatory and no saved address has phone, we choose the first one and render the address field
			if (!shippingInfoToSet) {
				shippingInfoToSet = savedAddresses[0];
				selectedShippingAddress = NEW_SHIPPING_ADDRESS;
			} else {
				selectedShippingAddress = shippingInfoToSet;
			}
		}

		return shippingInfoToSet;
	}

	function updateCreditCardsAndAddresses(eventDetail, wallet) {
		// Remove any wallet cards from potential prior logins
		savedCreditCards = savedCreditCards.filter((c) => c.wallet !== wallet);

		savedCreditCards = savedCreditCards.concat(eventDetail.payment_method_options);
		savedAddresses = savedAddresses.concat(eventDetail.shipping_info_options);

		// Automatically select the first card on the list
		selectedCardOption =
			savedCreditCards.filter((c) => c.last_four)?.[0]?.id ||
			savedCreditCards.filter((c) => c.pan)?.[0]?.pan ||
			NEW_CARD_OPTION;

		// Automatically set the shipping info if there is none yet set.
		if (!$cart.shipping_info && savedAddresses[0]) {
			const savedAddress = selectFirstValidAddress(savedAddresses);

			// Update fields so the user understands what is happening.
			setShippingInfo?.(savedAddress);
			onSetShippingInfo(savedAddress);

			if (wallet === 'shoppay' && selectedShippingAddress !== NEW_SHIPPING_ADDRESS) {
				collapsedStateShipping = true;
				collapsedStateShippingMethod = true;
			}
		}
	}

	function onShopPayLoginSuccess(event) {
		isShopPayOpen = false;
		email = event.detail.email;
		updateCreditCardsAndAddresses(event.detail, 'shoppay');
	}

	function onMerchantLoginSuccess(event) {
		isMerchantLoginOpen = false;
		cart.set(event.detail);
		email = event.detail.email;

		updateCreditCardsAndAddresses(event.detail, 'merchant');
	}

	async function loginButtonClicked(event) {
		event.preventDefault();
		isMerchantLoginOpen = true;
	}

	function onC2PLoginSuccess(event) {
		c2pCards = event.detail.payment_method_options;
		savedAddresses.concat(event.detail.shipping_info_options);
		setFirstCard = true;
	}

	function handleC2PAuthenticate(event) {
		const assuranceData = event.detail.assuranceData;
		onPlaceOrder(assuranceData);
	}

	async function handleSetShippingInfo(event) {
		const shippingInfo = event.detail?.selectedShippingAddress;

		if (shippingInfo !== NEW_SHIPPING_ADDRESS) {
			await onSetShippingInfo(shippingInfo);
		}
	}

	let shippingAutoCompleteEnabled = true;

	$: {
		shippingAutoCompleteEnabled = !isShopPayOpen && !isMerchantLoginOpen && !isC2POpen;
	}

	// Promo code section
	async function addPromoCodeCallback(promoCode) {
		const result = await window.firmly.addPromoCode(promoCode);
		if (result.status === 200) {
			cart.set(result.data);
		} else {
			throw result.data;
		}
	}

	async function clearPromoCodesCallback() {
		const result = await window.firmly.clearPromoCodes();
		if (result.status === 200) {
			cart.set(result.data);
		} else {
			// TODO: How to show such error to the user?
		}
	}
	// end of Promo code section
	//
</script>

<div class="@container relative min-h-full">
	<div class="@md:bg-fy-primary absolute top-0 left-0 h-full w-1/2"></div>
	<div class="@md:bg-fy-background absolute top-0 right-0 h-full w-1/2 shadow"></div>
	<div class="relative flex w-full flex-col items-center justify-center">
		<div class="sticky top-0 z-[120] w-full @md:hidden">
			<Header
				merchantInfo={{
					displayName: $cart?.display_name || $cart?.shop_id,
					largeLogo,
					smallLogo
				}}
				total={$cart?.total}
				{itemCount}
				skeleton={!$cart?.line_items?.length}
				{showMiniOverview}
				bind:toggleExpanded={toggleHeaderExpanded}
				on:back-click
			>
				<div
					slot="smallSummary"
					class="relative mx-2 h-7 w-7 rounded bg-gray-300 bg-cover shadow"
					style={`background-image: url(${$cart?.line_items?.[0]?.image.url});`}
				>
					<span
						class={classNames(
							'bg-fy-alert',
							'text-fy-on-alert',
							'shadow',
							'absolute',
							'rounded-full',
							'w-4',
							'h-4',
							'text-xs',
							'right-[-5px]',
							'bottom-[-5px]',
							'flex',
							'items-center',
							'justify-center',
							'font-bold'
						)}
					>
						{itemCount > 0 ? itemCount : '?'}
					</span>
				</div>
				<div class="h-full overflow-auto px-4">
					<div class="bg-fy-primary w-full">
						<!--  Hack for showing to kardiel. This should become a configurations of the merchant's theme
					  It should be passed to the UI along with the colors, etc. -->
						<Summary
							displayMode="header"
							calculating={shippingInfoInProgress || shippingMethodInProgress}
							lineItems={$cart?.line_items}
							discount={$cart?.cart_discount}
							discountsBreakdown={$cart?.cart_discount_breakdown}
							storeCredit={$cart?.store_credit}
							rewardPoints={$cart?.reward_points}
							coupons={$cart?.coupons}
							subtotal={$cart?.sub_total}
							shippingMethod={$cart?.shipping_method}
							tax={$cart?.tax}
							total={$cart?.total}
							{updateQuantity}
							disabled={shippingInfoInProgress ||
								shippingMethodInProgress ||
								placeOrderInProgress}
							{addPromoCodeCallback}
							{clearPromoCodesCallback}
							showImageBorder={$cart?.shop_id !== 'kardiel.com'}
						/>
					</div>
				</div>
			</Header>
		</div>
		<form
			class="w-full @md:flex @md:max-w-[1024px] @md:flex-row @md:justify-around"
			on:submit={onPlaceOrder}
		>
			<section
				class="flex flex-col items-center @md:h-full @md:w-1/2 @md:max-w-[412px] @md:py-16"
			>
				<Overview
					on:back-click
					total={$cart?.total}
					images={$cart?.line_items?.map?.((l) => l.image.medium || l.image.url)}
					itemQuantity={$cart?.line_items?.reduce?.((sum, l) => sum + l.quantity, 0)}
					toggleExpanded={toggleHeaderExpanded}
					merchantInfo={{
						displayName: $cart?.display_name || $cart?.shop_id,
						largeLogo,
						smallLogo
					}}
					bind:showMiniOverview
				>
					<div class="bg-fy-primary w-full">
						<!--  Hack for showing to kardiel. This should become a configurations of the merchant's theme
						  It should be passed to the UI along with the colors, etc. -->
						<Summary
							displayMode="header"
							calculating={shippingInfoInProgress || shippingMethodInProgress}
							lineItems={$cart?.line_items}
							discount={$cart?.cart_discount}
							discountsBreakdown={$cart?.cart_discount_breakdown}
							storeCredit={$cart?.store_credit}
							rewardPoints={$cart?.reward_points}
							coupons={$cart?.coupons}
							subtotal={$cart?.sub_total}
							shippingMethod={$cart?.shipping_method}
							tax={$cart?.tax}
							total={$cart?.total}
							{updateQuantity}
							disabled={shippingInfoInProgress ||
								shippingMethodInProgress ||
								placeOrderInProgress}
							{addPromoCodeCallback}
							{clearPromoCodesCallback}
							showImageBorder={$cart?.shop_id !== 'kardiel.com'}
						/>
					</div>
				</Overview>
				<div class="grow"></div>
				<div class="text-fy-on-primary-subtle hidden text-center text-xs @md:block">
					<FooterLinks />
				</div>

				<Notices bind:notices />
			</section>
			<section class="bg-fy-background @md:w-1/2 @md:max-w-[412px] @md:py-16">
				<!-- Skeleton -->
				{#if !$cart}
					<div class="flex flex-col gap-4 p-4 @md:p-0 @md:px-4">
						<div class="grid grid-cols-1 gap-4">
							<div class="flex justify-center">
								<div
									class="bg-fy-on-primary-subtle2 h-8 w-full animate-pulse rounded-lg px-4 py-2"
								></div>
							</div>
							<div class="flex justify-center">
								<div
									class="bg-fy-on-primary-subtle2 h-8 w-full animate-pulse rounded-lg px-4 py-2"
								></div>
							</div>
						</div>
						<div
							class="text-fy-on-primary-subtle relative flex w-full flex-row justify-center"
						>
							<div
								class="absolute left-0 flex h-full w-full flex-col justify-center"
								style="z-index: -1;"
							>
								<hr class="h-[1px] w-full" />
							</div>
						</div>
						<div>
							<div
								class="bg-fy-on-primary-subtle2 my-1 h-4 w-40 animate-pulse rounded px-4"
							></div>
						</div>
						<div>
							<div
								class="bg-fy-on-primary-subtle2 my-1 h-3 w-12 animate-pulse rounded px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 my-1 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
						</div>
						<div class="my-1 grid grid-cols-2 gap-1">
							<div
								class="bg-fy-on-primary-subtle2 col-span-2 my-1 h-3 w-32 animate-pulse rounded px-4"
							></div>

							<div
								class="bg-fy-on-primary-subtle2 col-span-2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 col-span-2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 col-span-2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 col-span-2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 col-span-2 h-10 w-full animate-pulse rounded-lg px-4"
							></div>
						</div>
						<div class="mt-4 flex flex-col items-center justify-center">
							<div
								class="bg-fy-on-primary-subtle2 h-16 w-full animate-pulse rounded-lg px-4 py-2"
							></div>
							<div
								class="bg-fy-on-primary-subtle2 my-3 h-4 w-64 animate-pulse rounded-lg px-4"
							></div>
						</div>
					</div>
				{:else}
					<div class="flex flex-col p-4 @md:px-4 @md:py-0">
						{#if allowMerchantLogin || allowShopPay || allowPayPal}
							<div class="grid grid-cols-1 gap-4 py-2">
								{#if allowMerchantLogin}
									<LoginButton
										{smallLogo}
										{largeLogo}
										merchantName={$cart?.display_name}
										disabled={isC2PInProgress || placeOrderInProgress}
										on:click={loginButtonClicked}
									/>
								{/if}
								{#if allowShopPay}
									<div class="flex justify-center">
										<button
											type="button"
											class="flex w-full flex-row items-center justify-center rounded bg-[#5a31f4] px-4 py-2 text-white shadow hover:bg-[#390ced]"
											disabled={isC2PInProgress || placeOrderInProgress}
											data-testid="shoppay-button"
											on:click={() => (isShopPayOpen = true)}
										>
											<ShopPayIcon
												class="fill-white px-2"
												width={84}
												height={32}
											/>
										</button>
									</div>
								{/if}
								{#if allowPayPal}
									<div
										class="my-1 flex h-12 w-full flex-row justify-center overflow-hidden rounded bg-[#ffc439] shadow"
									>
										<Paypal
											class="w-full"
											label="paypal"
											{onPaypalHandler}
											merchantId={$cart.shop_properties.paypal.merchantId}
											clientId={$cart.shop_properties.paypal.clientId}
											integrationVersion={$cart.shop_properties.paypal
												?.integration_version}
											intent={$cart.shop_properties.paypal?.intent}
											bind:paypalPayerId
										/>
									</div>
								{/if}
							</div>
							<div
								class="text-fy-on-primary-subtle relative my-2 flex w-full flex-row justify-center"
							>
								<div
									class="absolute left-0 flex h-full w-full flex-col justify-center"
								>
									<hr class="h-[1px] w-full" />
								</div>
								<span class="bg-fy-background z-10 px-4 text-sm">
									Or pay another way
								</span>
							</div>
						{/if}
						{#if collapsedStateShipping}
							<div
								transition:fadeSlide
								class="pt-2"
								class:pb-2={!collapsedStateShippingMethod}
							>
								<Group>
									<div
										class="col-span-2 flex flex-row items-center justify-between rounded-t-lg p-5"
										class:rounded-b-lg={!collapsedStateShippingMethod}
									>
										{#if $cart.shipping_info}
											<div class="w-full">
												<span class="text-sm font-bold">{email}</span>
												<hr />
												<span class="text-sm">
													{$cart.shipping_info?.first_name}
													{$cart.shipping_info?.last_name} · {$cart
														.shipping_info?.address1}{$cart
														.shipping_info?.address2
														? `, ${$cart.shipping_info?.address2}`
														: ''}, {$cart.shipping_info?.city}, {$cart
														.shipping_info?.state_or_province}
													{$cart.shipping_info?.postal_code}
													{$cart.shipping_info?.phone
														? `· ${$cart.shipping_info?.phone}`
														: ''}
												</span>
											</div>
											<button
												type="button"
												class="ml-5 rounded-full px-1 text-sm text-blue-500"
												data-testid="change-shipping-button"
												on:click={() => {
													collapsedStateShipping = false;
													if (savedAddresses.length === 1) {
														selectedShippingAddress =
															NEW_SHIPPING_ADDRESS;
													}
												}}
											>
												Change
											</button>
										{:else}
											<div class="w-full">
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-48 animate-pulse rounded"
												></div>
												<hr />
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-48 animate-pulse rounded"
												></div>
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-32 animate-pulse rounded"
												></div>
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded"
												></div>
											</div>
											<div
												class="bg-fy-on-primary-subtle2 m-1 ml-5 h-4 w-16 animate-pulse rounded"
											></div>
										{/if}
									</div>
								</Group>
							</div>
						{:else}
							<div transition:fadeSlide class="py-2">
								<h2 class="font-semibold">Shipping Information</h2>
							</div>
							{#if savedAddresses.length > 1}
								<ShippingAddress
									{savedAddresses}
									{headerDisplay}
									{subheaderName}
									shippingInfo={$cart?.shippingInfo}
									disabled={shippingInfoInProgress}
									separator={false}
									on:set-shipping-info={handleSetShippingInfo}
									bind:selectedShippingAddress
									bind:isFormComplete={isShippingAddrComplete}
								/>
							{/if}
							{#if !savedAddresses || savedAddresses.length === 0 || selectedShippingAddress === NEW_SHIPPING_ADDRESS}
								<div class="py-2" transition:slide={{ duration: 150 }}>
									<div>
										<h3 class="py-1 text-sm">Email</h3>
										<Group>
											<div
												class="col-span-2 flex w-full flex-col justify-center rounded-lg"
											>
												<input
													class="placeholder:text-fy-on-primary-subtle w-full rounded-lg border-0 focus:z-[2] disabled:bg-gray-100"
													disabled={placeOrderInProgress ||
														$cart?.session?.is_logged_in}
													class:error={email_error}
													bind:this={emailField}
													bind:value={email}
													on:blur={() => {
														validateAndSubmitContactInfo();
													}}
													placeholder=""
													data-testid="email-input"
													autocomplete={shippingAutoCompleteEnabled
														? 'shipping email'
														: ''}
													type="email"
												/>
											</div>
										</Group>
										{#if email_error}
											<span class="text-fy-alert text-xs">
												{email_error}
											</span>
										{/if}
										{#if isC2PAvailable()}
											<div class="my-2 rounded-lg bg-[#F7F7F7] p-2">
												<span
													class="text-fy-on-surface-subtle inline-block text-sm leading-normal"
												>
													By entering your email, you consent and direct
													firmly to send your information to
													<span class="font-bold">Click to Pay</span> to check
													if you have any saved cards
												</span>
											</div>
										{/if}
										{#if marketingConsent && marketingConsent.ui_slot === 'UNDER_EMAIL_INPUT'}
											<Checkbox
												disabled={placeOrderInProgress}
												labelClasses="w-full pt-4 pb-4 flex rounded-lg"
												bind:isChecked={isMarketingConsentSigned}
											>
												<span
													slot="title"
													class="text-fy-on-surface-subtle pt-0.5 text-xs font-normal"
												>
													{#each marketingConsent.parts as part}
														{#if part.type === 'text'}
															{part.content}
														{/if}
														{#if part.type === 'terms'}
															<button
																type="button"
																on:click={() =>
																	(isTermsPopupOpen = true)}
																class="underline"
															>
																{part.content}
															</button>
														{/if}
													{/each}
												</span>
											</Checkbox>
										{/if}
									</div>
									<div>
										<h3 class="py-1 text-sm">Shipping Address</h3>
										<Address
											on:focusremoved={() => onSetShippingInfo()}
											{optionalFields}
											disabled={placeOrderInProgress}
											bind:validateAndSubmit={validateAndSubmitShipping}
											bind:getAddressInfo={getShippingInfo}
											bind:setAddressInfo={setShippingInfo}
											bind:address_info_error={shipping_info_error}
											bind:isFormComplete={isShippingAddrComplete}
											bind:shouldChangeTheFocus
											bind:focusOnPhone
										/>
									</div>
								</div>
							{/if}
						{/if}
						{#if collapsedStateShippingMethod}
							<div
								class:pt-2={!collapsedStateShipping}
								class:pb-2={!collapsedStatePayment}
								transition:fadeSlide
							>
								<Group>
									<div
										class="col-span-2 flex flex-row items-center p-5"
										class:rounded-t-lg={!collapsedStateShipping}
										class:rounded-b-lg={!collapsedStatePayment}
									>
										{#if $cart.shipping_method}
											<div class="w-full">
												<div class="flex flex-row justify-between text-sm">
													<span class="font-bold"
														>{$cart.shipping_method.description}</span
													>
													<span class="font-bold">
														{formatCurrency(
															$cart.shipping_method.price
														)}
													</span>
												</div>
												{#if $cart.shipping_method.estimate}
													<span class="text-xs"
														>$cart.shipping_method.estimate</span
													>
												{/if}
											</div>
											<button
												type="button"
												class="ml-5 rounded-full px-1 text-sm text-blue-500"
												on:click={() => {
													collapsedStateShippingMethod = false;
												}}
											>
												Change
											</button>
										{:else}
											<div class="w-full">
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-56 animate-pulse rounded"
												></div>
												<div
													class="bg-fy-on-primary-subtle2 m-1 h-4 w-24 animate-pulse rounded"
												></div>
											</div>
											<div
												class="bg-fy-on-primary-subtle2 m-1 h-4 w-16 animate-pulse rounded"
											></div>
										{/if}
									</div>
								</Group>
							</div>
						{:else}
							<div transition:fadeSlide>
								<h3 class="py-1 text-sm">Shipping Method</h3>
								{#if $cart?.shipping_method_options || shippingInfoInProgress}
									<ShippingMethodSelector
										shippingMethods={$cart?.shipping_method_options}
										selectedShippingMethod={$cart?.shipping_method?.sku}
										inProgress={shippingInfoInProgress}
										disabled={placeOrderInProgress || shippingMethodInProgress}
										on:set-shipping-method={onSetShippingMethod}
									/>
								{:else}
									<div class="my-2 rounded-lg bg-[#F7F7F7] p-2">
										<span class="text-fy-on-surface-subtle text-sm leading-3">
											Complete the shipping form to see the shipping methods.
										</span>
									</div>
								{/if}
							</div>
						{/if}
						{#if collapsedStatePayment}
							{@const selectedCard = savedCreditCards.find(
								(c) => selectedCardOption && (c.id || c.pan) === selectedCardOption
							)}
							<div
								class="pb-6"
								class:pt-2={!collapsedStateShippingMethod}
								transition:fadeSlide
							>
								<Group>
									<div
										class="col-span-2 flex flex-row items-center rounded-b-lg p-5"
										class:rounded-t-lg={!collapsedStateShippingMethod}
									>
										<ExistingCreditCard
											number="**** {selectedCard?.last_four}"
											type={selectedCard.card_type}
											customArtUrl={selectedCard?.art}
										/>
										<button
											type="button"
											class="ml-5 rounded-full px-1 text-sm text-blue-500"
											on:click={() => {
												collapsedStatePayment = false;
											}}
										>
											Change
										</button>
									</div>
								</Group>
							</div>
						{:else}
							<div class="py-2" transition:fadeSlide>
								<h2 class="font-semibold">Payment Method</h2>
								<!-- TODO: how to get the email from PayPal? -->
								<PaymentTabs
									allowedPaymentMethods={$cart?.payment_method_options?.map?.(
										(p) => p.type
									) || []}
									disabled={placeOrderInProgress}
									merchantId={$cart?.shop_properties?.paypal?.merchantId}
									intent={$cart?.shop_properties?.paypal?.intent}
									clientId={$cart?.shop_properties?.paypal?.clientId}
									connected={paypalConnected}
									email={paypalConnected
										? $cart?.payment_method?.attributes?.email || 'Unknown'
										: ''}
									{onCreditCardUpdated}
									{onPaypalHandler}
									{savedCreditCards}
									{shouldTryFocusOnPaymentTab}
									{isCvvRequired}
									bind:paypalPayerId
									bind:cvvConfirmationValue
									bind:validateCreditCard
									bind:selectedPaymentMethod
									bind:selectedCardOption
									bind:isBillingSameShipping
									bind:getBillingInfo
								>
									<div slot="under-tabs">
										{#if $cart?.available_store_credit?.value > 0}
											<Checkbox
												disabled={true}
												title="Apply {formatCurrency(
													$cart.store_credit
												)} from store credit ({formatCurrency(
													$cart.available_store_credit
												)} available)"
												isChecked={true}
											/>
										{/if}
									</div>
								</PaymentTabs>
							</div>
						{/if}
						{#if marketingConsent && marketingConsent.ui_slot === 'ABOVE_PLACE_ORDER_BUTTON'}
							<Checkbox
								disabled={placeOrderInProgress}
								bind:isChecked={isMarketingConsentSigned}
							>
								<span
									slot="title"
									class="text-fy-on-surface-subtle pt-0.5 text-xs font-normal"
								>
									{#each marketingConsent.parts as part}
										{#if part.type === 'text'}
											{part.content}
										{/if}
										{#if part.type === 'terms'}
											<button
												type="button"
												on:click={() => (isTermsPopupOpen = true)}
												class="underline"
											>
												{part.content}
											</button>
										{/if}
									{/each}
								</span>
							</Checkbox>
						{/if}

						<div class="h-full @md:hidden">
							<button
								class="flex w-full items-center justify-between rounded-lg py-2"
								type="button"
								aria-expanded={toggleLineItemsExpanded}
								aria-controls="order-summary-content"
								on:click={(ev) => {
									ev.stopPropagation();
									toggleLineItemsExpanded = !toggleLineItemsExpanded;
								}}
								on:keydown={(ev) => {
									if (ev.key === 'Enter' || ev.key === ' ') {
										ev.preventDefault();
										toggleLineItemsExpanded = !toggleLineItemsExpanded;
									}
								}}
							>
								<h2 class="font-semibold">Order Summary</h2>
								<div class="flex items-center">
									<span class="mr-2"
										>{toggleLineItemsExpanded ? 'Hide' : 'Show'}</span
									>
									<svg
										class="fill-fy-on-primary-subtle transition duration-300"
										class:rotate-180={!toggleLineItemsExpanded}
										xmlns="http://www.w3.org/2000/svg"
										width="10"
										height="6"
										viewBox="0 0 10 6"
										aria-hidden="true"
									>
										<path
											d="M1.6125 5.74287C1.41993 5.8873 1.18172 5.95742 0.941609 5.94035C0.7015 5.92329 0.475602 5.82019 0.305391 5.64998C0.13518 5.47977 0.0320787 5.25387 0.0150146 5.01376C-0.00204945 4.77365 0.0680685 4.53544 0.212498 4.34287L4.2125 0.34287C4.39943 0.159643 4.65075 0.057013 4.9125 0.057013C5.17425 0.057013 5.42557 0.159643 5.6125 0.34287L9.6125 4.34287C9.75693 4.53544 9.82705 4.77365 9.80998 5.01376C9.79292 5.25387 9.68982 5.47977 9.51961 5.64998C9.34939 5.82019 9.1235 5.92329 8.88339 5.94035C8.64328 5.95742 8.40507 5.8873 8.2125 5.74287L4.9125 2.45287L1.6125 5.75287V5.74287Z"
										/>
									</svg>
								</div>
							</button>
							<div class="flex flex-col">
								<div class="w-full">
									<Summary
										displayMode="collapsible"
										{toggleLineItemsExpanded}
										calculating={shippingInfoInProgress ||
											shippingMethodInProgress}
										lineItems={$cart?.line_items}
										discount={$cart?.cart_discount}
										discountsBreakdown={$cart?.cart_discount_breakdown}
										storeCredit={$cart?.store_credit}
										rewardPoints={$cart?.reward_points}
										coupons={$cart?.coupons}
										subtotal={$cart?.sub_total}
										shippingMethod={$cart?.shipping_method}
										tax={$cart?.tax}
										total={$cart?.total}
										{updateQuantity}
										disabled={shippingInfoInProgress ||
											shippingMethodInProgress ||
											placeOrderInProgress}
										{addPromoCodeCallback}
										{clearPromoCodesCallback}
										showImageBorder={$cart?.shop_id !== 'kardiel.com'}
									/>
								</div>
							</div>
						</div>
						{#if place_order_error}
							<span class="text-fy-alert py-2 text-xs">
								{place_order_error}
							</span>
						{/if}
						<Footer
							on:click={onPlaceOrder}
							disabled={shippingInfoInProgress ||
								shippingMethodInProgress ||
								(selectedPaymentMethod === 'PayPal' && !paypalConnected)}
							inProgress={placeOrderInProgress}
							total={$cart?.total}
							{isOrderPlaced}
							{termsOfUse}
							{privacyPolicy}
						/>
					</div>
				{/if}
			</section>
		</form>
		<Shoppay
			bind:isModalOpen={isShopPayOpen}
			on:login-successful={onShopPayLoginSuccess}
			{PUBLIC_DISABLE_HCAPTCHA}
		/>

		<!-- TODO: Pass termsOfServiceLink (Include it in AirTable all the way down here) -->
		<MerchantLogin
			bind:isModalOpen={isMerchantLoginOpen}
			merchantName={$cart?.display_name}
			privacyPolicyLink={$cart?.urls?.privacy_policy}
			merchantLogo={largeLogo}
			bind:currentStep={merchantLoginCurrentStep}
			bind:email
			bind:canCloseModal={canCloseMechantLoginModal}
			on:login-successful={onMerchantLoginSuccess}
		/>
		<ClickToPay
			on:login-c2p-successful={onC2PLoginSuccess}
			on:authenticate-c2p-successful={handleC2PAuthenticate}
			{c2pOTPDestination}
			bind:isModalOpen={isC2POpen}
			bind:tokenizeC2P
			bind:c2pUnlockStart
			bind:isUserLoggedInC2p
			bind:isC2PInProgress
		/>

		<TermsPopup bind:isModalOpen={isTermsPopupOpen} title={$cart?.display_name} />
	</div>
</div>

<style>
	input.error {
		color: var(--color-fy-alert);
		box-shadow: var(--color-fy-form-element-input-error);
		z-index: 2;
	}

	input:focus,
	button:focus {
		border: 0 !important;
		outline: 0 !important;
		z-index: 10;

		box-shadow: var(--color-fy-form-element-input-focus);
		transition-property: box-shadow, color, filter;
	}
</style>
