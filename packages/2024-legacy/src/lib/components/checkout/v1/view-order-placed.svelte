<script>
	// @ts-nocheck
	import { sCart } from '$lib/browser/api-manager.js';
	import { OrderPlaced, OrderPlacedBuffer, OrderPlacedNotes } from '$lib/browser/localization.js';
	import { symModalKey } from '$lib/browser/storage.js';
	import CheckCircleIcon from '$lib/components/common/svg/check-circle-icon.svelte';
	import { getContext, onMount } from 'svelte';

	let isThankYouUrlPresent = false;
	const modal = getContext(symModalKey);

	onMount(() => {
		if ($sCart.urls && $sCart.urls.thank_you_page) {
			isThankYouUrlPresent = true;
			modal.handleOrderPlaced($sCart.urls.thank_you_page);
		}
	});
</script>

<div class="flex flex-col h-3/4 justify-center" fobs id="viewOrderPlaced">
	<div class="flex flex-col justify-center items-center gap-3 text-center">
		<div class="basis-full stroke-blue-500"><CheckCircleIcon /></div>
		<div class="basis-full text-lg text-blue-500 font-semibold">
			{OrderPlaced}
		</div>
		<div class="basis-full text-xs">
			{$sCart.platform_order_number}
		</div>
		{#if !isThankYouUrlPresent}
			<div class="basis-full text-base">
				{OrderPlacedNotes}
			</div>
		{/if}
		<div class="basis-full text-base">
			{$sCart.shipping_info.email}
		</div>
		{#if isThankYouUrlPresent}
			<div class="basis-full text-base">
				{OrderPlacedBuffer}
			</div>
		{/if}
	</div>
</div>
