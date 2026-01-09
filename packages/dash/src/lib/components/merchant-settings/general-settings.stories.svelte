<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GeneralSettings from './general-settings.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/General Settings',
		component: GeneralSettings,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockMerchant = {
		display_name: 'Example Store',
		store_id: 'example-store',
		base_url: 'https://www.example.com',
		url_name: ['example.com', 'www.example.com'],
		shop_currency: 'USD',
		platform_id: 'shopify',
		psp: 'stripe',
		is_disabled: false
	};

	const currencyOptions = [{ value: 'USD', label: 'USD - US Dollar' }];

	const platformOptions = [
		{ value: 'shopify', label: 'Shopify' },
		{ value: 'woocommerce', label: 'WooCommerce' },
		{ value: 'magento', label: 'Magento' }
	];

	const pspOptions = [
		{ value: 'stripe', label: 'Stripe' },
		{ value: 'braintree', label: 'Braintree' },
		{ value: 'adyen', label: 'Adyen' }
	];

	const noop = () => {};
</script>

{#snippet template(args)}
	<GeneralSettings {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		merchant: mockMerchant,
		currencyOptions,
		platformOptions,
		pspOptions,
		updateField: noop,
		addUrlName: noop,
		removeUrlName: noop,
		updateUrlName: noop
	}}
	{template}
/>

<Story
	name="Disabled Merchant"
	args={{
		merchant: { ...mockMerchant, is_disabled: true },
		currencyOptions,
		platformOptions,
		pspOptions,
		updateField: noop,
		addUrlName: noop,
		removeUrlName: noop,
		updateUrlName: noop
	}}
	{template}
/>

<Story
	name="No URLs"
	args={{
		merchant: { ...mockMerchant, url_name: [] },
		currencyOptions,
		platformOptions,
		pspOptions,
		updateField: noop,
		addUrlName: noop,
		removeUrlName: noop,
		updateUrlName: noop
	}}
	{template}
/>
