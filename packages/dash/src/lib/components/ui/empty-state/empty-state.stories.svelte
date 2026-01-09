<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EmptyState from './empty-state.svelte';
	import Package from 'lucide-svelte/icons/package';
	import Users from 'lucide-svelte/icons/users';
	import FileText from 'lucide-svelte/icons/file-text';
	import Search from 'lucide-svelte/icons/search';

	const { Story } = defineMeta({
		title: 'Feedback/Empty State',
		component: EmptyState,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			title: { control: 'text' },
			description: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<EmptyState {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		icon: Package,
		title: 'No products found',
		description: 'Add your first product to get started'
	}}
	{template}
/>

<Story
	name="No Users"
	args={{
		icon: Users,
		title: 'No team members',
		description: 'Invite team members to collaborate on this project'
	}}
	{template}
/>

<Story
	name="No Documents"
	args={{
		icon: FileText,
		title: 'No documents',
		description: 'Upload documents to share with your team'
	}}
	{template}
/>

<Story
	name="No Search Results"
	args={{
		icon: Search,
		title: 'No results found',
		description: 'Try adjusting your search or filter criteria'
	}}
	{template}
/>

<Story
	name="Without Icon"
	args={{
		title: 'Nothing here yet',
		description: 'Start by creating your first item'
	}}
	{template}
/>

<Story
	name="Without Description"
	args={{
		icon: Package,
		title: 'No items'
	}}
	{template}
/>

<Story name="All Variants">
	<div class="grid gap-4 md:grid-cols-2">
		<EmptyState icon={Package} title="No products" description="Add products to your catalog" />
		<EmptyState icon={Users} title="No team members" description="Invite your team" />
		<EmptyState icon={FileText} title="No documents" description="Upload your first document" />
		<EmptyState icon={Search} title="No results" description="Try a different search term" />
	</div>
</Story>
