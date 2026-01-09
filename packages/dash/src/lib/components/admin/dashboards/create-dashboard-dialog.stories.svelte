<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CreateDashboardDialog from './create-dashboard-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Create Dashboard Dialog',
		component: CreateDashboardDialog,
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
	<CreateDashboardDialog {...args} />
{/snippet}

<Story name="Default" args={{ open: true }} {template} />

<Story name="Submitting" args={{ open: true, isSubmitting: true }} {template} />

<Story name="With Error" args={{ open: true, error: 'Domain already exists' }} {template} />
