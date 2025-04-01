<script>
	// @ts-nocheck
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import QuantityController from './quantity-controller.svelte';
	import './theme.css';
</script>

<Meta
	title="Checkout V4/Header/Quantity Controller"
	component={QuantityController}
	tags={['autodocs']}
/>

<Template let:args>
	<div class="adoreme-dark">
		<QuantityController {...args} />
	</div>
</Template>

<Story
	name="Default"
	args={{
		quantity: 2
	}}
/>

<Story
	name="Disabled"
	args={{
		quantity: 4,
		disabled: true
	}}
/>
