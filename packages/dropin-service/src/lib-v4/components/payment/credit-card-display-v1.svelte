<script>
	// @ts-nocheck

	import { formatCardNumberRaw } from '$lib-v4/browser/credit-card-helper.js';
	import { CreditCardExpired, CreditCardExpires } from '$lib-v4/browser/localization.js';
	import CustomArtCardIcon from '../common/svg/custom-art-card-icon.svelte';

	import EmptyCard from '../common/svg/empty-card-icon.svelte';
	import MasterCard from '../common/svg/master-card-icon.svelte';
	import VisaCard from '../common/svg/visa-card-icon.svelte';

	export let wallet = null;

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

	function redactCardNumber(number) {
		return formatCardNumberRaw(number.replaceAll(/\d(?=.{4})/g, '•')).formatted;
	}

	let customArtUrl;
	let cardComponent = EmptyCard;

	$: {
		if (wallet) {
			cardNumber = `**** ${wallet.last_four}`;
			cardName = `${wallet.billing_info?.first_name} ${wallet.billing_info?.last_name}`;
			cardMonth = wallet.month;
			cardYear = wallet.year;
			cardType = wallet.card_type;
			customArtUrl = wallet.art;
		}
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
</script>

<div class="flex basis-full flex-row gap-1 text-xs font-normal" data-testid="credit-card-display">
	{#if isExpired}
		<div
			class="flex flex-wrap content-center justify-center text-red-400"
			data-testid="card-expired-message"
		>
			{CreditCardExpired}
		</div>
	{/if}
	<div class="flex basis-1/3 justify-center" data-testid="card-icon">
		<svelte:component this={cardComponent} width={48} height={48} src={customArtUrl} />
	</div>
	<div class="flex basis-2/3 flex-col justify-center">
		<div class="flex flex-wrap content-center justify-start" data-testid="card-number">
			{mustRedactCardNumber ? redactCardNumber(cardNumber) : cardNumber}
		</div>
		{#if showExpiration}
			<div class="flex justify-start" data-testid="card-expiration">
				{CreditCardExpires}
				{cardMonth} / {cardYear}
			</div>
		{/if}
	</div>
</div>
