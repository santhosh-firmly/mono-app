<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */

	import { getShippingDescription } from '$lib/browser/cart-helper.js';
	import {
		ReviewDelivery,
		ReviewPayment,
		ReviewShippingAddress,
		ReviewTerms
	} from '$lib/browser/localization.js';

	import { cViewReview, sWizardLast, sWizardShipping } from '$lib/browser/wizard.js';
	import { sCart, cartUpdateDelivery } from '$lib/browser/api-manager.js';
	import PhoneIcon from '$lib/components/common/svg/phone-icon.svelte';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import HomeIcon from '$lib/components/common/svg/home-icon.svelte';
	import { sIsNavPlaceOrder } from '$lib/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import SectionHeader from '$lib/components/common/section-header.svelte';
	import EmailIcon from '$lib/components/common/svg/email-icon.svelte';
	import Radio from '$lib/components/vendor/radio.svelte';

	const options = { delay: 10, duration: 500, easing: expoOut, axis: 'y' };

	function getShippingAddress() {
		if ($sCart.shipping_info) {
			return `${$sCart.shipping_info.first_name} ${$sCart.shipping_info.last_name}, ${
				$sCart.shipping_info.address1
			} ${$sCart.shipping_info.address2 || ''}, ${$sCart.shipping_info.city}, ${
				$sCart.shipping_info.state_or_province
			} ${$sCart.shipping_info.postal_code}`;
		} else {
			return '';
		}
	}

	let isDeliveryOpen = false;
	let deliverySelected = $sCart.shipping_method?.sku;

	function onDeliveryClick(value) {
		isDeliveryOpen = value;
	}

	async function onDeliveryChosen(event) {
		const chosen = event.target.value;

		if (!$sCart.shipping_method || chosen != $sCart.shipping_method.sku) {
			await cartUpdateDelivery(chosen);
		}
	}

	function onShippingChange() {
		sWizardShipping.set(true);
	}

	onMount(() => {
		sIsNavPlaceOrder.set(true);
	});

	onDestroy(() => {
		sWizardLast.set(cViewReview);
		sIsNavPlaceOrder.set(false);
	});
</script>

<div {...$$restProps} fobs>
	<SectionHeader header={ReviewShippingAddress} isChange={true} onChangeClick={onShippingChange} />
	<div class="flex flex-col gap-2 px-4">
		<div class="flex text-xs content-center">
			<div class="flex basis-8 justify-start items-center"><HomeIcon /></div>
			<div class="">{getShippingAddress()}</div>
		</div>
		{#if $sCart.shipping_info && $sCart.shipping_info.email}
			<div class="flex text-xs content-center">
				<div class="flex basis-8 justify-start items-center"><EmailIcon /></div>
				<div class="">{$sCart.shipping_info.email}</div>
			</div>
		{/if}
		{#if $sCart.shipping_info && $sCart.shipping_info.phone}
			<div class="flex text-xs content-center">
				<div class="flex basis-8 justify-start items-center"><PhoneIcon /></div>
				<div class="">{$sCart.shipping_info.phone}</div>
			</div>
		{/if}
	</div>

	<SectionHeader
		header={ReviewDelivery}
		isChevron={true}
		onChevronClick={onDeliveryClick}
		bind:isChevronOpen={isDeliveryOpen}
	/>

	<div class="flex flex-col gap-1 px-4">
		<div class="flex flex-row text-xs">
			{getShippingDescription($sCart.shipping_method)}
		</div>
		{#if isDeliveryOpen === true}
			<div class="divide-divide divide-y rounded-md px-2" transition:slide={options}>
				<ul>
					{#each $sCart.shipping_method_options as item}
						<li>
							<Radio
								class="py-2 text-xs"
								bind:group={deliverySelected}
								value={item.sku}
								on:click={onDeliveryChosen}
								>{getShippingDescription(item)}
							</Radio>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>

	<SectionHeader header={ReviewPayment} />

	<div class="flex flex-col gap-1 px-4">
		<slot name="paymentSlot" />
	</div>
	<slot name="cvvSlot" />

	<div class="flex flex-col gap-1 mt-5 mb-5 text-xs text-secondary text-center px-4">
		<span>
			{@html ReviewTerms.replace(
				'#terms#',
				'<a class="underline" target="_blank" href="https://www.firmly.ai/terms">terms</a>'
			).replace(
				'#privacypolicy#',
				'<a class="underline" target="_blank" href="https://www.firmly.ai/privacy">privacy policy</a>'
			)}
		</span>
	</div>
</div>
