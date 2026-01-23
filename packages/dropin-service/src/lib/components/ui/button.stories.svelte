<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiButton from '$lib/components/ui/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: UiButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			color: {
				control: 'color',
				description: 'Custom primary color value (CSS color)'
			},
			class: {
				control: 'text',
				description: 'Additional CSS classes to apply'
			},
			disabled: {
				control: 'boolean',
				description: 'Disabled state of the button'
			},
			onclick: {
				action: 'clicked',
				description: 'Click event handler'
			}
		}
	});
</script>

<!-- Default Button -->
<Story name="Default">Button Text</Story>

<!-- Custom Color -->
<Story
	name="Custom Color"
	args={{
		color: '#22C55E'
	}}
>
	Green Button
</Story>

<!-- Disabled State -->
<Story
	name="Disabled"
	args={{
		disabled: true
	}}
>
	Disabled Button
</Story>
