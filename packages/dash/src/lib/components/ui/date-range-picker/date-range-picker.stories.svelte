<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { DateRangePicker } from './index.js';
	import { subDays, startOfMonth, endOfMonth } from 'date-fns';

	const { Story } = defineMeta({
		title: 'Components/UI/DateRangePicker',
		component: DateRangePicker,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const customPresets = [
		{
			label: 'Last 7 days',
			getValue: () => ({
				start: subDays(new Date(), 6),
				end: new Date()
			})
		},
		{
			label: 'Last 14 days',
			getValue: () => ({
				start: subDays(new Date(), 13),
				end: new Date()
			})
		},
		{
			label: 'This month',
			getValue: () => ({
				start: startOfMonth(new Date()),
				end: endOfMonth(new Date())
			})
		}
	];
</script>

{#snippet template(args)}
	<div class="p-8">
		<DateRangePicker {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="With Initial Value"
	args={{
		value: {
			start: subDays(new Date(), 7),
			end: new Date()
		}
	}}
	{template}
/>

<Story name="Without Presets" args={{ presets: [] }} {template} />

<Story name="With Time Granularity" args={{ granularity: 'minute' }} {template} />

<Story name="Custom Presets" args={{ presets: customPresets }} {template} />

<Story name="Disabled" args={{ disabled: true }} {template} />

<Story
	name="With Min/Max Dates"
	args={{
		minDate: subDays(new Date(), 30),
		maxDate: new Date()
	}}
	{template}
/>

<Story name="Custom Placeholder" args={{ placeholder: 'My custom placeholder' }} {template} />

<Story
	name="With Navigation"
	args={{
		value: { start: subDays(new Date(), 7), end: new Date() },
		showNavigation: true,
		maxDate: new Date()
	}}
	{template}
/>
