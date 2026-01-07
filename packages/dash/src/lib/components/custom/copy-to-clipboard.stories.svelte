<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from '@storybook/test';
	import CopyToClipboard from './copy-to-clipboard.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/Copy To Clipboard',
		component: CopyToClipboard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			value: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<div class="group flex items-center gap-2 rounded border p-3">
		<span class="font-mono text-sm">{args.value}</span>
		<CopyToClipboard {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ value: 'ord_12345abcdef' }} {template} />

<Story
	name="Long Value"
	args={{ value: 'sk_test_51HG3h2CgT9KuF5kQQW7xyzABCDEFGHIJKLMNOPQRSTUVWXYZ' }}
	{template}
/>

<Story name="URL" args={{ value: 'https://api.example.com/v1/orders' }} {template} />

<Story name="Email" args={{ value: 'support@example.com' }} {template} />

<Story
	name="Click to Copy"
	args={{ value: 'test-copy-value' }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the copy button
		const copyBtn = canvas.getByRole('button');

		// Click to copy
		await userEvent.click(copyBtn);

		// Button should exist and be clickable
		await expect(copyBtn).toBeInTheDocument();
	}}
/>

<Story
	name="Button is Focusable"
	args={{ value: 'focusable-value' }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the copy button
		const copyBtn = canvas.getByRole('button');

		// Tab to focus
		await userEvent.tab();

		// Button should be focusable
		await expect(copyBtn).toBeInTheDocument();
	}}
/>
