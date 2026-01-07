<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, screen, userEvent, within } from '@storybook/test';
	import * as Select from '$lib/components/ui/select/index.js';
	import SelectTrigger from '$lib/components/ui/select/select-trigger.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Select',
		component: SelectTrigger,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});

	const fruitOptions = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'banana', label: 'Banana' },
		{ value: 'orange', label: 'Orange' },
		{ value: 'grape', label: 'Grape' },
		{ value: 'mango', label: 'Mango' }
	];

	const timezoneGroups = [
		{
			label: 'North America',
			items: [
				{ value: 'est', label: 'Eastern Standard Time (EST)' },
				{ value: 'cst', label: 'Central Standard Time (CST)' },
				{ value: 'pst', label: 'Pacific Standard Time (PST)' }
			]
		},
		{
			label: 'Europe',
			items: [
				{ value: 'gmt', label: 'Greenwich Mean Time (GMT)' },
				{ value: 'cet', label: 'Central European Time (CET)' },
				{ value: 'eet', label: 'Eastern European Time (EET)' }
			]
		},
		{
			label: 'Asia',
			items: [
				{ value: 'ist', label: 'India Standard Time (IST)' },
				{ value: 'jst', label: 'Japan Standard Time (JST)' },
				{ value: 'cst-china', label: 'China Standard Time (CST)' }
			]
		}
	];
</script>

<Story name="Default">
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story name="With Groups">
	{#snippet template()}
		<div class="w-72">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Select timezone" />
				</Select.Trigger>
				<Select.Content>
					{#each timezoneGroups as group, index (group.label)}
						<Select.Group>
							<Select.Label>{group.label}</Select.Label>
							{#each group.items as item (item.value)}
								<Select.Item value={item.value} label={item.label} />
							{/each}
						</Select.Group>
						{#if index < timezoneGroups.length - 1}
							<Select.Separator />
						{/if}
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single" disabled>
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story name="With Placeholder">
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Choose your favorite fruit..." />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story
	name="Open and Select Item"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Click to open the select
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);

		// Wait for listbox to appear and find Banana option
		const listbox = await screen.findByRole('listbox');
		const options = screen.getAllByRole('option');
		const bananaOption = options.find((opt) => opt.textContent?.includes('Banana'));

		// Click the option
		if (bananaOption) await userEvent.click(bananaOption);

		// Verify listbox is closed (bits-ui keeps element with data-state="closed")
		await expect(listbox).toHaveAttribute('data-state', 'closed');
	}}
>
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story
	name="Keyboard Navigation"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Focus and open with keyboard (bits-ui v2 uses button with aria-haspopup)
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);

		// Wait for listbox to appear
		const listbox = await screen.findByRole('listbox');

		// Navigate with arrow keys
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{ArrowDown}');
		await userEvent.keyboard('{Enter}');

		// Select should close (bits-ui keeps element in DOM but changes data-state to closed)
		await expect(listbox).toHaveAttribute('data-state', 'closed');
	}}
>
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>

<Story
	name="Close on Escape"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Open the select (bits-ui v2 uses button with aria-haspopup)
		const trigger = canvas.getByRole('button');
		await userEvent.click(trigger);

		// Verify it's open (use screen for portaled content)
		const listbox = await screen.findByRole('listbox');
		await expect(listbox).toHaveAttribute('data-state', 'open');

		// Press escape to close
		await userEvent.keyboard('{Escape}');

		// Verify it's closed (bits-ui keeps element in DOM but changes data-state to closed)
		await expect(listbox).toHaveAttribute('data-state', 'closed');
	}}
>
	{#snippet template()}
		<div class="w-64">
			<Select.Root type="single">
				<Select.Trigger>
					<Select.Value placeholder="Select a fruit" />
				</Select.Trigger>
				<Select.Content>
					{#each fruitOptions as option (option.value)}
						<Select.Item value={option.value} label={option.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
</Story>
