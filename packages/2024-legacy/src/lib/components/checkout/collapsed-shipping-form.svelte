<script>
	export let shippingInfo;
</script>

<div class="flex flex-col pt-2 pb-2 px-4">
	<div class="flex text-lg flex-row h-10 mt-3 font-bold">Contact & Shipping Address</div>
	<div class="text-md">
		<div class="flex">
			{shippingInfo.first_name}
			{shippingInfo.last_name}
		</div>
		<div class="flex">
			{shippingInfo.address1}
		</div>
		{#if shippingInfo.address2}
			<div class="flex">
				{shippingInfo.address2}
			</div>
		{/if}
		<div class="flex">
			{shippingInfo.city}, {shippingInfo.state_or_province}
			{shippingInfo.postal_code}, {shippingInfo.country}
		</div>
		<div class="flex">
			{shippingInfo.phone}
		</div>
		<div class="flex">
			{shippingInfo.email}
		</div>
	</div>
</div>
