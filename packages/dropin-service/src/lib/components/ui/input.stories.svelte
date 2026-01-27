<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiInput from '$lib/components/ui/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: UiInput,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			value: '',
			placeholder: 'Enter text...',
			errorMessage: '',
			onlyNumbers: false,
			disabled: false
		},
		argTypes: {
			value: {
				control: 'text',
				description: 'The value of the input'
			},
			placeholder: {
				control: 'text',
				description: 'Placeholder text'
			},
			errorMessage: {
				control: 'text',
				description: 'Error message to display'
			},
			onlyNumbers: {
				control: 'boolean',
				description: 'Whether the input accepts only numbers'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the input is disabled'
			}
		}
	});
</script>

<!-- Default Input -->
<Story name="Default" />

<!-- With Error Message -->
<Story
	name="With Error"
	args={{
		errorMessage: 'This field is required',
		value: ''
	}}
/>

<!-- Only Numbers -->
<Story
	name="Only Numbers"
	args={{
		onlyNumbers: true,
		placeholder: 'Enter numbers only...'
	}}
/>

<!-- Disabled State -->
<Story
	name="Disabled"
	args={{
		disabled: true,
		value: 'Disabled input'
	}}
/>
