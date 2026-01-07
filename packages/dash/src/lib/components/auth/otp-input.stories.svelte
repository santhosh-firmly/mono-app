<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from '@storybook/test';
	import OtpInput from './otp-input.svelte';

	const { Story } = defineMeta({
		title: 'Authentication/OTP Input',
		component: OtpInput,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onchange: fn()
		},
		argTypes: {
			value: { control: 'object', description: 'Array of 6 digit strings' },
			error: { control: 'text', description: 'Error message to display' },
			disabled: { control: 'boolean', description: 'Whether the input is disabled' },
			autofocus: {
				control: 'boolean',
				description: 'Whether to autofocus the first input on mount'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="p-4">
		<OtpInput {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ value: ['', '', '', '', '', ''], autofocus: false }} {template} />

<Story
	name="Partially Filled"
	args={{ value: ['1', '2', '3', '', '', ''], autofocus: false }}
	{template}
/>

<Story
	name="Complete"
	args={{ value: ['1', '2', '3', '4', '5', '6'], autofocus: false }}
	{template}
/>

<Story
	name="With Error"
	args={{
		value: ['1', '2', '3', '', '', ''],
		error: 'Please enter the complete 6-digit code',
		autofocus: false
	}}
	{template}
/>

<Story
	name="Disabled"
	args={{
		value: ['1', '2', '3', '4', '5', '6'],
		disabled: true,
		autofocus: false
	}}
	{template}
/>

<Story
	name="Digit Entry and Auto-Focus"
	args={{ value: ['', '', '', '', '', ''], autofocus: false }}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const inputs = canvas.getAllByRole('textbox');

		// Click first input to focus
		await userEvent.click(inputs[0]);

		// Type first digit - should auto-focus next
		await userEvent.type(inputs[0], '1');
		await expect(inputs[1]).toHaveFocus();

		// Continue typing
		await userEvent.type(inputs[1], '2');
		await expect(inputs[2]).toHaveFocus();

		// Type third digit
		await userEvent.type(inputs[2], '3');
		await expect(inputs[3]).toHaveFocus();

		// Verify onchange was called
		await expect(args.onchange).toHaveBeenCalled();
	}}
/>

<Story
	name="Backspace Navigation"
	args={{ value: ['1', '2', '3', '', '', ''], autofocus: false }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const inputs = canvas.getAllByRole('textbox');

		// Focus the empty fourth input
		await userEvent.click(inputs[3]);

		// Press backspace on empty input - should move to previous
		await userEvent.keyboard('{Backspace}');
		await expect(inputs[2]).toHaveFocus();
	}}
/>

<Story
	name="Only Accepts Digits"
	args={{ value: ['', '', '', '', '', ''], autofocus: false }}
	{template}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const inputs = canvas.getAllByRole('textbox');

		// Click first input
		await userEvent.click(inputs[0]);

		// Try to type a letter - should be rejected
		await userEvent.type(inputs[0], 'a');

		// Value should still be empty and focus should NOT move
		await expect(inputs[0]).toHaveValue('');
		await expect(inputs[0]).toHaveFocus();

		// Type a digit - should work
		await userEvent.type(inputs[0], '5');
		await expect(inputs[0]).toHaveValue('5');
		await expect(inputs[1]).toHaveFocus();
	}}
/>

<Story
	name="Complete OTP Entry"
	args={{ value: ['', '', '', '', '', ''], autofocus: false }}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const inputs = canvas.getAllByRole('textbox');

		// Click first input
		await userEvent.click(inputs[0]);

		// Type all 6 digits
		await userEvent.type(inputs[0], '1');
		await userEvent.type(inputs[1], '2');
		await userEvent.type(inputs[2], '3');
		await userEvent.type(inputs[3], '4');
		await userEvent.type(inputs[4], '5');
		await userEvent.type(inputs[5], '6');

		// Verify all inputs have correct values
		await expect(inputs[0]).toHaveValue('1');
		await expect(inputs[1]).toHaveValue('2');
		await expect(inputs[2]).toHaveValue('3');
		await expect(inputs[3]).toHaveValue('4');
		await expect(inputs[4]).toHaveValue('5');
		await expect(inputs[5]).toHaveValue('6');

		// Verify onchange was called with complete OTP
		await expect(args.onchange).toHaveBeenLastCalledWith('123456');
	}}
/>
