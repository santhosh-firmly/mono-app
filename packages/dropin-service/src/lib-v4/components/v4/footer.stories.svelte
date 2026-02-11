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
	name="USA Today - Expandable Terms"
	args={{
		terms: {
			partnerName: 'USA Today',
			merchantName: 'Allbirds',
			hasPartnerTerms: true,
			anchors: [
				{ label: 'USA Today Terms of Service', url: 'https://www.usatoday.com/terms' },
				{
					label: 'USA Today Privacy Policy',
					url: 'https://www.usatoday.com/privacy-policy'
				},
				{
					label: 'Allbirds Terms of Service',
					url: 'https://www.allbirds.com/pages/terms-of-use'
				},
				{
					label: 'Allbirds Privacy Policy',
					url: 'https://www.allbirds.com/pages/privacy-policy'
				}
			]
		},
		total: {
			currency: 'USD',
			value: 133.33
		}
	}}
/>

<Story
	name="Merchant Only - Expandable Terms"
	args={{
		terms: {
			partnerName: '',
			merchantName: 'Allbirds',
			hasPartnerTerms: false,
			anchors: [
				{
					label: 'Allbirds Terms of Service',
					url: 'https://www.allbirds.com/pages/terms-of-use'
				},
				{
					label: 'Allbirds Privacy Policy',
					url: 'https://www.allbirds.com/pages/privacy-policy'
				}
			]
		},
		total: {
			currency: 'USD',
			value: 98.50
		}
	}}
/>
