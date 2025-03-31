<script>
	// @ts-nocheck
	import { CreditCardValid } from '$lib-v4/browser/localization.js';

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
	class="h-32 w-56 rounded-xl px-3 py-2 shadow-lg {isShopPay
		? 'bg-[#5a31f4] text-white'
		: 'bg-subtle'}"
	data-testid="credit-card-display"
>
	<div class="flex items-start justify-between">
		{#if isShopPay}
			<ShopPayIcon width={76} data-testid="shop-pay-icon" />
		{:else}
			<CpuChipIcon class="stroke-[#ffd700]" data-testid="chip-icon" />
		{/if}
		<svelte:component this={cardComponent} />
	</div>
	<div class="letterpress flex justify-start px-2 py-2 text-sm" data-testid="card-number">
		{cardNumber}
	</div>
	<div class="flex justify-start pb-1 text-xs">
		<div
			class="basis-1/2 truncate uppercase"
			class:text-secondary={!isShopPay}
			data-testid="card-valid-label"
		>
			{CreditCardValid}
		</div>
		<div
			class="flex basis-1/2 justify-end"
			class:text-high={!isShopPay}
			data-testid="card-expiration"
		>
			{cardMonth} / {cardYear}
		</div>
	</div>
	<div class="embossed flex justify-start text-sm uppercase" data-testid="card-name">
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
