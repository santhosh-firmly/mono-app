<script>
	import { toCurrency } from '$lib/utils/currency.js';
	import { useAnimatedValue } from '$lib/composables/animated-value.svelte.js';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} SummaryPriceProps
	 * @property {number} itemsQuantity - The quantity of items in the cart
	 * @property {number} totalPrice - The total price of the cart
	 * @property {string} [class] - The class to apply to the container
	 */

	/**
	 * @type {SummaryPriceProps}
	 */
	let { itemsQuantity, totalPrice, class: className } = $props();

	const animatedPrice = useAnimatedValue(() => totalPrice);
</script>

<span
	class={[
		'flex flex-col items-center gap-y-2 text-center md:items-start md:text-start',
		className
	]}
>
	<p class=" text-muted">
		{m.order_total()} ({itemsQuantity >= 1
			? m.item({ qty: itemsQuantity })
			: m.items({ qty: itemsQuantity })})
	</p>
	<p class="text-text text-4xl font-semibold">
		{toCurrency(animatedPrice.value)}
	</p>
</span>
