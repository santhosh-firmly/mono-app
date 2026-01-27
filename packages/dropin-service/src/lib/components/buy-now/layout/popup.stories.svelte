<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import PopupLayout from './popup.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Popup Layout',
		component: PopupLayout,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template()}
	<PopupLayout>
		<div class="flex flex-col gap-4 p-6">
			<h2 class="text-lg font-semibold">Checkout</h2>
			<p class="text-sm text-gray-600">
				This content appears in a centered popup modal with a dark overlay.
			</p>
			<div class="flex flex-col gap-2">
				<div class="h-10 w-full rounded bg-gray-200"></div>
				<div class="h-10 w-full rounded bg-gray-200"></div>
				<div class="h-10 w-full rounded bg-gray-200"></div>
			</div>
			<button class="rounded bg-blue-600 px-4 py-2 text-white">Place Order</button>
		</div>
	</PopupLayout>
{/snippet}

<Story name="Default" {template} />
