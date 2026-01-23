<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiSmallButton from '$lib/components/ui/small-button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Small Button',
		component: UiSmallButton,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			onclick: {
				action: 'clicked',
				description: 'Click event handler'
			}
		}
	});
</script>

<!-- Default -->
<Story name="Default">Button Text</Story>

<!-- Short Text -->
<Story name="Short Text">OK</Story>

<!-- Longer Text -->
<Story name="Longer Text">Apply Discount</Story>
