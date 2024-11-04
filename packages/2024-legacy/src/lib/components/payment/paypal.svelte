<script>
	// @ts-nocheck
	import { paypalApprove, paypalStart, sIsApiMock } from '$lib/browser/api-manager.js';
	import { onMount } from 'svelte';

	export let merchantId = null;
	export let clientId = '';
	export let label = 'pay';
	export let currency = 'USD';
	export let intent = 'authorize';
	export let integrationVersion = 'v3';
	export let onPaypalHandler = () => {};

	let scriptUrl;

	onMount(() => {
		scriptUrl = new URL('https://www.paypal.com/sdk/js');
		scriptUrl.searchParams.set('client-id', clientId);
		if (merchantId) {
			scriptUrl.searchParams.set('merchant-id', merchantId);
		}
		scriptUrl.searchParams.set('commit', 'false');
		scriptUrl.searchParams.set('currency', currency);
		scriptUrl.searchParams.set('disable-funding', 'paylater,card');
		switch (integrationVersion) {
			case 'billing-aggreement-v1':
				scriptUrl.searchParams.set('vault', true);
				scriptUrl.searchParams.set('intent', 'tokenize');
				break;
			case 'v3':
			default:
				scriptUrl.searchParams.set('intent', intent);
				scriptUrl.searchParams.set('components', 'buttons');
				break;
		}
	});

	async function internalStart() {
		window.firmly?.telemetryButtonClick?.('ClickPaypal');
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
		const ret = await paypalApprove({ payer_id: data.payerID });
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
			onApprove: onApprove,
			onCancel: onCancel,
			onError: onError
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

		if (window.paypal) {
			window.paypal.Buttons(args).render('#paypal-button');
		}
	}

	function scriptOnError() {
		console.log('paypal not loaded');
	}
</script>

<svelte:head>
	<script src={scriptUrl} async defer on:load={scriptOnLoad} on:error={scriptOnError}></script>
</svelte:head>

<div id="paypal-button" class="flex justify-center basis-full {$$props.class}" {...$$restProps} />
