<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StickyFormFooter from './sticky-form-footer.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Sticky Form Footer',
		component: StickyFormFooter,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			label: { control: 'text' },
			loadingLabel: { control: 'text' },
			disabled: { control: 'boolean' },
			loading: { control: 'boolean' }
		}
	});
</script>

{#snippet template(args)}
	<div class="relative min-h-[200px] rounded border border-dashed border-muted-foreground/30 p-4">
		<p class="text-sm text-muted-foreground">Form content goes here...</p>
		<StickyFormFooter {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		label: 'Save Changes',
		loadingLabel: 'Saving...'
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		label: 'Save Changes',
		loadingLabel: 'Saving...',
		loading: true
	}}
	{template}
/>

<Story
	name="Disabled"
	args={{
		label: 'Save Changes',
		loadingLabel: 'Saving...',
		disabled: true
	}}
	{template}
/>

<Story
	name="Custom Labels"
	args={{
		label: 'Update Profile',
		loadingLabel: 'Updating profile...'
	}}
	{template}
/>

<Story name="All States">
	<div class="space-y-8">
		<div
			class="relative min-h-[100px] rounded border border-dashed border-muted-foreground/30 p-4"
		>
			<p class="mb-2 text-xs font-medium">Default</p>
			<StickyFormFooter label="Save Changes" loadingLabel="Saving..." />
		</div>
		<div
			class="relative min-h-[100px] rounded border border-dashed border-muted-foreground/30 p-4"
		>
			<p class="mb-2 text-xs font-medium">Loading</p>
			<StickyFormFooter label="Save Changes" loadingLabel="Saving..." loading={true} />
		</div>
		<div
			class="relative min-h-[100px] rounded border border-dashed border-muted-foreground/30 p-4"
		>
			<p class="mb-2 text-xs font-medium">Disabled</p>
			<StickyFormFooter label="Save Changes" loadingLabel="Saving..." disabled={true} />
		</div>
	</div>
</Story>
