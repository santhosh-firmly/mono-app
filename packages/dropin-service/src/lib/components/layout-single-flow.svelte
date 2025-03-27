<script>
	import { getLuminance } from '$lib/utils/color-utils';
	import UiFirmlyPowered from '$lib/components/ui/ui-firmly-powered.svelte';

	/**
	 * @typedef {Object} LayoutSingleFlowProps
	 * @property {Object} colors - The colors of the layout
	 * @property {import('svelte').Snippet} asection - The section of the layout
	 * @property {import('svelte').Snippet} bsection - The section of the layout
	 * @property {boolean} isLoading - Whether the layout is loading
	 */

	/**
	 * @type {LayoutSingleFlowProps}
	 */
	let {
		isLoading = false,
		colors = { primary: '#000000', background: '#ffffff' },
		asection,
		bsection
	} = $props();

	let sectionA = $state(null);
	let sectionB = $state(null);

	$effect(() => {
		if (colors) {
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
			sectionB.style.setProperty('--color-border', '#dddddd');
		}
	});
</script>

{#snippet leftSkeleton()}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="hidden flex-col gap-5 p-4 px-8 @md:flex @md:p-0 @md:px-0">
		<div class="mb-8 flex items-center gap-2">
			<div class="bg-border h-6 w-6 animate-pulse rounded-full"></div>
			<div class="bg-border h-6 w-32 animate-pulse rounded-lg px-4 py-2" />
		</div>

		<div class="flex flex-col gap-2">
			<div class="bg-border h-4 w-20 animate-pulse rounded"></div>
			<div class="bg-border h-6 w-20 animate-pulse rounded"></div>
		</div>

		<div class="flex justify-between gap-2">
			<div class="bg-border h-20 w-20 animate-pulse rounded"></div>
			<div class="flex flex-1 flex-col gap-2">
				<div class="bg-border h-4 w-20 animate-pulse rounded"></div>
				<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			</div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>

		<hr class="text-border h-[1px] w-full" />

		<div class="flex justify-between gap-2">
			<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>
		<div class="flex justify-between gap-2">
			<div class="flex flex-1 flex-col gap-2">
				<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
				<div class="bg-border h-4 w-28 animate-pulse rounded"></div>
			</div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>
		<div class="flex justify-between gap-2">
			<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>
		<hr class="text-border h-[1px] w-full" />
		<div class="flex justify-between gap-2">
			<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>
		<div class="mt-4 hidden justify-center @md:flex">
			<UiFirmlyPowered />
		</div>
	</div>

	<div class="flex flex-col items-center justify-center gap-2 @md:hidden">
		<div class="border-border mb-16 flex w-full items-center gap-2 border-b p-2">
			<div class="bg-border h-6 w-6 animate-pulse rounded-full"></div>
			<div class="bg-border h-5 w-20 animate-pulse rounded px-4 py-2"></div>
		</div>

		<div class="bg-border h-32 w-32 animate-pulse rounded"></div>

		<div class="flex flex-col items-center gap-2">
			<div class="bg-border h-6 w-28 animate-pulse rounded"></div>
			<div class="bg-border h-6 w-16 animate-pulse rounded"></div>
		</div>

		<hr class="text-border mt-18 -mb-8 h-[1px] w-full" />
	</div>
{/snippet}

{#snippet rightSkeleton()}
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<div class="flex flex-col gap-4 p-4 @md:p-0 @md:px-4">
		<div class="grid grid-cols-1 gap-4">
			<div class="flex justify-center">
				<div class="bg-border h-8 w-full animate-pulse rounded-lg px-4 py-2" />
			</div>
			<div class="flex justify-center">
				<div class="bg-border h-8 w-full animate-pulse rounded-lg px-4 py-2" />
			</div>
		</div>
		<div class="text-border relative flex w-full flex-row justify-center">
			<div class="absolute left-0 flex h-full w-full flex-col justify-center" style="z-index: -1;">
				<hr class="h-[1px] w-full" />
			</div>
		</div>
		<div>
			<div class="bg-border my-1 h-4 w-40 animate-pulse rounded px-4" />
		</div>
		<div>
			<div class="bg-border my-1 h-3 w-12 animate-pulse rounded px-4" />
			<div class="bg-border my-1 h-10 w-full animate-pulse rounded-lg px-4" />
		</div>
		<div class="my-1 grid grid-cols-2 gap-1">
			<div class="bg-border col-span-2 my-1 h-3 w-32 animate-pulse rounded px-4" />

			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4" />
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4" />
		</div>
		<div class="mt-4 flex flex-col items-center justify-center">
			<div class="bg-border h-16 w-full animate-pulse rounded-lg px-4 py-2" />
			<div class="bg-border my-3 h-4 w-64 animate-pulse rounded-lg px-4" />
		</div>
		<div class="mt-4 flex justify-center @md:hidden">
			<UiFirmlyPowered />
		</div>
	</div>
{/snippet}

<div class="@container relative min-h-screen">
	<div
		class="bg-red bg-background fixed top-0 right-0 bottom-0 left-0 z-[-1] hidden w-1/2 md:block"
		style="--color-background: {colors.background};"
	></div>
	<div class="fixed top-0 right-0 bottom-0 z-[-1] hidden w-1/2 shadow md:block"></div>

	<main class="md:mx-auto md:py-12 lg:max-w-10/12 xl:max-w-9/12 2xl:max-w-6/12">
		<form onsubmit={(e) => e.preventDefault()} class="flex h-full flex-col md:flex-row">
			<section
				bind:this={sectionA}
				class="bg-background md:sticky md:top-0 md:w-1/2 md:bg-transparent md:px-4 md:py-8 lg:px-14"
			>
				{#if isLoading}
					{@render leftSkeleton()}
				{:else}
					{@render asection?.()}
				{/if}
			</section>
			<section bind:this={sectionB} class="flex flex-col px-4 pt-10 md:w-1/2 md:py-8 lg:px-14">
				{#if isLoading}
					{@render rightSkeleton()}
				{:else}
					{@render bsection?.()}
				{/if}
			</section>
		</form>
	</main>
</div>
