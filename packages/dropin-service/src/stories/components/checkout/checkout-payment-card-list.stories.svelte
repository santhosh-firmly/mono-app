<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import CheckoutPaymentCardList from '$lib/components/checkout/checkout-payment-card-list.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Payment/CC List',
		component: CheckoutPaymentCardList,
		parameters: {
			layout: 'centered'
		},
		args: {
			cards: [],
			disabled: false,
			onAddNewCard: fn(),
			onSelect: fn(),
			selectedCard: null
		}
	});

	const mockCards = [
		{
			id: 1,
			brand: 'Visa',
			first4: '4111',
			last4: '1111'
		},
		{
			id: 2,
			brand: 'Mastercard',
			first4: '5555',
			last4: '4444'
		},
		{
			id: 3,
			brand: 'American Express',
			first4: '3782',
			last4: '8224'
		}
	];
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<CheckoutPaymentCardList {...args} />
	</div>
{/snippet}

<Story name="Empty List" children={template} />

<Story
	name="With Cards"
	args={{
		cards: mockCards
	}}
	children={template}
/>

<Story
	name="With Selected Card"
	args={{
		cards: mockCards,
		selectedCard: mockCards[1]
	}}
	children={template}
/>

<Story
	name="Disabled"
	args={{
		cards: mockCards,
		selectedCard: mockCards[0],
		disabled: true
	}}
	children={template}
/>
