<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiSpinner from '$lib/components/ui/spinner.svelte';

	const { Story } = defineMeta({
		title: 'UI/Spinner',
		component: UiSpinner,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			width: 16,
			height: 16
		},
		argTypes: {
			width: {
				control: 'number',
				description: 'Width of the spinner'
			},
			height: {
				control: 'number',
				description: 'Height of the spinner'
			}
		}
	});
</script>

<!-- Default Spinner -->
<Story name="Default" />

<!-- Large Spinner -->
<Story
	name="Large"
	args={{
		width: 32,
		height: 32
	}}
/>

<!-- Custom Color -->
<Story
	name="Custom Color"
	args={{
		class: 'text-blue-500'
	}}
/>
