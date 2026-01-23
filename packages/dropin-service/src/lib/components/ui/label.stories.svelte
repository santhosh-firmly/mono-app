<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiLabel from '$lib/components/ui/label.svelte';
	import UiInput from '$lib/components/ui/input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Label',
		component: UiLabel,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			label: 'Input Label',
			errorMessage: ''
		},
		argTypes: {
			label: {
				control: 'text',
				description: 'The label text'
			},
			errorMessage: {
				control: 'text',
				description: 'Error message to display'
			}
		}
	});
</script>

<!-- Default Label -->
<Story name="Default">
	<UiInput placeholder="Enter value..." />
</Story>

<!-- With Error Message -->
<Story
	name="With Error"
	args={{
		errorMessage: 'This field is required'
	}}
>
	<UiInput placeholder="Enter value..." errorMessage="This field is required" />
</Story>
