<script>
	// @ts-nocheck
	import Footer from './footer.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
</script>

<Meta title="Checkout V4/Checkout/Footer" component={Footer} tags={['autodocs']} />

<Template let:args>
	<Footer {...args} onclick={() => console.log('Footer clicked')} />
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

<Story
	name="Partner Disclaimer (Gannett/USA Today)"
	args={{
		partnerDisclaimer: {
			text: 'By tapping "Buy Now", you agree that we can share information about you and your purchase transaction with our commerce partners to facilitate payment and with the merchant to fulfill the order. By completing this transaction you agree to our Terms of Service, Privacy Policy, and FTC compliance policy.',
			links: {
				termsOfService: 'https://cm.usatoday.com/terms/',
				privacyPolicy: 'https://cm.usatoday.com/privacy'
			}
		},
		total: {
			currency: 'USD',
			value: 49.99
		}
	}}
/>
