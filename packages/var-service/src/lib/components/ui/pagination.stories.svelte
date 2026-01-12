<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Pagination from './pagination.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Pagination',
		component: Pagination,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Few Items">
	{#snippet template()}
		<Pagination totalItems={50} itemsPerPage={10} currentPage={1} />
	{/snippet}
</Story>

<Story name="Many Items">
	{#snippet template()}
		<Pagination totalItems={200} itemsPerPage={10} currentPage={1} />
	{/snippet}
</Story>

<Story name="Current Page">
	{#snippet template()}
		<Pagination totalItems={200} itemsPerPage={10} currentPage={5} />
	{/snippet}
</Story>

<Story name="Last Page">
	{#snippet template()}
		<Pagination totalItems={200} itemsPerPage={10} currentPage={20} />
	{/snippet}
</Story>

<Story name="Hidden (Too Few Items)">
	{#snippet template()}
		<div>
			<p class="mb-4 text-sm">Pagination hidden when totalItems &lt;= 10</p>
			<Pagination totalItems={8} itemsPerPage={10} currentPage={1} />
		</div>
	{/snippet}
</Story>
