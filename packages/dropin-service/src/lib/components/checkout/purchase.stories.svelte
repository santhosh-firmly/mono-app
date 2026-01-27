<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import Purchase from './purchase.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Purchase',
		component: Purchase,
		parameters: {
			layout: 'centered'
		},
		args: {
			totalPrice: 99.99,
			disabled: false,
			loading: false,
			success: false,
			error: '',
			onSubmit: fn()
		},
		argTypes: {
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80">
		<Purchase {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Disabled"
	args={{
		disabled: true
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		loading: true
	}}
	{template}
/>

<Story
	name="Success"
	args={{
		success: true
	}}
	{template}
/>

<Story
	name="High Price"
	args={{
		totalPrice: 1299.99
	}}
	{template}
/>

<Story
	name="Zero Price"
	args={{
		totalPrice: 0
	}}
	{template}
/>

<Story
	name="Custom Text"
	args={{
		buttonText: 'Complete Purchase'
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		error: 'Credit card declined'
	}}
	{template}
/>

<Story
	name="With Long Error"
	args={{
		error: 'The payment could not be processed. Please check your card details and try again.'
	}}
	{template}
/>
