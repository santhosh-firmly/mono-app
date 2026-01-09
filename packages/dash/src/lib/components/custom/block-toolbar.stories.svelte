<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BlockToolbar from './block-toolbar.svelte';

	const { Story } = defineMeta({
		title: 'Dev Tools/Block Toolbar',
		component: BlockToolbar,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<BlockToolbar {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		resizablePaneRef: {
			resize: (value) => console.log('Resize to:', value)
		}
	}}
	{template}
/>

<Story name="With Content">
	{#snippet template()}
		<div class="flex flex-col items-center gap-4">
			<BlockToolbar
				resizablePaneRef={{
					resize: (value) => console.log('Resize to:', value + '%')
				}}
			/>
			<div class="w-full max-w-md rounded-lg border bg-muted/50 p-8 text-center">
				<p class="text-sm text-muted-foreground">
					Click the icons above to simulate responsive preview modes
				</p>
			</div>
		</div>
	{/snippet}
</Story>
