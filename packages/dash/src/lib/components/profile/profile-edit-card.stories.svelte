<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from '@storybook/test';
	import ProfileEditCard from './profile-edit-card.svelte';

	const { Story } = defineMeta({
		title: 'Profile/Profile Edit Card',
		component: ProfileEditCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onSave: fn(),
			onCancel: fn()
		},
		argTypes: {
			isEditing: { control: 'boolean' },
			isSaving: { control: 'boolean' },
			error: { control: 'text' },
			success: { control: 'text' }
		}
	});

	const mockUser = {
		name: 'John Doe',
		email: 'john.doe@example.com',
		company: 'Acme Corporation',
		title: 'Senior Developer',
		location: 'San Francisco, CA'
	};

	const emptyUser = {
		name: 'Jane Smith',
		email: 'jane@example.com',
		company: '',
		title: '',
		location: ''
	};
</script>

{#snippet template(args)}
	<div class="w-96">
		<ProfileEditCard {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ user: mockUser }} {template} />

<Story name="Editing Mode" args={{ user: mockUser, isEditing: true }} {template} />

<Story name="Saving" args={{ user: mockUser, isEditing: true, isSaving: true }} {template} />

<Story
	name="With Error"
	args={{ user: mockUser, isEditing: true, error: 'Failed to save profile' }}
	{template}
/>

<Story
	name="With Success"
	args={{ user: mockUser, success: 'Profile updated successfully!' }}
	{template}
/>

<Story name="Empty Fields" args={{ user: emptyUser }} {template} />

<Story
	name="Display User Information"
	args={{ user: mockUser }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify user info is displayed
		await expect(canvas.getByText('John Doe')).toBeInTheDocument();
		await expect(canvas.getByText('john.doe@example.com')).toBeInTheDocument();
	}}
/>

<Story
	name="Edit Mode Shows Inputs"
	args={{ user: mockUser, isEditing: true }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// In edit mode, should show input fields
		const nameInput = canvas.getByDisplayValue('John Doe');
		await expect(nameInput).toBeInTheDocument();

		// Verify inputs are editable
		await expect(nameInput).toBeEnabled();
	}}
/>

<Story
	name="Edit Fields"
	args={{ user: mockUser, isEditing: true }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the name input and modify it
		const nameInput = canvas.getByDisplayValue('John Doe');
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'Jane Doe');

		// Verify the change
		await expect(nameInput).toHaveValue('Jane Doe');
	}}
/>

<Story
	name="Error Message Display"
	args={{ user: mockUser, isEditing: true, error: 'Failed to save profile' }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Error message should be visible
		await expect(canvas.getByText('Failed to save profile')).toBeInTheDocument();
	}}
/>

<Story
	name="Success Message Display"
	args={{ user: mockUser, success: 'Profile updated successfully!' }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Success message should be visible
		await expect(canvas.getByText('Profile updated successfully!')).toBeInTheDocument();
	}}
/>
