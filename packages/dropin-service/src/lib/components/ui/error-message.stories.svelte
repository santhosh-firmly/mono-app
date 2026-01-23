<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiErrorMessage from '$lib/components/ui/error-message.svelte';

	const { Story } = defineMeta({
		title: 'UI/Error Message',
		component: UiErrorMessage,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			message: 'An error occurred',
			type: 'error',
			onDismiss: null
		},
		argTypes: {
			message: {
				control: 'text',
				description: 'Error message to display'
			},
			type: {
				control: 'select',
				options: ['error', 'warning', 'info'],
				description: 'Message type'
			},
			onDismiss: {
				action: 'dismissed',
				description: 'Function called when dismiss button is clicked'
			}
		}
	});
</script>

<!-- Error Type -->
<Story
	name="Error"
	args={{
		message: 'Payment failed. Please try again.'
	}}
/>

<!-- Warning Type -->
<Story
	name="Warning"
	args={{
		type: 'warning',
		message: 'Your session will expire in 5 minutes.'
	}}
/>

<!-- Info Type -->
<Story
	name="Info"
	args={{
		type: 'info',
		message: 'Your payment is being processed.'
	}}
/>

<!-- With Dismiss Button -->
<Story
	name="Dismissible"
	args={{
		message: 'This message can be dismissed',
		onDismiss: () => {}
	}}
/>
