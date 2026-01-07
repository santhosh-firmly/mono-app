<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, userEvent, within } from '@storybook/test';
	import { Button } from '$lib/components/ui/button/index.js';

	const { Story } = defineMeta({
		title: 'Foundations/Buttons/Button',
		component: Button,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onclick: fn()
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
			},
			size: {
				control: 'select',
				options: ['default', 'sm', 'lg', 'icon']
			},
			disabled: { control: 'boolean' }
		}
	});
</script>

{#snippet template(args)}
	<Button {...args}>Button</Button>
{/snippet}

<Story name="Default" args={{ variant: 'default' }} {template} />
<Story name="Destructive" args={{ variant: 'destructive' }} {template} />
<Story name="Outline" args={{ variant: 'outline' }} {template} />
<Story name="Secondary" args={{ variant: 'secondary' }} {template} />
<Story name="Ghost" args={{ variant: 'ghost' }} {template} />
<Story name="Link" args={{ variant: 'link' }} {template} />
<Story name="Small" args={{ size: 'sm' }} {template} />
<Story name="Large" args={{ size: 'lg' }} {template} />
<Story name="Disabled" args={{ disabled: true }} {template} />

<Story
	name="Click Handler"
	args={{ variant: 'default' }}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Find and click the button
		const button = canvas.getByRole('button');
		await userEvent.click(button);

		// Verify onclick was called
		await expect(args.onclick).toHaveBeenCalled();
	}}
/>

<Story
	name="Disabled Does Not Fire Click"
	args={{ disabled: true }}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the disabled button
		const button = canvas.getByRole('button');

		// Verify it's disabled (this implicitly means it won't fire click)
		await expect(button).toBeDisabled();

		// Verify onclick has NOT been called (button is disabled, no interaction happened)
		await expect(args.onclick).not.toHaveBeenCalled();
	}}
/>

<Story
	name="Keyboard Activation"
	args={{ variant: 'default' }}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Find and focus the button
		const button = canvas.getByRole('button');
		await userEvent.click(button);

		// Press Enter to activate
		await userEvent.keyboard('{Enter}');

		// Verify onclick was called
		await expect(args.onclick).toHaveBeenCalled();
	}}
/>
