<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Quantity from '$lib/components/ui/quantity.svelte';

	const { Story } = defineMeta({
		title: 'UI/Quantity',
		component: Quantity,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			quantity: 1,
			disabled: false,
			delay: 300
		},
		argTypes: {
			quantity: {
				control: 'number',
				description: 'Current quantity value'
			},
			onChange: {
				action: 'changed',
				description: 'Function called when quantity changes'
			},
			disabled: {
				control: 'boolean',
				description: 'Whether the selector is disabled'
			},
			delay: {
				control: 'number',
				description: 'Delay before onChange is called (ms)'
			}
		}
	});
</script>

<!-- Default Selector -->
<Story name="Default" />

<!-- Increase Quantity -->
<Story
	name="Increase Quantity"
	args={{
		quantity: 3
	}}
/>

<!-- At Minimum (Shows Trash Icon) -->
<Story name="At Minimum" />

<!-- Disabled State -->
<Story
	name="Disabled"
	args={{
		disabled: true,
		quantity: 2
	}}
/>
