<script>
	export let shippingInfo;
</script>

<div class="flex flex-col pt-2 pb-2 px-4">
	<div class="flex text-lg flex-row h-10 mt-3 font-bold" data-testid="shipping-info-header">
		Contact & Shipping Address
	</div>
	<div class="text-md">
		<div class="flex" data-testid="shipping-name">
			{shippingInfo.first_name}
			{shippingInfo.last_name}
		</div>
		<div class="flex" data-testid="shipping-address1">
			{shippingInfo.address1}
		</div>
		{#if shippingInfo.address2}
			<div class="flex" data-testid="shipping-address2">
				{shippingInfo.address2}
			</div>
		{/if}
		<div class="flex" data-testid="shipping-city-state-zip">
			{shippingInfo.city}, {shippingInfo.state_or_province}
			{shippingInfo.postal_code}, {shippingInfo.country}
		</div>
		<div class="flex" data-testid="shipping-phone">
			{shippingInfo.phone}
		</div>
		<div class="flex" data-testid="shipping-email">
			{shippingInfo.email}
		</div>
	</div>
</div>
