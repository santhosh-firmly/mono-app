<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LegalDocumentsCard from './legal-documents-card.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Legal Documents Card',
		component: LegalDocumentsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			privacyPolicy: { control: 'text' },
			termsOfUse: { control: 'text' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<script>
	let privacyPolicy = $state('https://acme.com/privacy');
	let termsOfUse = $state('https://acme.com/terms');

	let emptyPrivacyPolicy = $state('');
	let emptyTermsOfUse = $state('');

	let disabledPrivacyPolicy = $state('https://readonly.com/privacy');
	let disabledTermsOfUse = $state('https://readonly.com/terms');
</script>

<Story name="Default">
	{#snippet template()}
		<LegalDocumentsCard bind:privacyPolicy bind:termsOfUse disabled={false} />
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<LegalDocumentsCard
			bind:privacyPolicy={emptyPrivacyPolicy}
			bind:termsOfUse={emptyTermsOfUse}
			disabled={false}
		/>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<LegalDocumentsCard
			bind:privacyPolicy={disabledPrivacyPolicy}
			bind:termsOfUse={disabledTermsOfUse}
			disabled={true}
		/>
	{/snippet}
</Story>
