<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import PaymentCollapsed from './payment-collapsed.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Payment/Collapsed',
		component: PaymentCollapsed,
		parameters: {
			layout: 'centered'
		},
		args: {
			onchange: fn(),
			disabled: false
		}
	});

	const mockRegularCard = {
		brand: 'Mastercard',
		first4: '5555',
		last4: '5726'
	};

	const mockC2PCard = {
		brand: 'Mastercard',
		first4: '5555',
		last4: '5726',
		wallet: 'c2p',
		art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/6713d73d-a701-4bd2-bc9b-2e98940de9c7.png'
	};

	const mockVisaC2PCard = {
		brand: 'Visa',
		first4: '4111',
		last4: '1234',
		wallet: 'c2p',
		art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/42d31eae-9961-45b6-9fe3-76ad70a0a525.png'
	};
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<PaymentCollapsed {...args} />
	</div>
{/snippet}

<Story
	name="Regular Card"
	args={{
		card: mockRegularCard
	}}
	{template}
/>

<Story
	name="Click To Pay Card"
	args={{
		card: mockC2PCard
	}}
	{template}
/>

<Story
	name="Click To Pay Visa"
	args={{
		card: mockVisaC2PCard
	}}
	{template}
/>

<Story
	name="Disabled"
	args={{
		card: mockRegularCard,
		disabled: true
	}}
	{template}
/>
