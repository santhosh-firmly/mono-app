<script>
	// @ts-nocheck
	import { sCart } from '$lib-v4/browser/api-manager.js';
	import {
		OrderPlaced,
		OrderPlacedBuffer,
		OrderPlacedNotes
	} from '$lib-v4/browser/localization.js';
	import { symModalKey } from '$lib-v4/browser/storage.js';
	import CheckCircleIcon from '$lib-v4/components/common/svg/check-circle-icon.svelte';
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

<div
	class="flex h-3/4 flex-col justify-center"
	fobs
	id="viewOrderPlaced"
	data-testid="order-placed-view"
>
	<div class="flex flex-col items-center justify-center gap-3 text-center">
		<div class="basis-full stroke-blue-500"><CheckCircleIcon /></div>
		<div class="basis-full text-lg font-semibold text-blue-500" data-testid="order-placed-title">
			{OrderPlaced}
		</div>
		<div class="basis-full text-xs" data-testid="order-number">
			{$sCart.platform_order_number}
		</div>
		{#if !isThankYouUrlPresent}
			<div class="basis-full text-base" data-testid="order-notes">
				{OrderPlacedNotes}
			</div>
		{/if}
		<div class="basis-full text-base" data-testid="order-email">
			{$sCart.shipping_info.email}
		</div>
		{#if isThankYouUrlPresent}
			<div class="basis-full text-base" data-testid="order-buffer">
				{OrderPlacedBuffer}
			</div>
		{/if}
	</div>
</div>
