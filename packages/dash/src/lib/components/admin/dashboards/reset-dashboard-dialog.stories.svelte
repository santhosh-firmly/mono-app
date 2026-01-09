<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ResetDashboardDialog from './reset-dashboard-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Reset Dashboard Dialog',
		component: ResetDashboardDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			domain: { control: 'text' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<ResetDashboardDialog {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		open: true,
		domain: 'example-store.com',
		isSubmitting: false,
		error: ''
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{
		open: true,
		domain: 'resetting-store.com',
		isSubmitting: true,
		error: ''
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		domain: 'error-store.com',
		isSubmitting: false,
		error: 'Failed to reset dashboard. The merchant may have active orders.'
	}}
	{template}
/>

<Story
	name="Long Domain"
	args={{
		open: true,
		domain: 'very-long-subdomain.example-company-name.co.uk',
		isSubmitting: false,
		error: ''
	}}
	{template}
/>
