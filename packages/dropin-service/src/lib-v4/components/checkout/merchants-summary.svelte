<script>
	// @ts-nocheck

	import MerchantSummary from './merchant-summary.svelte';

	export let disabled;
	export let showShippingMethodSkeleton;
	export let cartsAndOrders = [];
</script>

<div class="mt-6 rounded-lg border pb-4">
	{#each cartsAndOrders as cartOrOrder}
		<MerchantSummary
			{disabled}
			on:changeDeliveryMethod
			cart={cartOrOrder}
			{showShippingMethodSkeleton}
		/>
	{/each}
</div>
