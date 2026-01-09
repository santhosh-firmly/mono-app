<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdvancedSettings from './advanced-settings.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Advanced Settings',
		component: AdvancedSettings,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockMerchant = {
		display_name: 'Example Store',
		store_id: 'example-store',
		base_url: 'https://www.example.com',
		url_name: ['example.com'],
		shop_currency: 'USD',
		platform_id: 'shopify',
		psp: 'stripe',
		is_disabled: false,
		presentation: {
			theme: {
				colors: {
					primary: '#ffffff',
					action: '#000000'
				}
			}
		}
	};
</script>

{#snippet template(args)}
	<AdvancedSettings {...args} />
{/snippet}

<Story name="Default" args={{ merchant: mockMerchant }} {template} />

<Story
	name="Complex Configuration"
	args={{
		merchant: {
			...mockMerchant,
			customSettings: {
				featureFlags: {
					newCheckout: true,
					expressPayment: false
				},
				integrations: {
					analytics: 'ga4',
					crm: 'salesforce'
				}
			}
		}
	}}
	{template}
/>
