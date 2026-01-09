<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from '@storybook/test';
	import { Switch } from '$lib/components/ui/switch/index.js';

	const { Story } = defineMeta({
		title: 'Forms/Switch',
		component: Switch,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			checked: { control: 'boolean' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<script>
	import { Label } from '$lib/components/ui/label/index.js';

	let notifications = $state(true);
	let marketing = $state(false);
	let security = $state(true);
	let toggleSwitch = $state(false);
	let keyboardSwitch = $state(false);
</script>

{#snippet template(args)}
	<Switch {...args} />
{/snippet}

<Story name="Default" args={{ checked: false }} {template} />
<Story name="Checked" args={{ checked: true }} {template} />
<Story name="Disabled Off" args={{ checked: false, disabled: true }} {template} />
<Story name="Disabled On" args={{ checked: true, disabled: true }} {template} />

<Story name="With Label">
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Switch id="airplane-mode" />
			<Label for="airplane-mode">Airplane Mode</Label>
		</div>
	{/snippet}
</Story>

<Story name="Settings Example">
	{#snippet template()}
		<div class="w-80 space-y-4">
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="notifications" class="text-base">Notifications</Label>
					<p class="text-sm text-muted-foreground">Receive notifications about updates</p>
				</div>
				<Switch id="notifications" bind:checked={notifications} />
			</div>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="marketing" class="text-base">Marketing emails</Label>
					<p class="text-sm text-muted-foreground">Receive emails about new products</p>
				</div>
				<Switch id="marketing" bind:checked={marketing} />
			</div>
			<div class="flex items-center justify-between">
				<div class="space-y-0.5">
					<Label for="security" class="text-base">Security alerts</Label>
					<p class="text-sm text-muted-foreground">
						Receive alerts about account security
					</p>
				</div>
				<Switch id="security" bind:checked={security} />
			</div>
		</div>
	{/snippet}
</Story>

<Story
	name="Toggle Switch"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the switch
		const switchEl = canvas.getByRole('switch');

		// Initially unchecked
		await expect(switchEl).not.toBeChecked();

		// Click to turn on
		await userEvent.click(switchEl);

		// Should be checked
		await expect(switchEl).toBeChecked();

		// Click again to turn off
		await userEvent.click(switchEl);

		// Should be unchecked
		await expect(switchEl).not.toBeChecked();
	}}
>
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Switch id="toggle-test" bind:checked={toggleSwitch} />
			<Label for="toggle-test">Toggle me</Label>
		</div>
	{/snippet}
</Story>

<Story
	name="Disabled Switch Cannot Toggle"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the switch
		const switchEl = canvas.getByRole('switch');

		// Verify it's disabled
		await expect(switchEl).toBeDisabled();
	}}
>
	{#snippet template()}
		<Switch disabled />
	{/snippet}
</Story>

<Story
	name="Keyboard Toggle"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the switch
		const switchEl = canvas.getByRole('switch');

		// Verify initially unchecked
		await expect(switchEl).not.toBeChecked();

		// Click to focus and toggle ON
		await userEvent.click(switchEl);
		await expect(switchEl).toBeChecked();

		// Space to toggle OFF
		await userEvent.keyboard(' ');
		await expect(switchEl).not.toBeChecked();

		// Space to toggle ON again
		await userEvent.keyboard(' ');
		await expect(switchEl).toBeChecked();
	}}
>
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Switch id="keyboard-test" bind:checked={keyboardSwitch} />
			<Label for="keyboard-test">Press Space to toggle</Label>
		</div>
	{/snippet}
</Story>
