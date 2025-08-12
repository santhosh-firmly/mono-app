<script context="module">
	import { createPayPalUrl } from '$lib-v4/utils/paypal-init.js';

	let isLoaded = false;
	let scriptElement = null;
	let loadPromise = null;

	export function loadPayPalSDK(config) {
		if (isLoaded) {
			return Promise.resolve();
		}

		if (loadPromise) {
			return loadPromise;
		}

		loadPromise = new Promise((resolve, reject) => {
			const scriptUrl = createPayPalUrl(config);
			scriptElement = document.createElement('script');
			scriptElement.src = scriptUrl;
			scriptElement.async = true;
			scriptElement.defer = true;

			scriptElement.onload = () => {
				isLoaded = true;
				window.dispatchEvent(new Event('paypal-sdk-loaded'));
				resolve();
			};

			scriptElement.onerror = (err) => {
				loadPromise = null;
				reject(err);
			};

			document.body.appendChild(scriptElement);
		});

		return loadPromise;
	}
</script>

<script>
	// @ts-nocheck
	import { paypalApprove, paypalStart, sIsApiMock } from '$lib-v4/browser/api-manager.js';
	import { trackUXEvent } from '$lib-v4/browser/telemetry.js';
	import { onMount } from 'svelte';

	export let merchantId = null;
	export let label = 'pay';
	export let currency = 'USD';
	export let intent = 'capture';
	export let integrationVersion = 'v3';
	export let paypalPayerId;
	export let onPaypalHandler = () => {};
	// TODO: add clientId to worker variable when migrating this to mono-app
	export let clientId = '';

	// Generate unique ID for this instance
	const buttonId = `paypal-button-${Math.random().toString(36).substring(2, 8)}`;
	let buttonInstance = null;

	async function internalStart() {
		trackUXEvent('ClickPaypal');
		if ($sIsApiMock) {
			paypalApprove();
			if (onPaypalHandler) {
				onPaypalHandler();
			}
			return null;
		}
		const ret = await paypalStart();
		if (ret) {
			if (
				ret.payment_method &&
				ret.payment_method.attributes &&
				ret.payment_method.attributes.paypal_token
			) {
				return ret.payment_method.attributes.paypal_token;
			}
		}
		return null;
	}

	async function createBillingAgreement() {
		return internalStart();
	}

	async function createOrder() {
		return internalStart();
	}

	async function onApprove(data) {
		paypalPayerId = data.payerID;
		const ret = await paypalApprove({ payer_id: paypalPayerId, paypal_token: data.orderID });
		if (ret) {
			if (onPaypalHandler) {
				onPaypalHandler(ret);
			}
		}
	}

	async function onCancel() {
		console.log('paypal onCancel');
	}

	async function onError(err) {
		console.log('paypal onError:', err);
	}

	function scriptOnLoad() {
		let args = {
			style: {
				color: 'gold',
				shape: 'rect',
				layout: 'horizontal',
				label,
				height: 50,
				maxbuttons: 1,
				tagline: false
			},
			onApprove,
			onCancel,
			onError
		};

		switch (integrationVersion) {
			case 'billing-aggreement-v1':
				args.createBillingAgreement = createBillingAgreement;
				break;
			case 'v3':
			default:
				args.createOrder = createOrder;
				break;
		}

		if (window.paypal && document.getElementById(buttonId)) {
			buttonInstance = window.paypal.Buttons(args);
			buttonInstance.render(`#${buttonId}`);
		}
	}

	onMount(async () => {
		try {
			await loadPayPalSDK({
				merchantId,
				clientId,
				currency,
				intent,
				integrationVersion
			});
			scriptOnLoad();
		} catch (error) {
			console.error('Failed to load PayPal SDK:', error);
		}
	});
</script>

<div
	id={buttonId}
	class="flex basis-full justify-center {$$props.class}"
	data-testid="paypal-button-container"
	{...$$restProps}
/>
