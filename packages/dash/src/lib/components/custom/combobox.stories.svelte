<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, screen, userEvent, within } from '@storybook/test';
	import Combobox from './combobox.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Combobox',
		component: Combobox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onSelect: fn()
		},
		argTypes: {
			value: { control: 'text' },
			placeholder: { control: 'text' }
		}
	});

	const currencyOptions = [
		{ value: 'USD', label: 'USD - US Dollar' },
		{ value: 'EUR', label: 'EUR - Euro' },
		{ value: 'GBP', label: 'GBP - British Pound' },
		{ value: 'JPY', label: 'JPY - Japanese Yen' }
	];

	const countryOptions = [
		{ value: 'US', label: 'United States' },
		{ value: 'CA', label: 'Canada' },
		{ value: 'UK', label: 'United Kingdom' },
		{ value: 'DE', label: 'Germany' },
		{ value: 'FR', label: 'France' },
		{ value: 'JP', label: 'Japan' }
	];

	const platformOptions = [
		{ value: 'shopify', label: 'Shopify' },
		{ value: 'woocommerce', label: 'WooCommerce' },
		{ value: 'magento', label: 'Magento' },
		{ value: 'bigcommerce', label: 'BigCommerce' }
	];
</script>

{#snippet template(args)}
	<div class="w-64">
		<Combobox {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		options: currencyOptions,
		placeholder: 'Select currency...'
	}}
	{template}
/>

<Story
	name="With Selected Value"
	args={{
		options: currencyOptions,
		value: 'USD',
		placeholder: 'Select currency...'
	}}
	{template}
/>

<Story
	name="Country Selector"
	args={{
		options: countryOptions,
		placeholder: 'Select country...'
	}}
	{template}
/>

<Story
	name="Platform Selector"
	args={{
		options: platformOptions,
		value: 'shopify',
		placeholder: 'Select platform...'
	}}
	{template}
/>

<Story
	name="Empty Options"
	args={{
		options: [],
		placeholder: 'No options available'
	}}
	{template}
/>

<Story
	name="Open and Select Item"
	args={{
		options: currencyOptions,
		placeholder: 'Select currency...',
		onSelect: fn()
	}}
	{template}
	play={async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);

		// Click the combobox trigger to open
		const trigger = canvas.getByRole('combobox');
		await userEvent.click(trigger);

		// Wait for popover to open and select an item (use screen for portaled content)
		const euroOption = await screen.findByText('EUR - Euro');
		await userEvent.click(euroOption);

		// Verify onSelect was called with the selected value
		await expect(args.onSelect).toHaveBeenCalledWith('EUR');
	}}
/>

<Story
	name="Search and Filter"
	args={{
		options: countryOptions,
		placeholder: 'Select country...'
	}}
	{template}
/>

<Story
	name="Keyboard Navigation"
	args={{
		options: currencyOptions,
		placeholder: 'Select currency...'
	}}
	{template}
/>
