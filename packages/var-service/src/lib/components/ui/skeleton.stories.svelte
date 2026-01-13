<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Skeleton from './skeleton.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Skeleton class="h-10 w-64" />
	{/snippet}
</Story>

<Story name="Circle">
	{#snippet template()}
		<Skeleton class="h-12 w-12 rounded-full" />
	{/snippet}
</Story>

<Story name="Loading Card">
	{#snippet template()}
		<div class="w-80 space-y-3">
			<Skeleton class="h-32 w-full" />
			<Skeleton class="h-4 w-3/4" />
			<Skeleton class="h-4 w-1/2" />
		</div>
	{/snippet}
</Story>

<Story name="Loading List">
	{#snippet template()}
		<div class="w-80 space-y-2">
			<!-- eslint-disable-next-line no-unused-vars -->
			{#each Array(5) as _, i (i)}
				<Skeleton class="h-10 w-full" />
			{/each}
		</div>
	{/snippet}
</Story>
