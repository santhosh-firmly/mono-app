<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from '@storybook/test';
	import SignUp from './sign-up.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Onboarding/Sign Up',
		component: SignUp,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[450px]">
		<SignUp {...args} />
	</div>
{/snippet}

<Story name="Default" args={{}} {template} />

<Story
	name="Fill Form Fields"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Fill in store URL
		const urlInput = canvas.getByPlaceholderText('www.merchant.com');
		await userEvent.type(urlInput, 'example.com');

		// Fill in work email (must match domain)
		const emailInput = canvas.getByPlaceholderText('john@merchant.com');
		await userEvent.type(emailInput, 'john@example.com');

		// Fill in name
		const nameInput = canvas.getByPlaceholderText('John Doe');
		await userEvent.type(nameInput, 'John Smith');

		// Fill in job title
		const titleInput = canvas.getByPlaceholderText('Marketing Manager');
		await userEvent.type(titleInput, 'CEO');

		// Fill in company
		const companyInput = canvas.getByPlaceholderText('Merchant Inc');
		await userEvent.type(companyInput, 'Example Corp');

		// Fill in location
		const locationInput = canvas.getByPlaceholderText('Seattle, WA');
		await userEvent.type(locationInput, 'New York, NY');

		// Verify all fields have values
		await expect(urlInput).toHaveValue('example.com');
		await expect(emailInput).toHaveValue('john@example.com');
		await expect(nameInput).toHaveValue('John Smith');
		await expect(titleInput).toHaveValue('CEO');
		await expect(companyInput).toHaveValue('Example Corp');
		await expect(locationInput).toHaveValue('New York, NY');
	}}
/>

<Story
	name="URL Validation - Empty"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Click continue without filling URL
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should be shown
		await expect(canvas.getByText('Please enter a URL')).toBeInTheDocument();
	}}
/>

<Story
	name="URL Validation - Invalid Domain"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Fill in invalid URL
		const urlInput = canvas.getByPlaceholderText('www.merchant.com');
		await userEvent.type(urlInput, 'invalid');

		// Click continue
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should be shown
		await expect(canvas.getByText('Please enter a valid domain')).toBeInTheDocument();
	}}
/>

<Story
	name="Email Validation - Empty"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Fill valid URL first
		const urlInput = canvas.getByPlaceholderText('www.merchant.com');
		await userEvent.type(urlInput, 'example.com');

		// Click continue without email
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should be shown
		await expect(canvas.getByText('Please enter your work email')).toBeInTheDocument();
	}}
/>

<Story
	name="Email Validation - Domain Mismatch"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Fill URL
		const urlInput = canvas.getByPlaceholderText('www.merchant.com');
		await userEvent.type(urlInput, 'example.com');

		// Fill mismatched email
		const emailInput = canvas.getByPlaceholderText('john@merchant.com');
		await userEvent.type(emailInput, 'john@different.com');

		// Fill required fields
		await userEvent.type(canvas.getByPlaceholderText('John Doe'), 'John');
		await userEvent.type(canvas.getByPlaceholderText('Marketing Manager'), 'CEO');
		await userEvent.type(canvas.getByPlaceholderText('Merchant Inc'), 'Example');
		await userEvent.type(canvas.getByPlaceholderText('Seattle, WA'), 'NYC');

		// Click continue
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should indicate domain mismatch (partial match since message includes HTML link)
		await expect(canvas.getByText(/Email must be from example\.com/)).toBeInTheDocument();
	}}
/>

<Story
	name="Name Validation"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Fill URL and email
		await userEvent.type(canvas.getByPlaceholderText('www.merchant.com'), 'example.com');
		await userEvent.type(canvas.getByPlaceholderText('john@merchant.com'), 'john@example.com');

		// Click continue without name
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should be shown
		await expect(canvas.getByText('Please enter your name')).toBeInTheDocument();
	}}
/>

<Story
	name="Error Clears on Input"
	args={{}}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Click continue to trigger error
		const continueBtn = canvas.getByRole('button', { name: /continue/i });
		await userEvent.click(continueBtn);

		// Error should be shown
		await expect(canvas.getByText('Please enter a URL')).toBeInTheDocument();

		// Type in URL input
		const urlInput = canvas.getByPlaceholderText('www.merchant.com');
		await userEvent.type(urlInput, 'a');

		// Error should be cleared
		await expect(canvas.queryByText('Please enter a URL')).not.toBeInTheDocument();
	}}
/>
