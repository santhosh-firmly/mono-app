<script>
	// @ts-nocheck

	import { formatCardNumberRaw } from '$lib-v4/browser/credit-card-helper.js';
	import { CreditCardExpired, CreditCardExpires } from '$lib-v4/browser/localization.js';
	import CustomArtCardIcon from '../common/svg/custom-art-card-icon.svelte';

	import EmptyCard from '../common/svg/empty-card-icon.svelte';
	import MasterCard from '../common/svg/master-card-icon.svelte';
	import VisaCard from '../common/svg/visa-card-icon.svelte';

	/**
	 * Show only last four digits
	 */
	export let showOnlyLastFour = false;

	/**
	 * Credit Card Last 4 Digits
	 */
	export let lastFour = '';

	/**
	 * Credit Card Number
	 */
	export let cardNumber = '';

	/**
	 * Name on Credit Card
	 */
	export let cardName = '';

	/**
	 * Credit card expiration Month
	 */
	export let cardMonth = '';

	/**
	 * Credit Card Expiration Year
	 */
	export let cardYear = '';

	/**
	 * Credit Card Type
	 */
	export let cardType = '';

	/**
	 * Wether or not the card is expired or not
	 */
	export let isExpired = false;

	/**
	 * Whether or not to show the expiration date of the credit card.
	 */
	export let showExpiration = false;

	/**
	 * Whether or not to redact the card number
	 */
	export let mustRedactCardNumber = false;

	/**
	 * Custom credit card art
	 */
	let customArtUrl;

	function redactCardNumber(number) {
		return formatCardNumberRaw(number.replaceAll(/\d(?=.{4})/g, '•')).formatted;
	}

	let cardComponent = EmptyCard;

	$: {
		if (lastFour || cardNumber || cardName || cardMonth || cardYear || cardType || customArtUrl) {
			if (customArtUrl) {
				cardComponent = CustomArtCardIcon;
			} else {
				switch (cardType?.toLowerCase?.()) {
					case 'visa':
						cardComponent = VisaCard;
						break;
					case 'master':
						cardComponent = MasterCard;
						break;
					default:
						cardComponent = EmptyCard;
						break;
				}
			}
		}
	}
</script>

<div data-testid="credit-card-display" class="flex flex-row gap-1 font-normal">
	{#if isExpired}
		<div
			data-testid="expired-message"
			class="flex flex-wrap content-center justify-center text-red-400"
		>
			{CreditCardExpired}
		</div>
	{/if}
	<div data-testid="card-icon" class="flex justify-center">
		<svelte:component this={cardComponent} width={48} height={48} src={customArtUrl} />
	</div>
	<div class="flex flex-col justify-center">
		<div data-testid="card-number-display" class="flex flex-wrap content-center justify-start">
			{#if showOnlyLastFour}
				{redactCardNumber(`**** ${lastFour}`)}
			{:else}
				{mustRedactCardNumber ? redactCardNumber(cardNumber) : cardNumber}
			{/if}
		</div>
		{#if showExpiration}
			<div data-testid="card-expiration" class="flex justify-start">
				{CreditCardExpires}
				{cardMonth} / {cardYear}
			</div>
		{/if}
	</div>
</div>
