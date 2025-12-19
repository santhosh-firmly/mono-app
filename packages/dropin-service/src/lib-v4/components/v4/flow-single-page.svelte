<script>
	// @ts-nocheck
	import * as Yup from 'yup';
	import { Required } from '$lib-v4/browser/localization.js';
	import SpinnerIcon from '../common/svg/spinner-icon.svelte';
	import Paypal from '../payment/paypal.svelte';
	import Address from './address.svelte';
	import FooterLinks from './footer-links.svelte';
	import Footer from './footer.svelte';
	import Group from './group.svelte';
	import Overview from './overview.svelte';
	import PaymentTabs from './payment-tabs/payment-tabs.svelte';
	import ShippingMethodSelector from './shipping-method-selector.svelte';
	import Summary from './summary.svelte';
	import { isEqual, bindEvent } from '$lib-v4/browser/dash.js';
	import { writable } from 'svelte/store';
	import { postOrderPlaced, postQuantityUpdated, postSignIn } from '$lib-v4/browser/cross.js';
	import LoginButton from './login-button.svelte';
	import ClickToPayUnified from './view-model/click-to-pay-unified.svelte';
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
	import { trackUXEvent, createTraceContext } from '../../browser/telemetry.js';
	import { onFieldFocus, onFieldBlur, onFieldCompleted } from '../../browser/field-interaction-tracker.js';
	import { signOut } from '$lib-v4/clients/mastercard.js';
	import MastercardC2pLogo from '../common/svg/mastercard-c2p-logo.svelte';
	import stableStringify from 'json-stable-stringify';

	const dispatch = createEventDispatcher();
	/**
	 * Cart object representing the current cart contents and configurations
	 */
	export let cart = writable();

	// Error state for line items
	let lineItemErrors = {};

	// Check if there are optional fields
	let optionalFields = {};
	$: {
		optionalFields = $cart?.shop_properties?.optional_fields || {};
	}

	// --- Telemetry masking helpers ---
	function maskEmail(email) {
		if (!email) return '';
		const [user, domain] = email.split('@');
		if (!user || !domain) return '';
		return user[0] + '***' + user.slice(-1) + '@' + domain;
	}

	function maskPostalCode(postal) {
		if (!postal) return '';
		return postal.slice(0, 3) + '***';
	}

	let c2pShowMore = false;

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
	export let isProduction;
	export let shouldUseVisa = isProduction;
	export let isC2PSDKInitialized = false;
	export let partnerDisclaimer = null;
	export let buttonText = 'Place Order';

	/**
	 * Creates array of terms/disclaimers for footer
	 * @returns {Array} Array of term objects
	 */
	function createTermsArray() {
		const terms = [];

		// Add partner disclaimer if present
		if (partnerDisclaimer) {
			terms.push(partnerDisclaimer);
		}

		// Add merchant terms if present
		if (termsOfUse && privacyPolicy) {
			terms.push({
				text: 'By tapping "Buy Now", you agree to the seller`s Terms of Service, and Privacy Policy',
				links: {
					termsOfUse: termsOfUse,
					privacyPolicy: privacyPolicy
				}
			});
		}

		return terms;
	}

	// Controls the express payment buttons
	let allowMerchantLogin = true;
	let allowShopPay = false;
	let allowPayPal = false;

	let paypalConnected = false;
	let paypalPayerId = '';

	// Stitching header expanded state
	let toggleHeaderExpanded;
	let headerExpanded = false;

	/**
	 * Boolean variable to control if the line items are expanded or not in the Order Summary above the place order button
	 */
	let toggleLineItemsExpanded;

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

	// --- Telemetry: Card and Payment Method Selection ---
	let lastTrackedCardOption = null;
	let lastTrackedPaymentMethod = null;
	let cardSelectionInitialized = false;
	let paymentTabSelectionInitialized = false;

	$: {
		// Only track after initial mount/first assignment
		if (
			cardSelectionInitialized &&
			selectedCardOption !== lastTrackedCardOption &&
			savedCreditCards &&
			savedCreditCards.length > 0
		) {
			const card = savedCreditCards.find(
				(c) => c.id === selectedCardOption || c.pan === selectedCardOption
			);
			const cardType =
				card?.card_type ||
				(selectedCardOption === NEW_CARD_OPTION ? 'new_card' : undefined);

			if (cardType) {
				trackUXEvent('card_selected', { cardType });
			}
			lastTrackedCardOption = selectedCardOption;
		}
		if (!cardSelectionInitialized && selectedCardOption) {
			cardSelectionInitialized = true;
			lastTrackedCardOption = selectedCardOption;
		}
	}

	// --- Telemetry: Payment method interactions
	$: {
		if (
			paymentTabSelectionInitialized &&
			selectedPaymentMethod !== lastTrackedPaymentMethod &&
			selectedPaymentMethod
		) {
			trackUXEvent('payment_method_selected', { paymentMethod: selectedPaymentMethod });
			lastTrackedPaymentMethod = selectedPaymentMethod;
		}
		if (!paymentTabSelectionInitialized && selectedPaymentMethod) {
			paymentTabSelectionInitialized = true;
			lastTrackedPaymentMethod = selectedPaymentMethod;
		}
	}

	// --- Telemetry: Header interactions ---
	let headerExpandedInitialized = false;
	$: if (typeof headerExpanded === 'boolean') {
		if (headerExpandedInitialized) {
			trackUXEvent('header_order_summary_toggled', { expanded: headerExpanded });
		} else {
			headerExpandedInitialized = true;
		}
	}

	let selectedShippingAddress;

	// Array to track cards that require CVV
	let cardsRequiringCvv = [];
	let cvvConfirmationValue = '';

	// Clear CVV input when switching to a card that doesn't require CVV
	$: {
		if (!cardsRequiringCvv.includes(selectedCardOption)) {
			cvvConfirmationValue = '';
		}
	}

	/**
	 * Boolean variable to control if Click To Pay modal is open or not
	 */
	let isC2POpen = false;
	let c2pOTPDestination;
	let processC2PCheckout;
	let c2pUnlockStart;
	let isC2PInProgress;
	let c2pCards;
	let isUserLoggedInC2p;
	let cardRequiringCvv = null;
	let isEmailValidating = false;
	let c2pSignOutInProgress = false;

	/**
	 * Selects the most appropriate card from the available options
	 * @param {Array} cards - The available credit cards
	 * @returns {string} The ID of the selected card or NEW_CARD_OPTION
	 */
	function selectAvailableCard(cards) {
		if (!cards || cards.length === 0 || !cards.some((card) => card.last_four)) {
			return NEW_CARD_OPTION;
		}

		return (
			cards.filter((c) => c.last_four)[0]?.id ||
			cards.filter((c) => c.last_four)[0]?.pan ||
			NEW_CARD_OPTION
		);
	}

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

	// Payment method constants
	const PAYMENT_METHODS = {
		PAYPAL: 'PayPal',
		CREDIT_CARD: 'CreditCard'
	};

	/**
	 * Updates collapsed states based on current cart and connection status
	 * @throws {Error} If cart is not available
	 */
	function updateCollapsedStates() {
		if (!$cart) {
			console.warn('updateCollapsedStates called without cart');
			return;
		}

		collapsedStateShipping = !!$cart.shipping_info || !!$cart.shipping_info_options?.[0];
		collapsedStateShippingMethod =
			!!$cart.shipping_method || !!$cart.shipping_info_options?.[0];

		// Use original collapse logic - only prevent collapse when PayPal is actively connected
		if (paypalConnected && selectedPaymentMethod === PAYMENT_METHODS.PAYPAL) {
			// Keep expanded when PayPal is actively connected and selected
			collapsedStatePayment = false;
		} else {
			// Original logic for all other cases (including C2P)
			collapsedStatePayment = selectedCardOption && selectedCardOption !== NEW_CARD_OPTION;
		}
	}

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

		// Try to auto select the credit cards or a new card, but not if PayPal is connected
		if (
			(!selectedCardOption || setFirstCard || savedCreditCards.length !== 0) &&
			!savedCreditCardAutoSelected &&
			!paypalConnected
		) {
			selectedCardOption = selectAvailableCard(savedCreditCards);

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
			// Update collapsed states based on current cart and connection status
			updateCollapsedStates();

			// Only set CreditCard as default if no payment method is selected and PayPal isn't connected
			if (collapsedStatePayment && !selectedPaymentMethod && !paypalConnected) {
				selectedPaymentMethod = PAYMENT_METHODS.CREDIT_CARD;
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

			// Ensure PayPal selection is maintained when cart updates
			if (paypalConnected && selectedPaymentMethod !== PAYMENT_METHODS.PAYPAL) {
				selectedPaymentMethod = PAYMENT_METHODS.PAYPAL;
				selectedCardOption = null;
				collapsedStatePayment = false;
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

	// Telemetry tracking flags to avoid duplicate events
	let lastTrackedEmail = null;
	let lastTrackedShippingKey = null;

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
		return !isC2POpen && !isMerchantLoginOpen;
	}

	// Reset C2P state when email changes to allow validation of new email
	$: if (email) {
		isUserLoggedInC2p = false;
		isC2PInProgress = false;
	}

	async function addLineItem(sku, quantity, variantHandles) {
		let totalQuantity = 0;
		try {
			shippingMethodInProgress = true;
			const parentContext = trackUXEvent('cart_item_add', { sku, quantity });
			const result = await window.firmly.cartAddLineItem(
				sku,
				quantity,
				variantHandles,
				undefined,
				false,
				parentContext
			);
			if (result.status === 200) {
				result.data.line_items.forEach((item) => {
					totalQuantity += item.quantity;
				});
				cart.set(result.data);
			}
		} finally {
			shippingMethodInProgress = false;
			postQuantityUpdated(totalQuantity);
		}
	}

	async function updateQuantity(item, quantity) {
		let totalQuantity = 0;
		const oldQuantity = item.quantity;
		let errorMsg = '';
		try {
			shippingMethodInProgress = true;
			const productIdentifier =
				$cart.platform_id === 'bigcommerce' ? item.base_sku : item.sku;
			const parentContext = trackUXEvent('cart_item_update', {
				sku: productIdentifier,
				oldQuantity,
				newQuantity: quantity
			});
			const result = await window.firmly.cartUpdateSku(
				productIdentifier,
				quantity,
				item.variant_handles,
				undefined,
				parentContext
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
							undoCallback: () => {
								trackUXEvent('cart_item_undo', { sku: productIdentifier });
								addLineItem(productIdentifier, item.quantity, item.variant_handles);
							},
							closeable: true,
							image: item.image?.url
						});
					}
				}

				cart.set(result.data);
				// Clear error for this line item if previously set
				if (lineItemErrors[item.line_item_id]) {
					lineItemErrors = { ...lineItemErrors, [item.line_item_id]: '' };
				}
			} else {
				errorMsg =
					result?.data?.description || 'Unable to update quantity. Please try again.';
				lineItemErrors = { ...lineItemErrors, [item.line_item_id]: errorMsg };
			}
		} catch (err) {
			errorMsg = err?.message || 'Unable to update quantity. Please try again.';
			lineItemErrors = { ...lineItemErrors, [item.line_item_id]: errorMsg };
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

				// Create trace context BEFORE API call for distributed tracing
				const parentContext = createTraceContext();

				// Make the actual API call with parentContext
				const result = await window.firmly.cartUpdateShippingInfo(
					shippingInfo,
					undefined,
					parentContext
				);

				// Create a unique key with all relevant fields to detect any changes
				// Normalize address2 to empty string to avoid undefined vs '' inconsistency
				const shippingKey = stableStringify({
					first_name: shippingInfo.first_name,
					last_name: shippingInfo.last_name,
					address1: shippingInfo.address1,
					address2: shippingInfo.address2 ?? '',
					city: shippingInfo.city,
					state_or_province: shippingInfo.state_or_province,
					postal: shippingInfo.postal,
					country: shippingInfo.country,
					phone: shippingInfo.phone
				});

				if (shippingKey !== lastTrackedShippingKey) {
					trackUXEvent('shipping_address_added', {
						country: shippingInfo.country,
						postal: maskPostalCode(shippingInfo.postal)
					}, parentContext);
					lastTrackedShippingKey = shippingKey;
				}
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
		return isC2PSDKInitialized;
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

	async function validateAndSubmitContactInfo() {
		isEmailValidating = true;
		try {
			const isEmailValid = await validateEmail();
			if (isEmailValid) {
				// Track email field completion for abandonment analysis
				onFieldCompleted('email', email);

				// Track email entered only when it's actually being used in the flow
				if (email !== lastTrackedEmail) {
					trackUXEvent('email_entered', {
						email: maskEmail(email)
					});
					lastTrackedEmail = email;
				}

				if (
					$cart.session?.requires_login &&
					!$cart.session?.is_logged_in &&
					areModalsClosed()
				) {
					await merchantLoginCreateOtp(email);
				}

				if (isC2PAvailable() && areModalsClosed() && !isUserLoggedInC2p) {
					await c2pUnlockStart(email);
				}

				await validateAndSubmitShipping();
			}
		} finally {
			isEmailValidating = false;
			// Safety mechanism: Reset C2P progress if no modal is open and user is not logged in
			if (!isC2POpen && !isUserLoggedInC2p) {
				isC2PInProgress = false;
			}
		}
	}

	async function onSetShippingMethod({ detail: shippingMethodSku }) {
		try {
			shippingMethodInProgress = true;
			const parentContext = trackUXEvent('shipping_method_update', {
				shippingMethodSku
			});
			const result = await window.firmly.cartUpdateDelivery(
				shippingMethodSku,
				undefined,
				parentContext
			);
			if (result.status === 200) {
				cart.set(result.data);
			}
		} catch (e) {
			console.error(e);
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
			try {
				const parentContext = trackUXEvent('consents_fetch');
				const consents = await window.firmly.getConsents(parentContext);
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
			} catch (error) {
				console.error('Failed to get consents:', error);
			} finally {
				getConsentsInProgress = false;
			}
		}
	}

	// Get consents when the cart is available
	$: if (typeof window !== 'undefined' && $cart && !marketingConsent && !consentsRetrieved) {
		getConsents();
	}

	/**
	 * Handles PayPal connection state changes
	 * @param {boolean} connected - Whether PayPal is connected
	 * @param {Object} cartData - Cart data from PayPal (optional)
	 * @throws {Error} If connected parameter is not a boolean
	 */
	function setPayPalConnectionState(connected, cartData = null) {
		// Validate input parameters
		if (typeof connected !== 'boolean') {
			console.error('setPayPalConnectionState: connected must be a boolean', connected);
			return;
		}

		// Early return if already in desired state
		if (paypalConnected === connected) {
			return;
		}

		try {
			// Batch state updates to prevent multiple re-renders
			const updates = {
				selectedPaymentMethod: connected ? PAYMENT_METHODS.PAYPAL : selectedPaymentMethod,
				paypalConnected: connected,
				selectedCardOption: connected ? null : selectedCardOption,
				collapsedStatePayment: connected
					? false
					: selectedCardOption && selectedCardOption !== NEW_CARD_OPTION
			};

			// Apply all state updates atomically
			selectedPaymentMethod = updates.selectedPaymentMethod;
			paypalConnected = updates.paypalConnected;
			selectedCardOption = updates.selectedCardOption;
			collapsedStatePayment = updates.collapsedStatePayment;

			// Handle cart data if provided
			if (cartData) {
				if (cartData.shipping_info?.email) {
					email = cartData.shipping_info.email;
				}
				cart.set(cartData);
			}
		} catch (error) {
			console.error('Error in setPayPalConnectionState:', error);
			// Fallback: ensure PayPal connection state is at least set
			paypalConnected = connected;
		}
	}

	function onPaypalHandler(cartData) {
		try {
			trackUXEvent('express_payment_clicked', { paymentMethod: 'paypal' });
			setPayPalConnectionState(true, cartData);
		} catch (error) {
			console.error('Error in PayPal handler:', error);
			// Fallback: manually set essential state
			selectedPaymentMethod = PAYMENT_METHODS.PAYPAL;
			paypalConnected = true;
			collapsedStatePayment = false;
		}
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

		trackUXEvent('form_billing_address_filled', {
			country: billingInfo.country,
			postal: maskPostalCode(billingInfo.postal)
		});

		completeOrderResponse = await window.firmly.completeCreditCardOrder(
			window.firmly.domain,
			ccInfo
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

	async function placeOrderC2P(selectedCard, additionalData = $cart) {
		if (c2pSignOutInProgress) return;

		const checkoutResponse = await processC2PCheckout(
			selectedCard,
			additionalData,
			cvvConfirmationValue
		);

		if (checkoutResponse.cvv_required) {
			if (!cardsRequiringCvv.includes(selectedCardOption)) {
				cardsRequiringCvv = [...cardsRequiringCvv, selectedCardOption];
			}
			return;
		}

		if (checkoutResponse && !checkoutResponse.place_order_error) {
			cardsRequiringCvv = cardsRequiringCvv.filter((card) => card !== selectedCardOption);
			cvvConfirmationValue = '';

			return checkoutResponse;
		} else if (checkoutResponse.place_order_error) {
			place_order_error = checkoutResponse.place_order_error;
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
			if (selectedCard.wallet === 'c2p' && isEmailvalid && isShippingValid) {
				return placeOrderC2P(selectedCard, additionalData);
			} else if (
				['merchant', 'test'].includes(selectedCard.wallet) &&
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
		const parentContext = trackUXEvent('form_submitted', {
			paymentMethod: selectedPaymentMethod
		});
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

				await window.firmly.setConsents(marketingConsentToSign, parentContext);
			}

			let orderPlaceResponse;
			if (selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD) {
				orderPlaceResponse = await placeOrderCreditCard(additionalData);
			} else if (selectedPaymentMethod === PAYMENT_METHODS.PAYPAL) {
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
		}
	}

	function onMerchantLoginSuccess(event) {
		isMerchantLoginOpen = false;
		cart.set(event.detail);
		email = event.detail.email;

		updateCreditCardsAndAddresses(event.detail, 'merchant');
	}

	async function loginButtonClicked(event) {
		event.preventDefault();
		trackUXEvent('express_payment_clicked', { paymentMethod: 'merchant_login' });
		isMerchantLoginOpen = true;
	}

	function onC2PLoginSuccess(event) {
		c2pCards = event.detail.payment_method_options;
		savedAddresses.concat(event.detail.shipping_info_options);
		setFirstCard = true;

		// Auto-collapse when c2p returns pre-filled cards from registered email
		if (c2pCards && c2pCards.length > 0) {
			collapsedStatePayment = true;
			if (!selectedPaymentMethod) {
				selectedPaymentMethod = 'CreditCard';
			}
		}
	}

	function handleC2PAuthenticate(event) {
		const assuranceData = event.detail.assuranceData;
		onPlaceOrder(assuranceData);
	}

	function handleNotYouClicked() {
		if (c2pSignOutInProgress) return;

		trackUXEvent('c2p_not_you_clicked');
		collapsedStateShipping = false;
		collapsedStateShippingMethod = false;
		if (savedAddresses.length === 1) {
			selectedShippingAddress = NEW_SHIPPING_ADDRESS;
		}
	}

	function handleRetriesExceeded(event) {
		trackUXEvent('c2p_retries_exceeded');
		notices = notices.concat({
			text: event.detail.message,
			timeout: 15000,
			closeable: true
		});
	}

	async function handleNotYourCards() {
		if (c2pSignOutInProgress) return;

		trackUXEvent('c2p_not_your_cards_clicked');

		try {
			c2pSignOutInProgress = true;
			const response = await signOut();

			if (response.status === 200 && !response.data.recognized) {
				c2pCards = [];
				isUserLoggedInC2p = false;
				savedCreditCards = savedCreditCards.filter((card) => card.wallet !== 'c2p');
				selectedCardOption = selectAvailableCard(savedCreditCards);
				updateCollapsedStates();
			} else if (response.status === 200 && response.data.recognized) {
				notices = notices.concat({
					text: 'Unable to sign out from Click to Pay. Please try again.',
					timeout: 5000,
					closeable: true
				});
			} else {
				notices = notices.concat({
					text: response.data.description || 'Failed to sign out from Click to Pay.',
					timeout: 5000,
					closeable: true
				});
			}
		} catch (error) {
			console.error('Error during C2P sign out:', error);
			notices = notices.concat({
				text: 'An error occurred while signing out from Click to Pay.',
				timeout: 5000,
				closeable: true
			});
		} finally {
			setTimeout(() => {
				c2pSignOutInProgress = false;
			}, 500); // Small delay to prevent accidental double-clicks
		}
	}

	async function handleSetShippingInfo(event) {
		if (c2pSignOutInProgress) return;

		const shippingInfo = event.detail?.selectedShippingAddress;

		const parentContext = trackUXEvent('shipping_address_selected', {
			addressType: shippingInfo === NEW_SHIPPING_ADDRESS ? 'new_address' : 'saved_address'
		});

		if (shippingInfo !== NEW_SHIPPING_ADDRESS) {
			await onSetShippingInfo(shippingInfo);
		}
	}

	let shippingAutoCompleteEnabled = true;

	$: {
		shippingAutoCompleteEnabled = !isMerchantLoginOpen && !isC2POpen;
	}

	// Promo code section
	async function addPromoCodeCallback(promoCode) {
		const parentContext = trackUXEvent('promo_code_add', { promoCode });
		const result = await window.firmly.addPromoCode(promoCode, parentContext);
		if (result.status === 200) {
			cart.set(result.data);
		} else {
			throw result.data;
		}
	}

	async function clearPromoCodesCallback() {
		const parentContext = trackUXEvent('promo_code_clear');
		const result = await window.firmly.clearPromoCodes(parentContext);
		if (result.status === 200) {
			cart.set(result.data);
		} else {
			throw result.data;
		}
	}
	// end of Promo code section

	// Storage data listener section
	let storageListenerInitialized = false;

	function initStorageListener() {
		if (storageListenerInitialized || typeof window === 'undefined') {
			return;
		}

		bindEvent(window, 'message', (event) => {
			if (event.source !== window.parent) {
				return;
			}

			try {
				const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

				if (data?.action === 'firmlyStorageResponse') {
					console.log(
						'%c[firmly - flow-single-page] 📥 Storage response received:',
						'background-color: #0088ff; color: #fff',
						{ key: data.key, data: data.data }
					);

					// TODO: Process storage data based on key
					// Example: if (data.key === 'shipping_info') { ... }
				}
			} catch (e) {
				// Ignore parse errors from other postMessage sources
			}
		});

		storageListenerInitialized = true;
		console.log('firmly - storage listener initialized');
	}

	// Initialize listener when cart is ready
	$: if ($cart && !storageListenerInitialized) {
		initStorageListener();
	}
	// end of Storage data section
</script>

<div class="@container relative min-h-dvh bg-white">
	<div class="@md:bg-fy-primary absolute top-0 left-0 h-full w-1/2 transition-colors"></div>
	<div class="@md:bg-fy-background absolute top-0 right-0 h-full w-1/2 @md:shadow"></div>
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
				bind:expanded={headerExpanded}
				on:back-click
			>
				<div
					slot="smallSummary"
					class="relative mx-2 h-7 w-7 rounded bg-gray-300 bg-cover shadow"
					style={`background-image: url(${$cart?.line_items?.[0]?.image?.url});`}
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
							{lineItemErrors}
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
					images={$cart?.line_items?.map?.((l) => l.image?.medium || l.image?.url)}
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
						<!--  Hack for showing to kardiel. This should become a` configurations of the merchant's theme
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
							{lineItemErrors}
						/>
					</div>
				</Overview>
				<div class="grow"></div>
				<div class="text-fy-on-primary-subtle hidden text-center text-xs @md:block">
					<FooterLinks />
				</div>

				<div
					class="pointer-events-none fixed bottom-24 z-[121] hidden w-full justify-around @md:flex"
				>
					<div
						class="flex w-full flex-col justify-center px-3 @md:w-1/2 @md:max-w-[412px]"
					>
						<Notices bind:notices />
					</div>
				</div>
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
						{#if allowMerchantLogin || allowPayPal}
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
											on:click={() => {
												trackUXEvent('express_payment_clicked', {
													paymentMethod: 'shoppay'
												});
												isShopPayOpen = true;
											}}
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
												<span class="sensitive-data-mask text-sm font-bold"
													>{email}</span
												>
												<hr />
												<span
													class="sensitive-data-mask text-sm"
													data-testid="collapsed-shipping-address"
												>
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
													trackUXEvent('shipping_address_change_clicked');
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
										<label for="email-input-field" class="py-1 text-sm">
											Email
										</label>
										<Group>
											<div
												class="relative col-span-2 flex w-full flex-col justify-center rounded-lg"
											>
												<input
													id="email-input-field"
													class="placeholder:text-fy-on-primary-subtle w-full rounded-lg border-0 pr-10 focus:z-[2] disabled:bg-gray-100"
													disabled={placeOrderInProgress ||
														$cart?.session?.is_logged_in ||
														isEmailValidating}
													class:error={email_error}
													bind:this={emailField}
													bind:value={email}
													on:focus={() => onFieldFocus('email')}
													on:blur={() => {
														onFieldBlur('email', email, !!email_error);
														if (!isEmailValidating) {
															validateAndSubmitContactInfo();
														}
													}}
													data-testid="email-input"
													autocomplete={shippingAutoCompleteEnabled
														? 'shipping email'
														: ''}
													type="email"
													aria-required="true"
													aria-describedby={email_error
														? 'email-error'
														: null}
												/>
												{#if isEmailValidating}
													<div
														class="absolute top-1/2 right-3 -translate-y-1/2 transform"
													>
														<SpinnerIcon
															class="text-fy-on-primary-subtle h-4 w-4"
														/>
													</div>
												{/if}
											</div>
										</Group>
										{#if email_error}
											<span
												id="email-error"
												class="text-fy-alert text-xs"
												role="alert"
											>
												{email_error}
											</span>
										{/if}
										{#if isC2PAvailable()}
											<div class="my-2 rounded-lg bg-[#F7F7F7] p-2">
												<span
													class="text-fy-on-surface-subtle relative inline-block text-sm leading-normal"
												>
													By entering your email, you consent and direct
													firmly to send your information to
													<span class="font-bold underline"
														><a
															href="https://www.mastercard.com/global/click-to-pay/en-us/privacy-notice.html"
															target="_blank">Click to Pay</a
														></span
													>
													to check if you have any saved cards
													{#if c2pShowMore}
														<div
															transition:slide={{
																duration: 150,
																axis: 'y'
															}}
														>
															<br />
															A one-time passcode may be sent to this mobile
															to confirm it's you. Message/data rates may
															apply.
														</div>
													{/if}
													<span
														class="absolute right-0 bottom-0 mt-2 flex w-full flex-row justify-end"
													>
														<button
															type="button"
															aria-label="Show more"
															on:click={() =>
																(c2pShowMore = !c2pShowMore)}
															class="rounded p-1 transition-colors hover:bg-gray-100"
														>
															<svg
																class="h-4 w-4 transition-transform duration-200 {c2pShowMore
																	? 'rotate-180'
																	: ''}"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M19 9l-7 7-7-7"
																/>
															</svg>
														</button>
													</span>
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
									<div
										data-testid="shipping-address-form"
										class:mt-4={!isC2PAvailable() &&
											marketingConsent?.ui_slot !== 'UNDER_EMAIL_INPUT'}
									>
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
												<div
													class="flex flex-row justify-between text-sm"
													data-testid="collapsed-shipping-method"
												>
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
												data-testid="change-shipping-method-button"
												on:click={() => {
													trackUXEvent('shipping_method_change_clicked');
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
										class="col-span-2 flex flex-row items-center justify-between rounded-b-lg p-5"
										class:rounded-t-lg={!collapsedStateShippingMethod}
									>
										<div class="flex items-center">
											{#if selectedCard?.wallet === 'c2p'}
												<MastercardC2pLogo />
												<div class="mx-2 h-6 w-px bg-gray-300"></div>
											{/if}
											<ExistingCreditCard
												number="**** {selectedCard?.last_four}"
												type={selectedCard.card_type}
												customArtUrl={selectedCard?.art}
												class="sensitive-data"
											/>
										</div>
										<button
											type="button"
											class="ml-5 rounded-full px-1 text-sm text-blue-500"
											on:click={() => {
												trackUXEvent('payment_method_change_clicked');
												collapsedStatePayment = false;
											}}
										>
											Change
										</button>
									</div>
								</Group>
								{#if selectedCard?.wallet === 'c2p'}
									<div class="flex items-center justify-end">
										<button
											type="button"
											class="cursor-pointer rounded-full p-3 text-xs font-bold text-gray-500 underline"
											on:click={handleNotYourCards}
											data-testid="not-your-cards-btn-collapsed"
											disabled={c2pSignOutInProgress}
										>
											Not your cards?
										</button>
									</div>
								{/if}
							</div>
						{:else}
							<div class="py-2" transition:fadeSlide>
								<h2 class="font-semibold">Payment Method</h2>
								<!-- TODO: how to get the email from PayPal? -->
								<PaymentTabs
									allowedPaymentMethods={$cart?.payment_method_options?.map?.(
										(p) => p.type
									) || []}
									disabled={placeOrderInProgress ||
										c2pSignOutInProgress ||
										isC2PInProgress}
									merchantId={$cart?.shop_properties?.paypal?.merchantId}
									intent={$cart?.shop_properties?.paypal?.intent}
									clientId={$cart?.shop_properties?.paypal?.clientId}
									{paypalConnected}
									email={paypalConnected
										? $cart?.payment_method?.attributes?.email || 'Unknown'
										: ''}
									{onCreditCardUpdated}
									{onPaypalHandler}
									{savedCreditCards}
									{shouldTryFocusOnPaymentTab}
									{cardsRequiringCvv}
									bind:paypalPayerId
									bind:cvvConfirmationValue
									bind:validateCreditCard
									bind:selectedPaymentMethod
									bind:selectedCardOption
									bind:isBillingSameShipping
									bind:getBillingInfo
									on:not-your-cards={handleNotYourCards}
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
									trackUXEvent('order_summary_toggled', {
										expanded: toggleLineItemsExpanded
									});
								}}
								on:keydown={(ev) => {
									if (ev.key === 'Enter' || ev.key === ' ') {
										ev.preventDefault();
										toggleLineItemsExpanded = !toggleLineItemsExpanded;
										trackUXEvent('order_summary_toggled', {
											expanded: toggleLineItemsExpanded
										});
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
							<div class="flex flex-col" id="order-summary-content">
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
										{lineItemErrors}
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
							onclick={onPlaceOrder}
							disabled={shippingInfoInProgress ||
								shippingMethodInProgress ||
								(selectedPaymentMethod === PAYMENT_METHODS.PAYPAL &&
									!paypalConnected) ||
								(cardsRequiringCvv.includes(selectedCardOption) &&
									!cvvConfirmationValue)}
							inProgress={placeOrderInProgress}
							total={$cart?.total}
							{isOrderPlaced}
							terms={createTermsArray()}
							{buttonText}
						/>
					</div>
				{/if}
			</section>

			<div class="pointer-events-none fixed bottom-10 z-[121] flex w-full @md:hidden">
				<div class="flex w-full max-w-[422px] flex-col justify-center px-3">
					<Notices bind:notices />
				</div>
			</div>
		</form>
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
		{#if shouldUseVisa}
			<ClickToPay
				on:login-c2p-successful={onC2PLoginSuccess}
				on:authenticate-c2p-successful={handleC2PAuthenticate}
				on:not-you-clicked={handleNotYouClicked}
				{c2pOTPDestination}
				bind:isModalOpen={isC2POpen}
				bind:processC2PCheckout
				bind:c2pUnlockStart
				bind:isUserLoggedInC2p
				bind:isC2PInProgress
			/>
		{:else}
			<ClickToPayUnified
				cart={$cart}
				on:login-c2p-successful={onC2PLoginSuccess}
				on:authenticate-c2p-successful={handleC2PAuthenticate}
				on:not-you-clicked={handleNotYouClicked}
				on:retries-exceeded={handleRetriesExceeded}
				{c2pOTPDestination}
				bind:isModalOpen={isC2POpen}
				bind:processC2PCheckout
				bind:c2pUnlockStart
				bind:isUserLoggedInC2p
				bind:isC2PInProgress
				disabled={c2pSignOutInProgress}
			/>
		{/if}

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
