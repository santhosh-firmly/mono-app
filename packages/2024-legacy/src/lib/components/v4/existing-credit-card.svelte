<script>
	// @ts-nocheck

	import { getCardTypeByType, getCardTypeByValue } from '$lib/browser/credit-card-helper';
	import CustomArtCardIcon from '../common/svg/custom-art-card-icon.svelte';

	/**
	 * Credit card number
	 */
	export let number = '';

	/**
	 * Credit card brand
	 */
	export let type;

	/**
	 * Credit card bank issuer
	 */
	export let issuer = '';

	/**
	 * If skeleton should be displayed instead of the actual information (Use when data is loading)
	 */
	export let showSkeleton = false;

	export let customArtUrl;

	const cardType = type
		? getCardTypeByType(type, 'checkoutV4')
		: getCardTypeByValue(number, 'checkoutV4');
	const cardComponent = customArtUrl ? CustomArtCardIcon : cardType.component;

	const lastFourRegex = /\d{4}$/;
	const lastFourValidated = number.match(lastFourRegex)?.[0];

	const brandAndLastFour = `${cardType.displayName} *** ${lastFourValidated}`;
	const firstLineText = issuer || brandAndLastFour;
	const secondLineText = issuer ? brandAndLastFour : '';
</script>

<div class="w-full flex gap-3 items-center">
	<div class="h-full w-11 flex items-center justify-center">
		{#if showSkeleton}
			<div role="status" class="space-y-6 animate-pulse w-full">
				<div class="h-10 px-4 py-2 rounded-lg w-full bg-fy-on-primary-subtle2 animate-pulse"></div>
			</div>
		{:else}
			<svelte:component this={cardComponent} src={customArtUrl} />
		{/if}
	</div>
	<div class="flex flex-col">
		<div class="text-fy-on-surface text-sm font-bold flex items-center h-full">
			{#if showSkeleton}
				<div class="h-4 px-4 py-2 rounded-lg w-32 bg-fy-on-primary-subtle2 animate-pulse"></div>
			{:else}
				{firstLineText}
			{/if}
		</div>

		{#if secondLineText && !showSkeleton}
			<div class="text-fy-on-primary-subtle flex text-xs h-full">
				{secondLineText}
			</div>
		{/if}
	</div>
</div>
