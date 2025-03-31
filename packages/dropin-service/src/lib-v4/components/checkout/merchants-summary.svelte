<script>
	// @ts-nocheck

	import MerchantSummary from './merchant-summary.svelte';

	export let disabled;
	export let showShippingMethodSkeleton;
	export let cartsAndOrders = [];
</script>

<div class="mt-6 pb-4 border rounded-lg">
	{#each cartsAndOrders as cartOrOrder}
		<MerchantSummary
			{disabled}
			on:changeDeliveryMethod
			cart={cartOrOrder}
			{showShippingMethodSkeleton}
		/>
	{/each}
</div>
