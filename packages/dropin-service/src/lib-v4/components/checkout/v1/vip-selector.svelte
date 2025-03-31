<script>
	// @ts-nocheck
	import ChevronDownIcon from '$lib-v4/components/common/svg/chevron-down-icon.svelte';
	import ChevronUpIcon from '$lib-v4/components/common/svg/chevron-up-icon.svelte';
	import XMarkIcon from '$lib-v4/components/common/svg/x-mark-icon.svelte';
	import { sCart } from '$lib-v4/browser/api-manager.js';
	import DiscountSteps from '$lib-v4/components/common/discount-steps.svelte';
	import { cartSessionTransfer } from '$lib-v4/browser/api-manager.js';
	import { vipBenefits, vipDescription } from '$lib-v4/browser/localization';

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

<div class="container px-2 py-4" class:bg-gray-100={!vipSelected} class:bg-[#fdedea]={vipSelected}>
	<div class="flex w-full flex-row rounded bg-white">
		<button
			class="vip-selector m-1 grow rounded p-1 text-sm font-bold"
			class:active={vipSelected}
			on:click={() => _callSessionTransfer(true)}
		>
			<span>VIP Member</span>
		</button>
		<button
			class="vip-selector m-1 grow rounded p-1 text-sm font-bold"
			class:active={!vipSelected}
			on:click={() => _callSessionTransfer(false)}
		>
			<span>Non Member</span>
		</button>
	</div>
</div>

<div class="expandable-text overflow-visible" class:expanded>
	<div class="content flex flex-col bg-gray-100 px-6" class:fading={!expanded} class:vipSelected>
		{#if vipSelected}
			{#each vipBenefits as benefit}
				<label>
					<input type="checkbox" checked disabled class="rounded" />
					<span class="font-semibold">{benefit}</span>
				</label>
			{/each}
		{:else}
			{#each vipBenefits as benefit}
				<div class="flew-row flex items-center">
					<XMarkIcon class="mx-[3px]" />
					<span class="font-semibold">{benefit}</span>
				</div>
			{/each}
		{/if}
	</div>

	<button
		on:click={() => (expanded = !expanded)}
		class="toggle-button w-full bg-gray-100"
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
				<span class="pb-2 leading-none">Collapse</span>
			{:else}
				<span class="pt-2 leading-none">Learn more</span>
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
