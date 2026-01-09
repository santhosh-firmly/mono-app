<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import PaymentInfoCard from './payment-info-card.svelte';

	const paymentSummary = orderData.order.order_info.payment_summary;

	const { Story } = defineMeta({
		title: 'Orders/Payment Info Card',
		component: PaymentInfoCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			cardType: paymentSummary.card_type,
			lastFour: paymentSummary.last_four,
			amount: paymentSummary.amount,
			title: 'Payment Information'
		},
		argTypes: {
			cardType: { control: 'text', description: 'Card type (Visa, Mastercard, etc.)' },
			lastFour: { control: 'text', description: 'Last 4 digits of card number' },
			amount: { control: 'number', description: 'Payment amount' },
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<PaymentInfoCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Mastercard"
	args={{
		cardType: 'Mastercard',
		lastFour: '5678',
		amount: 299.99
	}}
	{template}
/>

<Story
	name="American Express"
	args={{
		cardType: 'Amex',
		lastFour: '1001',
		amount: 450.0
	}}
	{template}
/>

<Story
	name="No Payment Info"
	args={{
		cardType: '',
		lastFour: '',
		amount: 0
	}}
	{template}
/>
