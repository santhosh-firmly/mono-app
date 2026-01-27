<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiAutocomplete from '$lib/components/ui/autocomplete.svelte';
	import UiInput from '$lib/components/ui/input.svelte';

	const mockOptions = [
		{ id: '1', value: 'New York' },
		{ id: '2', value: 'Los Angeles' },
		{ id: '3', value: 'Chicago' },
		{ id: '4', value: 'Houston' },
		{ id: '5', value: 'Phoenix' }
	];

	const { Story } = defineMeta({
		title: 'UI/Autocomplete',
		component: UiAutocomplete,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			options: mockOptions,
			value: ''
		},
		argTypes: {
			options: {
				control: 'object',
				description: 'Array of options to display'
			},
			onSelect: {
				action: 'selected',
				description: 'Function called when an option is selected'
			},
			value: {
				control: 'text',
				description: 'Current input value'
			}
		}
	});
</script>

<!-- Default Autocomplete -->
<Story
	name="Default"
	args={{
		value: 'New'
	}}
>
	{#snippet input({ value, handleInput })}
		<UiInput {value} onInput={handleInput} placeholder="Type to search..." />
	{/snippet}
</Story>

<!-- With Keyboard Navigation -->
<Story
	name="Keyboard Navigation"
	args={{
		value: 'Chi'
	}}
>
	{#snippet input({ value, handleInput })}
		<UiInput {value} onInput={handleInput} placeholder="Type to search..." />
	{/snippet}
</Story>

<!-- No Results -->
<Story
	name="No Results"
	args={{
		value: 'xyz',
		options: []
	}}
>
	{#snippet input({ value, handleInput })}
		<UiInput {value} onInput={handleInput} placeholder="Type to search..." />
	{/snippet}
</Story>
