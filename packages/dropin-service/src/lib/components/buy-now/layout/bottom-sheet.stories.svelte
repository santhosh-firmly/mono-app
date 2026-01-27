<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import BottomSheetLayout from './bottom-sheet.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Bottom Sheet Layout',
		component: BottomSheetLayout,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template()}
	<div class="h-screen bg-gray-100">
		<BottomSheetLayout>
			<div class="flex flex-col gap-4 p-4">
				<h2 class="text-lg font-semibold">Checkout Content</h2>
				<p class="text-sm text-gray-600">
					This content appears in a bottom sheet that can be dragged to expand.
				</p>
				<div class="flex flex-col gap-2">
					<div class="h-10 w-full rounded bg-gray-200"></div>
					<div class="h-10 w-full rounded bg-gray-200"></div>
					<div class="h-10 w-full rounded bg-gray-200"></div>
				</div>
			</div>
		</BottomSheetLayout>
	</div>
{/snippet}

<Story name="Default" {template} />
