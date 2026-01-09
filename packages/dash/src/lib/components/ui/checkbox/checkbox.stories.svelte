<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from '@storybook/test';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	const { Story } = defineMeta({
		title: 'Forms/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			checked: {
				control: 'select',
				options: [true, false, 'indeterminate']
			},
			disabled: { control: 'boolean' }
		}
	});
</script>

<script>
	import { Label } from '$lib/components/ui/label/index.js';

	let defaultChecked = $state(false);
	let termsChecked = $state(false);
	let newsletterChecked = $state(true);
	let updatesChecked = $state(false);
	let toggleChecked = $state(false);
</script>

{#snippet template(args)}
	<Checkbox {...args} />
{/snippet}

<Story name="Default" args={{ checked: false }} {template} />

<Story name="Checked" args={{ checked: true }} {template} />

<Story name="Indeterminate" args={{ checked: 'indeterminate' }} {template} />

<Story name="Disabled Unchecked" args={{ disabled: true, checked: false }} {template} />

<Story name="Disabled Checked" args={{ disabled: true, checked: true }} {template} />

<Story name="With Label">
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Checkbox id="terms" bind:checked={termsChecked} />
			<Label
				for="terms"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				Accept terms and conditions
			</Label>
		</div>
	{/snippet}
</Story>

<Story name="Disabled With Label">
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Checkbox id="disabled-terms" disabled checked={true} />
			<Label
				for="disabled-terms"
				class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				This option is disabled
			</Label>
		</div>
	{/snippet}
</Story>

<Story name="Checkbox Group">
	{#snippet template()}
		<div class="space-y-4">
			<h4 class="text-sm font-medium leading-none">Notification Preferences</h4>
			<div class="space-y-3">
				<div class="flex items-center space-x-2">
					<Checkbox id="newsletter" bind:checked={newsletterChecked} />
					<Label for="newsletter" class="text-sm font-medium leading-none">
						Subscribe to newsletter
					</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="updates" bind:checked={updatesChecked} />
					<Label for="updates" class="text-sm font-medium leading-none">
						Receive product updates
					</Label>
				</div>
				<div class="flex items-center space-x-2">
					<Checkbox id="marketing" disabled />
					<Label
						for="marketing"
						class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Marketing emails (disabled)
					</Label>
				</div>
			</div>
		</div>
	{/snippet}
</Story>

<Story
	name="Toggle Checkbox"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the checkbox
		const checkbox = canvas.getByRole('checkbox');

		// Initially unchecked
		await expect(checkbox).not.toBeChecked();

		// Click to check
		await userEvent.click(checkbox);

		// Should be checked
		await expect(checkbox).toBeChecked();

		// Click again to uncheck
		await userEvent.click(checkbox);

		// Should be unchecked
		await expect(checkbox).not.toBeChecked();
	}}
>
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Checkbox id="toggle-test" bind:checked={toggleChecked} />
			<Label for="toggle-test" class="text-sm font-medium leading-none">Toggle me</Label>
		</div>
	{/snippet}
</Story>

<Story
	name="Disabled Checkbox Cannot Toggle"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the checkbox
		const checkbox = canvas.getByRole('checkbox');

		// Verify it's disabled
		await expect(checkbox).toBeDisabled();

		// Click should not change state
		await userEvent.click(checkbox);

		// Should still be unchecked
		await expect(checkbox).not.toBeChecked();
	}}
>
	{#snippet template()}
		<Checkbox disabled />
	{/snippet}
</Story>

<Story
	name="Keyboard Toggle"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Find the checkbox
		const checkbox = canvas.getByRole('checkbox');

		// Initially unchecked
		await expect(checkbox).not.toBeChecked();

		// Focus using tab (doesn't toggle)
		await userEvent.tab();

		// Space to toggle to checked
		await userEvent.keyboard(' ');
		await expect(checkbox).toBeChecked();

		// Space again to toggle back to unchecked
		await userEvent.keyboard(' ');
		await expect(checkbox).not.toBeChecked();
	}}
>
	{#snippet template()}
		<div class="flex items-center space-x-2">
			<Checkbox id="keyboard-test" bind:checked={defaultChecked} />
			<Label for="keyboard-test" class="text-sm font-medium leading-none">
				Press Space to toggle
			</Label>
		</div>
	{/snippet}
</Story>
