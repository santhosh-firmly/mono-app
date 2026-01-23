<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import PaymentCardList from './payment-card-list.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Payment/Card List',
		component: PaymentCardList,
		parameters: {
			layout: 'centered'
		},
		args: {
			cards: [],
			disabled: false,
			onAddNewCard: fn(),
			onSelect: fn(),
			onNotYourCards: fn(),
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

	const mockC2PCards = [
		{
			id: 1,
			brand: 'Visa',
			first4: '4111',
			last4: '1111',
			wallet: 'c2p',
			art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/42d31eae-9961-45b6-9fe3-76ad70a0a525.png'
		},
		{
			id: 2,
			brand: 'Mastercard',
			first4: '5555',
			last4: '4444',
			wallet: 'c2p',
			art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/6713d73d-a701-4bd2-bc9b-2e98940de9c7.png'
		},
		{
			id: 3,
			brand: 'Mastercard',
			first4: '5186',
			last4: '8785',
			wallet: 'c2p',
			art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/HIGH-MASK-3x.png'
		}
	];
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<PaymentCardList {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		cards: mockCards,
		selectedCard: mockCards[0]
	}}
	{template}
/>

<Story
	name="Disabled"
	args={{
		cards: mockCards,
		selectedCard: mockCards[0],
		disabled: true
	}}
	{template}
/>

<Story
	name="Click To Pay Cards"
	args={{
		cards: mockC2PCards,
		selectedCard: mockC2PCards[0]
	}}
	{template}
/>
