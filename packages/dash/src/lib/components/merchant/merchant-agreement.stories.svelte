<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantAgreement from './merchant-agreement.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Onboarding/Merchant Agreement',
		component: MerchantAgreement,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			domain: { control: 'text', description: 'Merchant domain' },
			isSigned: {
				control: 'boolean',
				description: 'Whether the agreement is already signed'
			},
			isSubmitting: { control: 'boolean', description: 'Whether signing is in progress' }
		}
	});
</script>

{#snippet template(args)}
	<MerchantAgreement {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		domain: 'acme-store.com'
	}}
	{template}
/>

<Story
	name="Already Signed"
	args={{
		domain: 'acme-store.com',
		isSigned: true,
		signedInfo: {
			signed_by_email: 'john@acme-store.com',
			signed_at: '2024-12-26T14:30:00Z',
			client_location: 'San Francisco, US'
		}
	}}
	{template}
/>

<Story
	name="Submitting"
	args={{
		domain: 'acme-store.com',
		isSubmitting: true
	}}
	{template}
/>
