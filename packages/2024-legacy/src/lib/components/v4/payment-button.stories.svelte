<script>
	// @ts-nocheck
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import PaymentButton from './payment-button.svelte';
	import './theme.scss';
</script>

<Meta title="Checkout V4/Payment/Payment Button" component={PaymentButton} tags={['autodocs']} />

<Template let:args>
	<div class="adoreme-dark">
		<PaymentButton {...args} />
	</div>
</Template>

<Story
	name="Default"
	args={{
		total: {
			currency: 'USD',
			value: 133.33
		}
	}}
/>

<Story
	name="Disabled"
	args={{
		disabled: true,
		total: {
			currency: 'USD',
			value: 133.33
		}
	}}
/>

<Story
	name="Place Order in Progress"
	args={{
		inProgress: true,
		total: {
			currency: 'USD',
			value: 133.33
		}
	}}
/>

<Story
	name="Order placed"
	args={{
		isOrderPlaced: true,
		total: {
			currency: 'USD',
			value: 133.33
		}
	}}
/>

<Story
	name="Zero dollar order"
	args={{
		total: {
			currency: 'USD',
			value: 0
		}
	}}
/>

<Story name="No total" />
