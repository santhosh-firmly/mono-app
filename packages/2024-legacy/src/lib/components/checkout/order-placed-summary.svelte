<script>
	// @ts-nocheck

	import CheckCircleIcon from '../common/svg/check-circle-icon.svelte';
	export let order;
</script>

{#if order.cart_status === 'submitted'}
	<div class="flex flex-col h-3/4 justify-center border" fobs id="viewOrderPlaced">
		<div class="flex flex-col justify-center items-center gap-3 text-center">
			<div class="basis-full stroke-blue-500"><CheckCircleIcon /></div>
			<div class="basis-full text-lg text-blue-500 font-semibold">
				Order Placed on {order.display_name || order.shop_id}
			</div>
			<div class="basis-full text-md">
				{order.platform_order_number}
			</div>
		</div>
	</div>
{/if}
