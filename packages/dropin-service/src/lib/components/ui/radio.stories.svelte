<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import UiRadio from '$lib/components/ui/radio.svelte';

	const { Story } = defineMeta({
		title: 'UI/Radio',
		component: UiRadio,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			id: 'radio-option',
			name: 'radio-group',
			isSelected: false,
			disabled: false,
			onSelect: fn()
		},
		argTypes: {
			id: {
				control: 'text',
				description: 'The id of the radio button'
			},
			name: {
				control: 'text',
				description: 'The name of the radio group'
			},
			isSelected: {
				control: 'boolean',
				description: 'Whether the radio is selected'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the radio is disabled'
			},
			onSelect: {
				action: 'selected',
				description: 'Function called when radio is selected'
			}
		}
	});
</script>

<!-- Default Radio -->
<Story name="Default">Radio Option</Story>

<!-- Selected State -->
<Story
	name="Selected"
	args={{
		isSelected: true
	}}
>
	Selected Option
</Story>

<!-- Disabled State -->
<Story
	name="Disabled"
	args={{
		disabled: true
	}}
>
	Disabled Option
</Story>

<!-- Radio Group Example -->
<Story name="Radio Group">
	<div class="flex flex-col gap-3">
		<UiRadio id="option-1" name="demo-group" isSelected={false} onSelect={fn()}>
			Option 1
		</UiRadio>
		<UiRadio id="option-2" name="demo-group" isSelected={false} onSelect={fn()}>
			Option 2
		</UiRadio>
		<UiRadio id="option-3" name="demo-group" isSelected={false} onSelect={fn()}>
			Option 3
		</UiRadio>
	</div>
</Story>
