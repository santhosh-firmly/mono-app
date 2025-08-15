<script>
	// @ts-nocheck

	import { getCardTypeByType, getCardTypeByValue } from '$lib-v4/browser/credit-card-helper';
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

<div class="flex w-full items-center gap-3" data-testid="existing-credit-card">
	<div class="flex h-full w-11 items-center justify-center">
		{#if showSkeleton}
			<div role="status" class="w-full animate-pulse space-y-6">
				<div class="bg-fy-on-primary-subtle2 h-10 w-full animate-pulse rounded-lg px-4 py-2"></div>
			</div>
		{:else}
			<svelte:component this={cardComponent} src={customArtUrl} />
		{/if}
	</div>
	<div class="flex flex-col">
		<div class="text-fy-on-surface flex h-full items-center text-sm">
			{#if showSkeleton}
				<div
					data-testid="card-number-skeleton"
					class="bg-fy-on-primary-subtle2 h-4 w-32 animate-pulse rounded-lg px-4 py-2"
				></div>
			{:else}
				<span data-testid="card-number">{firstLineText}</span>
			{/if}
		</div>

		{#if secondLineText && !showSkeleton}
			<div data-testid="card-issuer" class="text-fy-on-primary-subtle flex h-full text-xs">
				{secondLineText}
			</div>
		{/if}
	</div>
</div>
