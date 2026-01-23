<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ShippingEmailMessage from './shipping-email-message.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Shipping/Email/Message',
		component: ShippingEmailMessage,
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80 p-4">
		<ShippingEmailMessage {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />
