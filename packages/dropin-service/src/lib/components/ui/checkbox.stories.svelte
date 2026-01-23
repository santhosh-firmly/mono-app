<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiCheckbox from '$lib/components/ui/checkbox.svelte';

	const { Story } = defineMeta({
		title: 'UI/Checkbox',
		component: UiCheckbox,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			isChecked: false,
			title: 'Checkbox Label',
			subtitle: '',
			disabled: false
		},
		argTypes: {
			isChecked: {
				control: 'boolean',
				description: 'Whether the checkbox is checked'
			},
			title: {
				control: 'text',
				description: 'The title of the checkbox'
			},
			subtitle: {
				control: 'text',
				description: 'The subtitle of the checkbox'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the checkbox is disabled'
			},
			onChange: {
				action: 'changed',
				description: 'Function called when checkbox state changes'
			}
		}
	});
</script>

<!-- Default Checkbox -->
<Story name="Default" />

<!-- Checked State -->
<Story
	name="Checked"
	args={{
		isChecked: true
	}}
/>

<!-- With Subtitle -->
<Story
	name="With Subtitle"
	args={{
		subtitle: 'Additional information about this option'
	}}
/>

<!-- Disabled State -->
<Story
	name="Disabled"
	args={{
		disabled: true
	}}
/>
