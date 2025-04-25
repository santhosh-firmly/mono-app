<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiAlert from '$lib/components/ui/ui-alert.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/Alert',
		component: UiAlert,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			children: 'This is a basic alert message'
		}
	});
</script>

<Story name="Basic">
	<UiAlert>This is a basic alert message</UiAlert>
</Story>

<Story name="With Bold Text">
	<UiAlert>
		<b>Alert with bold text</b>
	</UiAlert>
</Story>

<Story name="Long Message">
	<UiAlert>
		This is a longer alert message that might wrap to multiple lines. It contains more text to
		demonstrate how the alert component handles longer content.
	</UiAlert>
</Story>

<Story name="With HTML Content">
	<UiAlert>
		Please note: <b>Important information</b> that requires attention.
		<b>Multiple bold sections</b>
		can be included.
	</UiAlert>
</Story>
