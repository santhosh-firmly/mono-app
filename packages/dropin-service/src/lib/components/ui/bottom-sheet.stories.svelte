<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import BottomSheet from '$lib/components/ui/bottom-sheet.svelte';
	import UiButton from '$lib/components/ui/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Bottom Sheet',
		component: BottomSheet,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			open: false,
			snapPoints: ['148px', '355px', 1]
		},
		argTypes: {
			open: {
				control: 'boolean',
				description: 'Whether the bottom sheet is open'
			},
			snapPoints: {
				control: 'object',
				description: 'Array of snap points for the drawer'
			},
			onOpenChange: {
				action: 'openChanged',
				description: 'Function called when open state changes'
			}
		}
	});
</script>

<!-- Default Bottom Sheet -->
<Story
	name="Default"
	args={{
		open: true
	}}
>
	<div class="p-6">
		<h2 class="mb-4 text-xl font-bold">Bottom Sheet Content</h2>
		<p>This is the content inside the bottom sheet.</p>
	</div>
</Story>

<!-- With Trigger Button -->
<Story name="With Trigger">
	{#snippet trigger()}
		<UiButton>Open Bottom Sheet</UiButton>
	{/snippet}

	<div class="p-6">
		<h2 class="mb-4 text-xl font-bold">Bottom Sheet Content</h2>
		<p>Click outside or drag down to close.</p>
	</div>
</Story>

<!-- With Custom Snap Points -->
<Story
	name="Custom Snap Points"
	args={{
		open: true,
		snapPoints: ['200px', '500px', 1]
	}}
>
	<div class="p-6">
		<h2 class="mb-4 text-xl font-bold">Scrollable Content</h2>
		{#each Array(20) as _, i (_)}
			<p class="mb-2">Item {i + 1}</p>
		{/each}
	</div>
</Story>
