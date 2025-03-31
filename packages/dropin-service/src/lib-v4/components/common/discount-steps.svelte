<script>
	// @ts-nocheck

	import CheckCircleIconAdoreme from './svg/check-circle-icon-adoreme.svelte';

	function isFirstTier(index) {
		return index === 0;
	}

	function isLastTier(index) {
		return index === tiers.length - 1;
	}

	function isMiddleTier(index) {
		return !isFirstTier(index) && !isLastTier(index);
	}

	function getProgress(quantity) {
		return tiers.findLastIndex((t) => quantity >= t.sets);
	}

	function getProgressPercentage(quantity) {
		return getProgress(quantity) / (tiers.length - 1);
	}

	// TODO: Work on localization for singular and plural
	function getSetWord(quantity) {
		return quantity > 1 ? 'sets' : 'set';
	}

	/**
	 * Discount tiers per set
	 */
	export let tiers = [
		{
			text: '40% OFF',
			sets: 1
		},
		{
			text: '45% OFF',
			sets: 2
		},
		{
			text: '50% OFF',
			sets: 3
		}
	];

	/**
	 * Number of sets in the cart
	 */
	export let numberOfSets = 1;
</script>

<div class="my-4 flex w-full flex-col items-start gap-1 px-4">
	<span class="text-sm leading-4 font-bold text-[#813571]">Buy More & Save!</span>
	<div class="relative my-3 flex w-full flex-row items-center justify-between">
		<div class="absolute left-0 flex h-1 w-full flex-row px-[12px]">
			<div
				class="progress-bar h-full bg-[#813571]"
				style:width={100 * getProgressPercentage(numberOfSets) + '%'}
			></div>
			<div class="h-full shrink grow bg-gray-100"></div>
		</div>
		<!-- eslint-disable-next-line no-empty-pattern -->
		{#each tiers as { }, index}
			<CheckCircleIconAdoreme active={index <= getProgress(numberOfSets)} class="z-10" />
		{/each}
	</div>
	<div class="relative flex w-full flex-row items-center justify-between">
		{#each tiers as tier, index}
			<span
				class="text-xs font-bold"
				class:text-[#813571]={index <= getProgress(numberOfSets)}
				class:text-gray-800={index > getProgress(numberOfSets)}
				class:text-center={isMiddleTier(index)}
				class:text-left={isFirstTier(index)}
				class:text-right={isLastTier(index)}
			>
				{tier.text}<br />{tier.sets}
				{getSetWord(tier.sets)}
			</span>
		{/each}
	</div>
</div>

<style>
	.progress-bar {
		transition: width 0.2s ease;
	}
</style>
