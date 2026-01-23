<script>
	import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';

	let { variant = 'left' } = $props();
</script>

{#if variant === 'left'}
	<div class="hidden flex-col gap-5 p-4 px-8 @3xl:flex @3xl:p-0 @3xl:px-0">
		<div class="mb-8 flex items-center gap-2">
			<div class="bg-border size-6 animate-pulse rounded-full"></div>
			<div class="bg-border h-6 w-32 animate-pulse rounded-lg px-4 py-2"></div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="bg-border h-4 w-20 animate-pulse rounded"></div>
			<div class="bg-border h-6 w-20 animate-pulse rounded"></div>
		</div>

		<div class="flex justify-between gap-2">
			<div class="bg-border size-20 animate-pulse rounded"></div>
			<div class="flex flex-1 flex-col gap-2">
				<div class="bg-border h-4 w-20 animate-pulse rounded"></div>
				<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			</div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>

		<hr class="text-border h-px w-full" />

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
		<hr class="text-border h-px w-full" />
		<div class="flex justify-between gap-2">
			<div class="bg-border h-4 w-24 animate-pulse rounded"></div>
			<div class="bg-border h-4 w-10 animate-pulse rounded"></div>
		</div>
		<div class="mt-4 hidden justify-center @3xl:flex">
			<UiFirmlyPowered />
		</div>
	</div>

	<div class="mb-12 flex flex-col items-center justify-center gap-2 @3xl:hidden">
		<div class="border-border mb-16 flex h-12 w-full items-center gap-2 border-b p-2">
			<div class="bg-border size-6 animate-pulse rounded-full"></div>
			<div class="bg-border h-5 w-20 animate-pulse rounded px-4 py-2"></div>
		</div>

		<div class="bg-border size-32 animate-pulse rounded"></div>

		<div class="flex flex-col items-center gap-2">
			<div class="bg-border h-6 w-28 animate-pulse rounded"></div>
			<div class="bg-border h-6 w-16 animate-pulse rounded"></div>
		</div>

		<hr class="text-border mt-18 -mb-8 h-px w-full" />
	</div>
{:else}
	<div class="flex flex-col gap-4 p-4 @3xl:p-0 @3xl:px-4">
		<div class="grid grid-cols-1 gap-4">
			<div class="flex justify-center">
				<div class="bg-border h-8 w-full animate-pulse rounded-lg px-4 py-2"></div>
			</div>
			<div class="flex justify-center">
				<div class="bg-border h-8 w-full animate-pulse rounded-lg px-4 py-2"></div>
			</div>
		</div>
		<div class="text-border relative flex w-full flex-row justify-center">
			<div
				class="absolute left-0 flex size-full flex-col justify-center"
				style="z-index: -1;"
			>
				<hr class="h-px w-full" />
			</div>
		</div>
		<div>
			<div class="bg-border my-1 h-4 w-40 animate-pulse rounded px-4"></div>
		</div>
		<div>
			<div class="bg-border my-1 h-3 w-12 animate-pulse rounded px-4"></div>
			<div class="bg-border my-1 h-10 w-full animate-pulse rounded-lg px-4"></div>
		</div>
		<div class="my-1 grid grid-cols-2 gap-1">
			<div class="bg-border col-span-2 my-1 h-3 w-32 animate-pulse rounded px-4"></div>

			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4"></div>
			<div class="bg-border col-span-2 h-10 w-full animate-pulse rounded-lg px-4"></div>
		</div>
		<div class="mt-4 flex flex-col items-center justify-center">
			<div class="bg-border h-16 w-full animate-pulse rounded-lg px-4 py-2"></div>
			<div class="bg-border my-3 h-4 w-64 animate-pulse rounded-lg px-4"></div>
		</div>
		<div class="mt-4 flex justify-center @3xl:hidden">
			<UiFirmlyPowered />
		</div>
	</div>
{/if}
