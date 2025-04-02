<script>
	// @ts-nocheck
	import Footer from './footer.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
</script>

<Meta title="Checkout V4/Checkout/Footer" component={Footer} tags={['autodocs']} />

<Template let:args>
	<Footer {...args} />
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
	name="Zero dollar order"
	args={{
		total: {
			currency: 'USD',
			value: 0
		}
	}}
/>

<Story
	name="Terms and Privacy Policy notice"
	args={{
		termsOfUse: 'termsOfUse',
		privacyPolicy: 'privacyPolicy',
		total: {
			currency: 'USD',
			value: 0
		}
	}}
/>
