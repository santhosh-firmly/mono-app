<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Autocomplete from '$lib/components/ui/ui-autocomplete.svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Components/UI/Autocomplete',
		component: Autocomplete,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			options: [
				{ id: 1, value: 'Apple' },
				{ id: 2, value: 'Banana' },
				{ id: 3, value: 'Orange' },
				{ id: 4, value: 'Pear' },
				{ id: 5, value: 'Grape' },
				{ id: 6, value: 'Pineapple' },
				{ id: 7, value: 'Strawberry' },
				{ id: 8, value: 'Watermelon' },
				{ id: 9, value: 'Kiwi' },
				{ id: 10, value: 'Mango' }
			],
			onSelect: fn(),
			value: 'apple'
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[300px]">
		<Autocomplete {...args}>
			{#snippet input({ handleInput, value })}
				<UiInput onInput={handleInput} {value} />
			{/snippet}
		</Autocomplete>
	</div>
{/snippet}

<Story name="Basic" children={template} />
