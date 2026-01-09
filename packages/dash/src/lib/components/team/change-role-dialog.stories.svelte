<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChangeRoleDialog from './change-role-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Team/Change Role Dialog',
		component: ChangeRoleDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			memberEmail: { control: 'text' },
			currentRole: { control: 'select', options: ['owner', 'editor', 'viewer'] },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<ChangeRoleDialog {...args} />
{/snippet}

<Story
	name="Default"
	args={{ open: true, memberEmail: 'user@example.com', currentRole: 'editor' }}
	{template}
/>

<Story
	name="Current Owner"
	args={{ open: true, memberEmail: 'admin@example.com', currentRole: 'owner' }}
	{template}
/>

<Story
	name="Current Viewer"
	args={{ open: true, memberEmail: 'viewer@example.com', currentRole: 'viewer' }}
	{template}
/>

<Story
	name="Submitting"
	args={{
		open: true,
		memberEmail: 'user@example.com',
		currentRole: 'editor',
		isSubmitting: true
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		memberEmail: 'user@example.com',
		currentRole: 'editor',
		error: 'Failed to update role'
	}}
	{template}
/>
