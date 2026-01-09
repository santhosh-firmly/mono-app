<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AlertBanner from './alert-banner.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/Alert Banner',
		component: AlertBanner,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['success', 'error', 'warning', 'info']
			},
			message: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<AlertBanner {...args} />
{/snippet}

<Story
	name="Info"
	args={{
		variant: 'info',
		message: 'This is an informational message for the user.'
	}}
	{template}
/>

<Story
	name="Success"
	args={{
		variant: 'success',
		message: 'Your changes have been saved successfully.'
	}}
	{template}
/>

<Story
	name="Warning"
	args={{
		variant: 'warning',
		message: 'Please review your settings before proceeding.'
	}}
	{template}
/>

<Story
	name="Error"
	args={{
		variant: 'error',
		message: 'An error occurred while processing your request.'
	}}
	{template}
/>

<Story name="All Variants">
	<div class="space-y-4">
		<AlertBanner variant="info" message="This is an informational message." />
		<AlertBanner variant="success" message="Operation completed successfully." />
		<AlertBanner variant="warning" message="Please proceed with caution." />
		<AlertBanner variant="error" message="Something went wrong." />
	</div>
</Story>
