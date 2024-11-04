<script>
	// @ts-nocheck
	import { CreditCardValid } from '$lib/browser/localization.js';

	import CpuChipIcon from '../common/svg/cpu-chip-icon.svelte';
	import EmptyCard from '../common/svg/empty-card-icon.svelte';
	import MasterCard from '../common/svg/master-card-icon.svelte';
	import ShopPayIcon from '../common/svg/shop-pay-icon.svelte';
	import VisaCard from '../common/svg/visa-card-icon.svelte';

	export let wallet = null;
	export let cardNumber = '';
	export let cardName = '';
	export let cardMonth = '';
	export let cardYear = '';
	export let cardType = '';
	export let isShopPay = false;
	let cardComponent = EmptyCard;

	$: {
		if (wallet) {
			cardNumber = `**** **** **** ${wallet.last_four}`;
			cardName = `${wallet.billing_info.first_name} ${wallet.billing_info.last_name}`;
			cardMonth = wallet.month;
			cardYear = wallet.year;
			cardType = wallet.card_type;
		}
		switch (cardType) {
			case 'VISA':
			case 'visa':
				cardComponent = VisaCard;
				break;
			case 'MASTER':
			case 'master':
				cardComponent = MasterCard;
				break;
			default:
				cardComponent = EmptyCard;
				break;
		}
	}
</script>

<div
	class="rounded-xl shadow-lg px-3 py-2 h-32 w-56 {isShopPay
		? 'bg-[#5a31f4] text-white'
		: 'bg-subtle'}"
>
	<div class="flex items-start justify-between">
		{#if isShopPay}
			<ShopPayIcon width={76} />
		{:else}
			<CpuChipIcon class="stroke-[#ffd700] " />
		{/if}
		<svelte:component this={cardComponent} />
	</div>
	<div class="flex justify-start text-sm px-2 py-2 letterpress">{cardNumber}</div>
	<div class="flex justify-start text-xs pb-1">
		<div class="basis-1/2 uppercase truncate" class:text-secondary={!isShopPay}>
			{CreditCardValid}
		</div>
		<div class="basis-1/2 flex justify-end" class:text-high={!isShopPay}>
			{cardMonth} / {cardYear}
		</div>
	</div>
	<div class="flex justify-start text-sm uppercase embossed">
		<p class="truncate">{cardName}</p>
	</div>
</div>

<style>
	.embossed {
		text-shadow:
			-1px -1px 1px #fff,
			1px 1px 1px #000;
		opacity: 0.6;
	}
	.letterpress {
		text-shadow: 0px 1px 1px #4d4d4d;
	}
</style>
