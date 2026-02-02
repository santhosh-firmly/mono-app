<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PublishPage from './publish-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/PublishPage',
		component: PublishPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loading: { control: 'boolean' },
			loadingExports: { control: 'boolean' },
			publishing: { control: 'boolean' },
			publishTarget: {
				control: 'select',
				options: ['elasticsearch', 'gcs', 'both']
			},
			gcsEnvironment: {
				control: 'select',
				options: ['wizard', 'production']
			},
			publishStatusFilter: {
				control: 'select',
				options: ['all', 'running', 'has_export', 'no_export']
			}
		}
	});

	const mockDomains = [
		{ domain: 'example.com', countryCode: 'US', total: 1500 },
		{ domain: 'shop.example.com', countryCode: 'GB', total: 2500 },
		{ domain: 'store.example.com', countryCode: 'DE', total: 800 },
		{ domain: 'buy.example.com', countryCode: 'FR', total: 1200 },
		{ domain: 'market.example.com', countryCode: 'ES', total: 950 }
	];

	const mockStats = {
		domains: mockDomains
	};

	const mockExportVersions = new Map([
		[
			'example.com/US',
			{
				versionId: 'abc123def456789',
				date: new Date().toISOString(),
				products: 1500
			}
		],
		[
			'shop.example.com/GB',
			{
				versionId: 'def456ghi789012',
				date: new Date(Date.now() - 86400000).toISOString(),
				products: 2500
			}
		],
		[
			'store.example.com/DE',
			{
				versionId: 'ghi789jkl012345',
				date: new Date(Date.now() - 172800000).toISOString(),
				products: 800
			}
		]
	]);

	const mockSelectedDomains = new Set(['example.com/US', 'shop.example.com/GB']);

	const mockPublishProgress = [
		{ domain: 'example.com', countryCode: 'US', status: 'running' },
		{ domain: 'shop.example.com', countryCode: 'GB', status: 'complete' },
		{ domain: 'store.example.com', countryCode: 'DE', status: 'pending' }
	];

	const mockActiveJobs = new Map([
		['example.com/US', { status: 'running', startedAt: new Date().toISOString() }]
	]);

	const noop = () => {};
</script>

{#snippet template(args)}
	<PublishPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		stats: mockStats,
		domains: mockDomains,
		exportVersions: mockExportVersions,
		selectedDomains: new Set(),
		publishProgress: [],
		activeJobs: new Map(),
		loading: false,
		loadingExports: false,
		publishing: false,
		error: null,
		publishTarget: 'elasticsearch',
		gcsEnvironment: 'wizard',
		publishStatusFilter: 'has_export',
		searchQuery: '',
		onRefresh: noop,
		onPublish: noop,
		onToggleDomain: noop,
		onToggleSelectAll: noop,
		onClearSelection: noop,
		onClearCompletedJobs: noop,
		onPublishTargetChange: noop,
		onGcsEnvironmentChange: noop,
		onPublishStatusFilterChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="With Progress"
	args={{
		stats: mockStats,
		domains: mockDomains,
		exportVersions: mockExportVersions,
		selectedDomains: mockSelectedDomains,
		publishProgress: mockPublishProgress,
		activeJobs: mockActiveJobs,
		loading: false,
		loadingExports: false,
		publishing: false,
		error: null,
		publishTarget: 'elasticsearch',
		gcsEnvironment: 'wizard',
		publishStatusFilter: 'has_export',
		searchQuery: '',
		onRefresh: noop,
		onPublish: noop,
		onToggleDomain: noop,
		onToggleSelectAll: noop,
		onClearSelection: noop,
		onClearCompletedJobs: noop,
		onPublishTargetChange: noop,
		onGcsEnvironmentChange: noop,
		onPublishStatusFilterChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		stats: null,
		domains: [],
		exportVersions: new Map(),
		selectedDomains: new Set(),
		publishProgress: [],
		activeJobs: new Map(),
		loading: true,
		loadingExports: false,
		publishing: false,
		error: null,
		publishTarget: 'elasticsearch',
		gcsEnvironment: 'wizard',
		publishStatusFilter: 'all',
		searchQuery: '',
		onRefresh: noop,
		onPublish: noop,
		onToggleDomain: noop,
		onToggleSelectAll: noop,
		onClearSelection: noop,
		onClearCompletedJobs: noop,
		onPublishTargetChange: noop,
		onGcsEnvironmentChange: noop,
		onPublishStatusFilterChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		stats: { domains: [] },
		domains: [],
		exportVersions: new Map(),
		selectedDomains: new Set(),
		publishProgress: [],
		activeJobs: new Map(),
		loading: false,
		loadingExports: false,
		publishing: false,
		error: null,
		publishTarget: 'elasticsearch',
		gcsEnvironment: 'wizard',
		publishStatusFilter: 'all',
		searchQuery: '',
		onRefresh: noop,
		onPublish: noop,
		onToggleDomain: noop,
		onToggleSelectAll: noop,
		onClearSelection: noop,
		onClearCompletedJobs: noop,
		onPublishTargetChange: noop,
		onGcsEnvironmentChange: noop,
		onPublishStatusFilterChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>
