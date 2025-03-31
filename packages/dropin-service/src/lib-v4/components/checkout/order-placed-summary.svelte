<script>
	// @ts-nocheck

	import CheckCircleIcon from '../common/svg/check-circle-icon.svelte';
	export let order;
</script>

{#if order.cart_status === 'submitted'}
	<div
		class="flex h-3/4 flex-col justify-center border"
		fobs
		id="viewOrderPlaced"
		data-testid="order-placed-container"
	>
		<div class="flex flex-col items-center justify-center gap-3 text-center">
			<div class="basis-full stroke-blue-500"><CheckCircleIcon /></div>
			<div
				class="basis-full text-lg font-semibold text-blue-500"
				data-testid="order-placed-merchant"
			>
				Order Placed on {order.display_name || order.shop_id}
			</div>
			<div class="text-md basis-full" data-testid="order-number">
				{order.platform_order_number}
			</div>
		</div>
	</div>
{/if}
