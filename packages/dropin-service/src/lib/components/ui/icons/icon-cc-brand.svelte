<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} IconCcBrandProps
	 * @property {string} first4 - The first 4 digits of the card number
	 * @property {string} [art] - Optional card art image URL from Click to Pay
	 */

	/**
	 * @type {IconCcBrandProps}
	 */
	let { first4, art = null } = $props();
	export function getCardType(cardNum) {
		const number = cardNum.replace(/\s+/g, '');

		// Visa
		if (/^4/.test(number)) {
			return 'visa';
		}

		// Mastercard
		if (/^(5[1-5]|2[2-7])/.test(number)) {
			return 'mastercard';
		}

		// American Express
		if (/^3[47]/.test(number)) {
			return 'amex';
		}

		// JCB
		if (/^35/.test(number)) {
			return 'jcb';
		}

		// Discover
		if (/^6011/.test(number)) {
			return 'discover';
		}

		// Diners Club
		if (/^30[0-5]/.test(number)) {
			return 'diners';
		}

		// UnionPay
		if (/^62/.test(number)) {
			return 'unionpay';
		}

		// Maestro
		if (/^5018|5020|5038|5893|6304|6759|6761|6762|6763/.test(number)) {
			return 'maestro';
		}

		// Return null if no match
		return null;
	}

	let detectedCardType = $derived(getCardType(first4));
</script>

<!-- Show card art image if available, otherwise show detected card type icon -->
{#if art}
	<img src={art} alt="Card" class="h-6 w-7 rounded object-contain" />
{:else if detectedCardType === 'visa'}
	<Icon icon="fa6-brands:cc-visa" />
{:else if detectedCardType === 'mastercard'}
	<Icon icon="fa6-brands:cc-mastercard" />
{:else if detectedCardType === 'jcb'}
	<Icon icon="fa6-brands:cc-jcb" />
{:else if detectedCardType === 'amex'}
	<Icon icon="fa6-brands:cc-amex" />
{/if}
