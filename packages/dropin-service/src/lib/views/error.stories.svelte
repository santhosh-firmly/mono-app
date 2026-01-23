<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ErrorView from '$lib/views/error.svelte';

	const LIQUID_IV_COLORS = {
		primary: '#ffffff',
		action: '#35cad0'
	};

	const { Story } = defineMeta({
		title: 'Views/Error',
		component: ErrorView,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			onClose: fn(),
			colors: LIQUID_IV_COLORS
		}
	});
</script>

{#snippet template(args)}
	<div class="h-screen">
		<ErrorView {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		title: 'Payment Failed',
		message:
			'We were unable to process your payment. Please check your card details and try again.',
		errorCode: 'PAY_001'
	}}
	{template}
/>

<Story
	name="With Retry"
	args={{
		title: 'Connection Error',
		message: 'Unable to connect to the server. Please check your internet connection.',
		onRetry: fn()
	}}
	{template}
/>
