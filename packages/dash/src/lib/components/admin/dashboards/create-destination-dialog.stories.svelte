<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CreateDestinationDialog from './create-destination-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Create Destination Dialog',
		component: CreateDestinationDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<CreateDestinationDialog {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		open: true,
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{
		open: true,
		isSubmitting: true,
		error: ''
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		isSubmitting: false,
		error: 'A destination with this App ID already exists.'
	}}
	{template}
/>
