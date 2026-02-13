<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectionBar from './selection-bar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Play from 'lucide-svelte/icons/play';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Download from 'lucide-svelte/icons/download';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/SelectionBar',
		component: SelectionBar,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			selectedCount: { control: 'number' },
			totalCount: { control: 'number' }
		}
	});
</script>

{#snippet basicTemplate(args)}
	<SelectionBar {...args} onClear={() => alert('Clear clicked')} />
{/snippet}

{#snippet withActionsTemplate(args)}
	<SelectionBar {...args} onClear={() => alert('Clear clicked')}>
		<Button size="sm" variant="secondary">
			<Play class="h-4 w-4 mr-1" />
			Run Pipeline
		</Button>
	</SelectionBar>
{/snippet}

{#snippet multipleActionsTemplate(args)}
	<SelectionBar {...args} onClear={() => alert('Clear clicked')}>
		<Button size="sm" variant="outline">
			<Download class="h-4 w-4 mr-1" />
			Export
		</Button>
		<Button size="sm" variant="destructive">
			<Trash2 class="h-4 w-4 mr-1" />
			Delete
		</Button>
	</SelectionBar>
{/snippet}

<Story
	name="Partial Selection"
	args={{ selectedCount: 5, totalCount: 45 }}
	template={basicTemplate}
/>

<Story
	name="Full Selection"
	args={{ selectedCount: 45, totalCount: 45 }}
	template={basicTemplate}
/>

<Story
	name="Single Selection"
	args={{ selectedCount: 1, totalCount: 45 }}
	template={basicTemplate}
/>

<Story
	name="With Actions"
	args={{ selectedCount: 10, totalCount: 45 }}
	template={withActionsTemplate}
/>

<Story
	name="Multiple Actions"
	args={{ selectedCount: 3, totalCount: 20 }}
	template={multipleActionsTemplate}
/>

<Story name="No Selection" args={{ selectedCount: 0, totalCount: 45 }} template={basicTemplate} />
