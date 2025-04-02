<script>
	import ExistingCreditCard from './existing-credit-card.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Meta
	title="Checkout V4/Payment/Existing Credit Card"
	component={ExistingCreditCard}
	tags={['autodocs']}
/>

<Template let:args>
	<ExistingCreditCard {...args} />
</Template>

<Story
	name="Visa credit card"
	args={{
		number: '4111111111111111'
	}}
/>

<Story
	name="MasterCard credit card"
	args={{
		number: '5105105105105100'
	}}
/>

<Story
	name="American Express credit card"
	args={{
		number: '378282246310005'
	}}
/>

<Story
	name="Valid Visa credit card with bank issuer"
	args={{
		number: '4111111111111111',
		issuer: 'Chase Freedom Flex'
	}}
/>

<Story
	name="Unkown card brand"
	args={{
		number: '6331101999990016'
	}}
/>

<Story
	name="Loading state"
	args={{
		showSkeleton: true
	}}
/>
