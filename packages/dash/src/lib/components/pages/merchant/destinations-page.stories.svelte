<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationsPage from './destinations-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Merchant/Destinations',
		component: DestinationsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const mockDestinations = [
		{
			id: 'dest-001',
			name: 'Amazon',
			orders: 1245,
			aov: 89.99,
			disputeRate: 0.8,
			reputationScore: 4.7,
			isActive: true,
			isComingSoon: false,
			canToggle: true
		},
		{
			id: 'dest-002',
			name: 'eBay',
			orders: 856,
			aov: 67.5,
			disputeRate: 1.2,
			reputationScore: 4.5,
			isActive: true,
			isComingSoon: false,
			canToggle: true
		},
		{
			id: 'dest-003',
			name: 'Walmart',
			orders: 432,
			aov: 125.0,
			disputeRate: 0.5,
			reputationScore: 4.8,
			isActive: false,
			isComingSoon: false,
			canToggle: true
		},
		{
			id: 'dest-004',
			name: 'Target',
			orders: 0,
			aov: null,
			disputeRate: null,
			reputationScore: null,
			isActive: false,
			isComingSoon: true,
			canToggle: false
		},
		{
			id: 'dest-005',
			name: 'Shopify',
			orders: 2156,
			aov: 45.25,
			disputeRate: 2.1,
			reputationScore: 4.2,
			isActive: true,
			isComingSoon: false,
			canToggle: false
		}
	];

	const noop = () => {};
	const noopAsync = async () => {};
</script>

<Story name="Default">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={true}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="Loading">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={[]}
			loading={true}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={true}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={[]}
			loading={false}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={true}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="First Time Setup">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={false}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="With Changes">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={false}
			error=""
			successMessage=""
			hasExistingConfig={true}
			hasChanges={true}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="Saving">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={true}
			error=""
			successMessage=""
			hasExistingConfig={true}
			hasChanges={true}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="With Success Message">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={false}
			error=""
			successMessage="Destinations updated successfully!"
			hasExistingConfig={true}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="With Error">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={mockDestinations}
			loading={false}
			saving={false}
			error="Failed to save destinations. Please try again."
			successMessage=""
			hasExistingConfig={true}
			hasChanges={true}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>

<Story name="Error Loading">
	{#snippet template()}
		<DestinationsPage
			domain="example-store.com"
			destinations={[]}
			loading={false}
			saving={false}
			error="Failed to load destinations. Please refresh the page."
			successMessage=""
			hasExistingConfig={true}
			hasChanges={false}
			onToggle={noop}
			onSave={noopAsync}
		/>
	{/snippet}
</Story>
