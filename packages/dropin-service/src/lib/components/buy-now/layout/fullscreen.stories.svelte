<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import FullscreenLayout from './fullscreen.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Fullscreen Layout',
		component: FullscreenLayout,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template()}
	<FullscreenLayout>
		<div class="flex size-full flex-col bg-white">
			<header class="border-b p-4">
				<h1 class="text-xl font-bold">Checkout</h1>
			</header>
			<main class="flex-1 overflow-auto p-4">
				<div class="flex flex-col gap-4">
					<p class="text-sm text-gray-600">
						This is a fullscreen layout that takes over the entire viewport.
					</p>
					<div class="flex flex-col gap-2">
						<div class="h-10 w-full rounded bg-gray-200"></div>
						<div class="h-10 w-full rounded bg-gray-200"></div>
						<div class="h-10 w-full rounded bg-gray-200"></div>
						<div class="h-32 w-full rounded bg-gray-100"></div>
					</div>
				</div>
			</main>
		</div>
	</FullscreenLayout>
{/snippet}

<Story name="Default" {template} />
