<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from '@storybook/test';
	import LoginCard from './login-card.svelte';

	const { Story } = defineMeta({
		title: 'Authentication/Login Card',
		component: LoginCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onmagiclink: fn(),
			onotp: fn()
		},
		argTypes: {
			email: { control: 'text', description: 'Email address' },
			error: { control: 'text', description: 'Error message to display' },
			isLoadingMagicLink: {
				control: 'boolean',
				description: 'Whether magic link is loading'
			},
			isLoadingOtp: { control: 'boolean', description: 'Whether OTP is loading' },
			signupUrl: { control: 'text', description: 'URL for signup link' }
		}
	});
</script>

{#snippet template(args)}
	<LoginCard {...args} />
{/snippet}

<Story name="Default" args={{}} {template} />

<Story name="With Email" args={{ email: 'john@example.com' }} {template} />

<Story
	name="With Error"
	args={{
		email: 'invalid',
		error: 'Please enter a valid email address'
	}}
	{template}
/>

<Story
	name="Loading Magic Link"
	args={{
		email: 'john@example.com',
		isLoadingMagicLink: true
	}}
	{template}
/>

<Story
	name="Loading OTP"
	args={{
		email: 'john@example.com',
		isLoadingOtp: true
	}}
	{template}
/>

<Story
	name="Email Input and Magic Link Submit"
	args={{}}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Type email address
		const emailInput = canvas.getByPlaceholderText('you@example.com');
		await userEvent.clear(emailInput);
		await userEvent.type(emailInput, 'test@example.com');

		// Click magic link button
		const magicLinkBtn = canvas.getByRole('button', { name: /magic link/i });
		await userEvent.click(magicLinkBtn);

		// Assert callback was called with the email
		await expect(args.onmagiclink).toHaveBeenCalledWith('test@example.com');
	}}
/>

<Story
	name="Email Input and OTP Submit"
	args={{}}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Type email address
		const emailInput = canvas.getByPlaceholderText('you@example.com');
		await userEvent.clear(emailInput);
		await userEvent.type(emailInput, 'test@example.com');

		// Click OTP button
		const otpBtn = canvas.getByRole('button', { name: /one-time code/i });
		await userEvent.click(otpBtn);

		// Assert callback was called with the email
		await expect(args.onotp).toHaveBeenCalledWith('test@example.com');
	}}
/>

<Story
	name="Empty Email Validation"
	args={{}}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Click magic link button without entering email
		const magicLinkBtn = canvas.getByRole('button', { name: /magic link/i });
		await userEvent.click(magicLinkBtn);

		// Assert error message is shown (use findByText to wait for it)
		await expect(await canvas.findByText('Please enter your email')).toBeInTheDocument();

		// Assert callback was NOT called
		await expect(args.onmagiclink).not.toHaveBeenCalled();
	}}
/>

<Story
	name="Invalid Email Validation"
	args={{}}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Type email that passes browser validation but fails our regex (no TLD)
		const emailInput = canvas.getByPlaceholderText('you@example.com');
		await userEvent.type(emailInput, 'test@nodomain');

		// Click magic link button
		const magicLinkBtn = canvas.getByRole('button', { name: /magic link/i });
		await userEvent.click(magicLinkBtn);

		// Assert error message is shown (use findByText to wait for it)
		await expect(
			await canvas.findByText('Please enter a valid email address')
		).toBeInTheDocument();

		// Assert callback was NOT called
		await expect(args.onmagiclink).not.toHaveBeenCalled();
	}}
/>

<Story
	name="Error Clears on Input"
	args={{ error: 'Some error' }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Error should be visible initially
		await expect(canvas.getByText('Some error')).toBeInTheDocument();

		// Type in email input
		const emailInput = canvas.getByPlaceholderText('you@example.com');
		await userEvent.type(emailInput, 'a');

		// Error should be cleared (not in document)
		await expect(canvas.queryByText('Some error')).not.toBeInTheDocument();
	}}
/>
