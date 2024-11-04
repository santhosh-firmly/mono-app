<script>
	// @ts-nocheck
	import {
		ButtonBuyWith,
		ButtonCreditCard,
		OrderSummary,
		ProductCheckout,
		SecureCheckout
	} from '$lib/browser/localization.js';
	import {
		cPaymentC2P,
		cPaymentCreditCard,
		cPaymentLogin,
		cPaymentLoginCreditCard,
		cPaymentPaypal,
		cPaymentShoppay,
		sPaymentFlow
	} from '$lib/browser/storage.js';
	import { cViewPayment, sWizardLast, wizardNext, wizardReset } from '$lib/browser/wizard.js';
	import { sCart } from '$lib/browser/api-manager.js';
	import { symModalKey } from '$lib/browser/storage.js';
	import CreditCardLockIcon from '$lib/components/common/svg/credit-card-lock-icon.svelte';
	import CartProducts from '../cart-products.svelte';
	import { getPrice } from '$lib/browser/cart-helper.js';
	import LockClosedIcon from '$lib/components/common/svg/lock-closed-icon.svelte';
	import ShopPayIcon from '$lib/components/common/svg/shop-pay-icon.svelte';
	import Paypal from '$lib/components/payment/paypal.svelte';
	import Button from '$lib/components/common/button.svelte';
	import { getContext, onDestroy } from 'svelte';
	import VipSelector from './vip-selector.svelte';
	import AdoremeLogo from '$lib/components/common/svg/adoreme-logo.svelte';

	const modal = getContext(symModalKey);

	onDestroy(() => {
		sWizardLast.set(cViewPayment);
	});

	function onCCHandler() {
		window.firmly?.telemetryButtonClick?.('ClickCreditCard');
		sPaymentFlow.set(cPaymentCreditCard);
		wizardNext();
	}

	function onLoginCCHandler() {
		window.firmly?.telemetryButtonClick?.('ClickCreditCard');
		sPaymentFlow.set(cPaymentLoginCreditCard);
		wizardNext();
	}

	function onLoginHandler() {
		window.firmly?.telemetryButtonClick?.('ClickLogin');
		sPaymentFlow.set(cPaymentLogin);
		wizardNext();
	}

	function onC2PHandler() {
		window.firmly?.telemetryButtonClick?.('ClickC2P');
		sPaymentFlow.set(cPaymentC2P);
		wizardNext();
	}

	function onShopPayHandler() {
		window.firmly?.telemetryButtonClick?.('ClickShopPay');
		sPaymentFlow.set(cPaymentShoppay);
		wizardNext();
	}

	function onPaypalHandler() {
		//telemetry click is done on the Paypal component.
		sPaymentFlow.set(cPaymentPaypal);
		wizardNext();
	}

	let lineItemsCount = 0;
	let isLoginCreditCard = false;
	let isC2P = false;
	let isShopPay = false;
	let isPaypal = false;
	let clientId = null;
	let merchantId = null;
	let integrationVersion = 'v3';

	$: {
		if ($sCart.line_items) {
			lineItemsCount = $sCart.line_items.length;
		}

		if (lineItemsCount === 0) {
			wizardReset();
			modal.close();
		}

		if ($sCart.platform_id && $sCart.platform_id == 'shopify') {
			isShopPay = true;
		}

		if (
			$sCart.shop_properties &&
			$sCart.shop_properties.paypal &&
			$sCart.shop_properties.paypal.clientId
		) {
			isPaypal = true;
			clientId = $sCart.shop_properties.paypal.clientId;
			if ($sCart.shop_properties.paypal.merchantId) {
				merchantId = $sCart.shop_properties.paypal.merchantId;
			}
			if ($sCart.shop_properties.paypal.integration_version) {
				integrationVersion = $sCart.shop_properties.paypal.integration_version;
			}
		}

		if ($sCart.session && $sCart.session.requires_login) {
			isLoginCreditCard = true;
		}

		if (
			$sCart.shop_id &&
			($sCart.shop_id === 'firmlyai.myshopify.com' || $sCart.shop_id === 'youngrebelz.com')
		) {
			isC2P = true;
		}
	}
</script>

{#if $sCart.cart_id}
	<div id="viewPayment" fobs>
		<div class="flex flex-row items-center text-sm font-semibold py-2 px-4">
			<div class="grow">
				{ProductCheckout}
			</div>
			<div class="text-end">{getPrice($sCart.total)}</div>
		</div>

		<div class="flex flex-col mt-8 mb-10 gap-3" class:pointer-events-none={lineItemsCount == 0}>
			{#if $sCart?.session?.accepts_otp?.includes?.('email') && !$sCart?.session?.is_logged_in}
				<div class="flex justify-center">
					<Button
						on:click={onLoginHandler}
						style="min-width:260px;background-color:#550C46"
						class="w-9/12"
					>
						<!-- TODO: Logo should come from the APIs or be in UI per merchant -->
						<AdoremeLogo />
						<span class="px-3 py-1">
							Login with {$sCart.display_name || $sCart.shop_id}
						</span>
					</Button>
				</div>
				<span class="flex text-secondary text-xs sm:text-base font-thin justify-center"
					>No password login, or continue with</span
				>
			{/if}
			{#if isShopPay}
				<div class="flex justify-center">
					<Button
						on:click={onShopPayHandler}
						style="min-width:260px;background-color:#5a31f4"
						class="w-9/12"
					>
						{ButtonBuyWith}
						<ShopPayIcon class="fill-white px-2" width={100} />
					</Button>
				</div>
			{/if}
			{#if isPaypal}
				<div class="flex justify-center">
					<Paypal class="w-9/12" {onPaypalHandler} {merchantId} {clientId} {integrationVersion} />
				</div>
			{/if}
			{#if isC2P}
				<div class="flex justify-center">
					<Button on:click={onC2PHandler} style="min-width:260px;" class="w-9/12">
						<CreditCardLockIcon class="fill-btext" />
						<span class="self-center">{ButtonCreditCard}</span>
					</Button>
				</div>
			{:else if isLoginCreditCard}
				<div class="flex justify-center">
					<Button on:click={onLoginCCHandler} style="min-width:260px;" class="w-9/12">
						<CreditCardLockIcon class="fill-btext" />
						<span class="self-center">{ButtonCreditCard}</span>
					</Button>
				</div>
			{:else}
				<div class="flex justify-center">
					<Button on:click={onCCHandler} style="min-width:260px;" class="w-9/12">
						<CreditCardLockIcon class="fill-btext" />
						<span class="self-center">{ButtonCreditCard}</span>
					</Button>
				</div>
			{/if}
			<div class="flex justify-center text-secondary text-xs sm:text-base items-center">
				<LockClosedIcon />
				<span class="pl-2 pt-1"> {SecureCheckout}</span>
			</div>
		</div>
		{#if $sCart?.session?.accepts_membership?.[0]}
			<VipSelector />
		{/if}
		<div class="py-2 bg-gray-100">
			<div class="text-sm font-bold py-2 px-4">{OrderSummary(lineItemsCount)}</div>
			<CartProducts />
		</div>
	</div>
{/if}
