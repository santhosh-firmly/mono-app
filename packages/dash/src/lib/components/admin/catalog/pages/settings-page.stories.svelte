<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SettingsPage from './settings-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/SettingsPage',
		component: SettingsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loading: { control: 'boolean' },
			showConfigModal: { control: 'boolean' },
			loadingConfig: { control: 'boolean' },
			savingDomain: { control: 'boolean' },
			showDeleteModal: { control: 'boolean' },
			deletingDomain: { control: 'boolean' },
			sortBy: {
				control: 'select',
				options: [
					'domain_asc',
					'domain_desc',
					'total_desc',
					'total_asc',
					'completion_desc',
					'completion_asc'
				]
			}
		}
	});

	const mockDomains = [
		{
			domain: 'example.com',
			countryCode: 'US',
			total: 1500,
			success: 1200,
			pending: 200,
			failed: 80,
			permanently_failed: 20,
			completion_percent: 80
		},
		{
			domain: 'shop.example.com',
			countryCode: 'GB',
			total: 2500,
			success: 2400,
			pending: 50,
			failed: 40,
			permanently_failed: 10,
			completion_percent: 96
		},
		{
			domain: 'store.example.com',
			countryCode: 'DE',
			total: 800,
			success: 600,
			pending: 150,
			failed: 40,
			permanently_failed: 10,
			completion_percent: 75
		},
		{
			domain: 'buy.example.com',
			countryCode: 'FR',
			total: 1200,
			success: 500,
			pending: 600,
			failed: 80,
			permanently_failed: 20,
			completion_percent: 42
		}
	];

	const mockStats = {
		total_domains: 4,
		aggregate: {
			total_products: 6000,
			completion_percent: 78
		},
		domains: mockDomains
	};

	const mockConfigs = new Map([
		[
			'example.com/US',
			{
				enabled: true,
				batch_size: 5,
				delay_between_batches_ms: 4000,
				freshness_threshold_hours: 48,
				max_retries: 3,
				retry_delay_ms: 1000
			}
		]
	]);

	const mockDomainConfig = {
		enabled: true,
		batch_size: 5,
		delay_between_batches_ms: 4000,
		freshness_threshold_hours: 48,
		max_retries: 3,
		retry_delay_ms: 1000
	};

	const noop = () => {};
</script>

{#snippet template(args)}
	<SettingsPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		stats: mockStats,
		domains: mockDomains,
		configs: mockConfigs,
		loading: false,
		error: null,
		showConfigModal: false,
		selectedDomain: null,
		domainConfig: null,
		loadingConfig: false,
		savingDomain: false,
		showDeleteModal: false,
		domainToDelete: null,
		deletingDomain: false,
		searchQuery: '',
		sortBy: 'domain_asc',
		onRefresh: noop,
		onOpenConfig: noop,
		onSaveConfig: noop,
		onCloseConfigModal: noop,
		onTriggerSync: noop,
		onOpenDeleteModal: noop,
		onDeleteDomain: noop,
		onCloseDeleteModal: noop,
		onSearchQueryChange: noop,
		onSortByChange: noop,
		onDismissError: noop,
		onConfigChange: noop
	}}
	{template}
/>

<Story
	name="With Modal Open"
	args={{
		stats: mockStats,
		domains: mockDomains,
		configs: mockConfigs,
		loading: false,
		error: null,
		showConfigModal: true,
		selectedDomain: mockDomains[0],
		domainConfig: mockDomainConfig,
		loadingConfig: false,
		savingDomain: false,
		showDeleteModal: false,
		domainToDelete: null,
		deletingDomain: false,
		searchQuery: '',
		sortBy: 'domain_asc',
		onRefresh: noop,
		onOpenConfig: noop,
		onSaveConfig: noop,
		onCloseConfigModal: noop,
		onTriggerSync: noop,
		onOpenDeleteModal: noop,
		onDeleteDomain: noop,
		onCloseDeleteModal: noop,
		onSearchQueryChange: noop,
		onSortByChange: noop,
		onDismissError: noop,
		onConfigChange: noop
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		stats: {
			total_domains: 0,
			aggregate: {
				total_products: 0,
				completion_percent: 0
			},
			domains: []
		},
		domains: [],
		configs: new Map(),
		loading: false,
		error: null,
		showConfigModal: false,
		selectedDomain: null,
		domainConfig: null,
		loadingConfig: false,
		savingDomain: false,
		showDeleteModal: false,
		domainToDelete: null,
		deletingDomain: false,
		searchQuery: '',
		sortBy: 'domain_asc',
		onRefresh: noop,
		onOpenConfig: noop,
		onSaveConfig: noop,
		onCloseConfigModal: noop,
		onTriggerSync: noop,
		onOpenDeleteModal: noop,
		onDeleteDomain: noop,
		onCloseDeleteModal: noop,
		onSearchQueryChange: noop,
		onSortByChange: noop,
		onDismissError: noop,
		onConfigChange: noop
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		stats: null,
		domains: [],
		configs: new Map(),
		loading: true,
		error: null,
		showConfigModal: false,
		selectedDomain: null,
		domainConfig: null,
		loadingConfig: false,
		savingDomain: false,
		showDeleteModal: false,
		domainToDelete: null,
		deletingDomain: false,
		searchQuery: '',
		sortBy: 'domain_asc',
		onRefresh: noop,
		onOpenConfig: noop,
		onSaveConfig: noop,
		onCloseConfigModal: noop,
		onTriggerSync: noop,
		onOpenDeleteModal: noop,
		onDeleteDomain: noop,
		onCloseDeleteModal: noop,
		onSearchQueryChange: noop,
		onSortByChange: noop,
		onDismissError: noop,
		onConfigChange: noop
	}}
	{template}
/>
