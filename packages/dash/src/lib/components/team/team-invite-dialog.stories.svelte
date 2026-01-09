<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, screen, userEvent } from '@storybook/test';
	import TeamInviteDialog from './team-invite-dialog.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Team/Team Invite Dialog',
		component: TeamInviteDialog,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onSubmit: fn()
		},
		argTypes: {
			open: { control: 'boolean' },
			isSubmitting: { control: 'boolean' },
			error: { control: 'text' },
			success: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<TeamInviteDialog {...args} />
{/snippet}

<Story name="Default" args={{ open: true }} {template} />

<Story name="Submitting" args={{ open: true, isSubmitting: true }} {template} />

<Story
	name="With Error"
	args={{ open: true, error: 'User already has access to this dashboard' }}
	{template}
/>

<Story
	name="With Success"
	args={{ open: true, success: 'Invitation sent successfully!' }}
	{template}
/>

<Story
	name="Fill and Submit Form"
	args={{ open: true }}
	{template}
	play={async ({ args }) => {
		// Use screen to query portaled dialog content
		const emailInput = await screen.findByPlaceholderText('user@example.com');
		await userEvent.type(emailInput, 'newuser@example.com');

		// Select a different role (native select element)
		const roleSelect = screen.getByLabelText('Role');
		await userEvent.selectOptions(roleSelect, 'viewer');

		// Click send invitation button
		const submitBtn = screen.getByRole('button', { name: /send invitation/i });
		await userEvent.click(submitBtn);

		// Assert onSubmit was called with correct data
		await expect(args.onSubmit).toHaveBeenCalledWith({
			email: 'newuser@example.com',
			role: 'viewer'
		});
	}}
/>

<Story
	name="Submit Button Disabled Without Email"
	args={{ open: true }}
	{template}
	play={async () => {
		// Wait for dialog to render
		await screen.findByPlaceholderText('user@example.com');

		// Find the submit button
		const submitBtn = screen.getByRole('button', { name: /send invitation/i });

		// Button should be disabled without email
		await expect(submitBtn).toBeDisabled();
	}}
/>

<Story
	name="Submit Button Enabled With Email"
	args={{ open: true }}
	{template}
	play={async () => {
		// Wait for dialog and fill in email
		const emailInput = await screen.findByPlaceholderText('user@example.com');
		await userEvent.type(emailInput, 'test@example.com');

		// Button should be enabled with email
		const submitBtn = screen.getByRole('button', { name: /send invitation/i });
		await expect(submitBtn).toBeEnabled();
	}}
/>

<Story name="Cancel Button Closes Dialog" args={{ open: true }} {template} />

<Story
	name="Role Selection"
	args={{ open: true }}
	{template}
	play={async () => {
		// Wait for dialog to render
		await screen.findByPlaceholderText('user@example.com');

		// Find role select (native select element)
		const roleSelect = screen.getByLabelText('Role');

		// Default should be editor
		await expect(roleSelect).toHaveValue('editor');

		// Change to owner
		await userEvent.selectOptions(roleSelect, 'owner');
		await expect(roleSelect).toHaveValue('owner');

		// Change to viewer
		await userEvent.selectOptions(roleSelect, 'viewer');
		await expect(roleSelect).toHaveValue('viewer');
	}}
/>

<Story
	name="Send Invite Flow"
	args={{ open: true, onSubmit: fn() }}
	{template}
	play={async ({ args }) => {
		// Wait for dialog to render and fill form
		const emailInput = await screen.findByPlaceholderText('user@example.com');
		await userEvent.type(emailInput, 'invite@example.com');

		// Click send invitation button
		const submitBtn = screen.getByRole('button', { name: /send invitation/i });
		await userEvent.click(submitBtn);

		// Assert onSubmit was called
		await expect(args.onSubmit).toHaveBeenCalledWith({
			email: 'invite@example.com',
			role: 'editor'
		});
	}}
/>
