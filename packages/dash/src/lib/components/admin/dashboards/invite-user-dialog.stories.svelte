<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import InviteUserDialog from './invite-user-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Invite User Dialog',
		component: InviteUserDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			domain: { control: 'text' },
			isResend: { control: 'boolean' },
			initialEmail: { control: 'text' },
			initialRole: { control: 'select', options: ['owner', 'editor', 'viewer'] },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' },
			success: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<InviteUserDialog {...args} />
{/snippet}

<Story name="Default" args={{ open: true, domain: 'example.com' }} {template} />

<Story
	name="Resend Invitation"
	args={{
		open: true,
		domain: 'example.com',
		isResend: true,
		initialEmail: 'user@example.com',
		initialRole: 'owner'
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{ open: true, domain: 'example.com', isSubmitting: true }}
	{template}
/>

<Story
	name="With Error"
	args={{ open: true, domain: 'example.com', error: 'User already has access' }}
	{template}
/>

<Story
	name="With Success"
	args={{ open: true, domain: 'example.com', success: 'Invitation sent successfully!' }}
	{template}
/>
