<script>
	import Icon from '@iconify/svelte';
	import UiIconPaypal from '$lib/components/icon/icon-paypal.svelte';
	import UiButton from '$lib/components/ui/ui-button.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CheckoutPaymentPaypalProps
	 * @property {Function} onclick - The function to call when the button is clicked
	 */

	/**
	 * @type {CheckoutPaymentPaypalProps}
	 */
	let { onclick = () => {} } = $props();
</script>

<div class="flex flex-col gap-6 rounded-lg border border-gray-200 p-6 shadow">
	<div class="text-muted flex flex-col gap-2 border-b border-gray-200 pb-2">
		<UiIconPaypal class="w-14" />
		<h3 class="text-xs">{m.paypal_selected()}</h3>
	</div>
	<span class="flex items-center gap-4">
		<Icon icon="lucide:external-link" class="text-4xl" />
		<p class="text-muted text-xs">
			{m.paypal_redirect()}
		</p>
	</span>
	<UiButton color="#ffc439" {onclick}>
		<span class="flex items-center justify-center gap-2">
			Pay with <UiIconPaypal />
		</span>
	</UiButton>
</div>
