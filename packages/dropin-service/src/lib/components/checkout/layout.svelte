<script>
	import { getLuminance } from '$lib/utils/color-utils';
	import LayoutSkeleton from '$lib/components/checkout/layout-skeleton.svelte';

	/**
	 * @typedef {Object} LayoutSingleFlowProps
	 * @property {Object} colors - The colors of the layout
	 * @property {import('svelte').Snippet} asection - The section of the layout
	 * @property {import('svelte').Snippet} bsection - The section of the layout
	 * @property {import('svelte').Snippet} mobileHeader - The mobile header section
	 * @property {boolean} isLoading - Whether the layout is loading
	 */

	/**
	 * @type {LayoutSingleFlowProps}
	 */
	let {
		isLoading = false,
		colors = { primary: '#000000', background: '#ffffff' },
		asection,
		bsection,
		mobileHeader
	} = $props();

	let sectionA = $state(null);
	let sectionB = $state(null);

	$effect(() => {
		if (colors && sectionA && sectionB) {
			sectionA.style.setProperty('--color-primary', colors.primary);
			sectionA.style.setProperty('--color-background', colors.background);
			sectionA.style.setProperty(
				'--color-text',
				getLuminance(colors.background) > 0.5 ? '#000000' : '#ffffff'
			);
			sectionA.style.setProperty(
				'--color-muted',
				getLuminance(colors.background) > 0.5
					? `color-mix(in srgb, ${colors.background} 0%, black 40%)`
					: `color-mix(in srgb, ${colors.background} 0%, white 60%)`
			);
			sectionA.style.setProperty(
				'--color-border',
				getLuminance(colors.background) > 0.5
					? `color-mix(in srgb, ${colors.background} 0%, black 10%)`
					: `color-mix(in srgb, ${colors.background} 0%, white 30%)`
			);

			sectionB.style.setProperty('--color-primary', colors.primary);
			sectionB.style.setProperty('--color-action', colors.primary);
			sectionB.style.setProperty(
				'--color-on-action',
				getLuminance(colors.primary) > 0.5 ? '#000000' : '#ffffff'
			);
			sectionB.style.setProperty('--color-border', '#dddddd');
		}
	});
</script>

<div class="@container relative flex min-h-full w-full flex-col @3xl:block">
	<div
		class="bg-background absolute inset-0 z-[-2] hidden w-1/2 @3xl:block"
		style="--color-background: {colors.background};"
	></div>
	<div class="absolute inset-0 left-1/2 z-[-1] hidden w-1/2 bg-white @3xl:block"></div>

	{#if mobileHeader && !isLoading}
		<div class="sticky top-0 z-120 w-full shrink-0 @3xl:hidden">
			{@render mobileHeader()}
		</div>
	{/if}

	<main
		class="relative flex min-h-0 flex-1 flex-col @3xl:mx-auto @3xl:block @3xl:max-w-250 @3xl:py-12"
	>
		<div class="absolute inset-y-0 left-1/2 hidden w-px bg-gray-200 @3xl:block"></div>
		<form
			onsubmit={(e) => e.preventDefault()}
			class="flex min-h-0 flex-1 flex-col @3xl:h-full @3xl:flex-row"
		>
			<section
				bind:this={sectionA}
				class="bg-background shrink-0 @3xl:sticky @3xl:top-12 @3xl:h-fit @3xl:w-1/2 @3xl:bg-transparent @3xl:px-4 @3xl:py-8 @4xl:px-14"
			>
				{#if isLoading}
					<LayoutSkeleton variant="left" />
				{:else}
					{@render asection?.()}
				{/if}
			</section>
			<section
				bind:this={sectionB}
				class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 @3xl:w-1/2 @3xl:overflow-y-visible @3xl:py-8 @4xl:px-12"
			>
				{#if isLoading}
					<LayoutSkeleton variant="right" />
				{:else}
					{@render bsection?.()}
				{/if}
			</section>
		</form>
	</main>
</div>
