<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RemoveMemberDialog from './remove-member-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Team/Remove Member Dialog',
		component: RemoveMemberDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			open: { control: 'boolean' },
			memberEmail: { control: 'text' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<RemoveMemberDialog {...args} />
{/snippet}

<Story name="Default" args={{ open: true, memberEmail: 'user@example.com' }} {template} />

<Story
	name="Submitting"
	args={{ open: true, memberEmail: 'user@example.com', isSubmitting: true }}
	{template}
/>

<Story
	name="With Error"
	args={{
		open: true,
		memberEmail: 'user@example.com',
		error: 'Failed to remove team member'
	}}
	{template}
/>
