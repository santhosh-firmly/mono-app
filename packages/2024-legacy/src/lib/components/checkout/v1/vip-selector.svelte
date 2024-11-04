<script>
	// @ts-nocheck
	import ChevronDownIcon from '$lib/components/common/svg/chevron-down-icon.svelte';
	import ChevronUpIcon from '$lib/components/common/svg/chevron-up-icon.svelte';
	import XMarkIcon from '$lib/components/common/svg/x-mark-icon.svelte';
	import { sCart } from '$lib/browser/api-manager.js';
	import DiscountSteps from '$lib/components/common/discount-steps.svelte';
	import { cartSessionTransfer } from '$lib/browser/api-manager.js';
	import { vipBenefits, vipDescription } from '$lib/browser/localization';

	let vipSelected;
	let expanded = false;
	let vipPrice;
	let nonVipPrice;

	$: {
		vipSelected = !$sCart?.merchant_custom_data?.alternative_cart_details?.vip_option;

		if (vipSelected) {
			vipPrice = $sCart?.total?.value;
			nonVipPrice = $sCart?.merchant_custom_data?.alternative_cart_details?.total?.value;
		} else {
			vipPrice = $sCart?.merchant_custom_data?.alternative_cart_details?.total?.value;
			nonVipPrice = $sCart?.total?.value;
		}

		vipPrice = vipPrice?.toFixed?.(2);
		nonVipPrice = nonVipPrice?.toFixed?.(2);
	}

	async function _callSessionTransfer(vip) {
		let body = {
			cookies: [`new_vip=${vip}`],
			handle: ''
		};

		await cartSessionTransfer(body);
	}
</script>

<div class="container py-4 px-2" class:bg-gray-100={!vipSelected} class:bg-[#fdedea]={vipSelected}>
	<div class="flex flex-row w-full bg-white rounded">
		<button
			class="vip-selector grow rounded m-1 p-1 font-bold text-sm"
			class:active={vipSelected}
			on:click={() => _callSessionTransfer(true)}
		>
			<span>VIP Member</span>
		</button>
		<button
			class="vip-selector grow rounded m-1 p-1 font-bold text-sm"
			class:active={!vipSelected}
			on:click={() => _callSessionTransfer(false)}
		>
			<span>Non Member</span>
		</button>
	</div>
</div>

<div class="expandable-text overflow-visible" class:expanded>
	<div class="content px-6 flex flex-col bg-gray-100" class:fading={!expanded} class:vipSelected>
		{#if vipSelected}
			{#each vipBenefits as benefit}
				<label>
					<input type="checkbox" checked disabled class="rounded" />
					<span class="font-semibold">{benefit}</span>
				</label>
			{/each}
		{:else}
			{#each vipBenefits as benefit}
				<div class="flex flew-row items-center">
					<XMarkIcon class="mx-[3px]" />
					<span class="font-semibold">{benefit}</span>
				</div>
			{/each}
		{/if}
	</div>

	<button
		on:click={() => (expanded = !expanded)}
		class="w-full toggle-button bg-gray-100"
		class:vipSelected
	>
		<div class="price">
			<span class="font-bold">You pay</span>:
			{#if vipSelected}
				<span class="font-bold">${vipPrice} <s class="font-normal">${nonVipPrice}</s></span>
			{:else}
				<span class="font-normal"><s class="font-bold">${vipPrice} </s>${nonVipPrice}</span>
			{/if}
		</div>

		<div class="flex flex-col items-center">
			{#if expanded}
				{#if vipSelected}
					<DiscountSteps
						numberOfSets={$sCart.cart_discount_breakdown?.find?.((elem) => elem.is_vip)?.step}
					/>
				{/if}
				<ChevronUpIcon />
				<span class="leading-none pb-2">Collapse</span>
			{:else}
				<span class="leading-none pt-2">Learn more</span>
				<ChevronDownIcon />
			{/if}
		</div>
	</button>
	{#if vipSelected && expanded}
		<div class="vip-description flex flex-col">
			<span>
				{vipDescription}
			</span>
			<span class="pt-4">
				<a class="underline" href="link in here">Learn more about VIP</a>
			</span>
		</div>
	{/if}
</div>

<style>
	input[type='checkbox'] {
		color: #813571;
	}

	.fading {
		overflow: hidden;
		position: relative;
	}

	.fading::after {
		position: absolute;
		content: '';
		height: 110%;
		width: 100%;
		background: linear-gradient(180deg, rgba(243, 244, 246, 0.1) 0%, rgba(243, 244, 246, 1) 100%);
	}

	.fading.vipSelected::after {
		background: linear-gradient(180deg, rgba(253, 237, 234, 0.1) 0%, #fdeaea 100%);
	}

	.vip-description {
		color: #a1a1aa;
		padding: 20px;
		font-weight: 400;
		font-size: 12px;
		line-height: 14.4px;
	}

	.price {
		background: inherit;
		font-size: large;
		color: black;
	}

	.expandable-text .content {
		height: 60px;
		overflow: hidden;
	}

	.expandable-text .content.vipSelected {
		background-color: #fdedea;
	}

	.expandable-text.expanded .content {
		height: auto;
	}

	.expandable-text .toggle-button {
		color: #813571;
		border: none;
		cursor: pointer;
		padding: 5px 10px;
		outline: none;
		text-align: center;
		line-height: 30px;
	}

	.expandable-text .toggle-button.vipSelected {
		background-color: #fdedea;
	}

	.vip-selector {
		background-color: #fff;
		color: black;
	}

	.vip-selector.active {
		color: white;
		background-color: #813571;
	}
</style>
