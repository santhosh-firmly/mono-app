<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CancelInviteDialog from './cancel-invite-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Cancel Invite Dialog',
		component: CancelInviteDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			domain: { control: 'text' },
			email: { control: 'text' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<CancelInviteDialog {...args} />
{/snippet}

<Story
	name="Default"
	args={{ open: true, domain: 'example.com', email: 'user@example.com' }}
	{template}
/>

<Story
	name="Submitting"
	args={{ open: true, domain: 'example.com', email: 'user@example.com', isSubmitting: true }}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		domain: 'example.com',
		email: 'user@example.com',
		error: 'Failed to cancel invitation'
	}}
	{template}
/>
