<script>
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/states/ui-config.svelte';
	import UiButton from '$lib/components/ui/ui-button.svelte';

	/**
	 * @typedef {Object} CheckoutFooterProps
	 * @property {number} totalPrice - The total price to display
	 * @property {boolean} [disabled=false] - Whether the place order button is disabled
	 * @property {function} [onSubmit] - The function to call when the place order button is clicked
	 */

	/**
	 * @type {CheckoutFooterProps}
	 */
	let { totalPrice, disabled = false, onSubmit } = $props();
</script>

<div class="flex flex-col items-center gap-4">
	<UiButton {disabled} onclick={onSubmit}>
		Place order ({toCurrency(totalPrice)})
	</UiButton>

	<span class="flex items-center gap-1.5 text-xs text-gray-500">
		<Icon icon="mdi:lock" class="text-sm" />
		<p>{m.payment_are_encrypted()}</p>
	</span>
</div>
