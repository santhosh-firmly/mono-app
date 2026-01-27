<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MigrationPage from './migration-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/MigrationPage',
		component: MigrationPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock data
	const mockStatsMixed = [
		{
			domain: 'acme-store.com',
			status: 'pending',
			v2Count: 5420,
			v3Count: 10000,
			error: null
		},
		{
			domain: 'widgets-inc.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 8750,
			error: null
		},
		{
			domain: 'gadgets-world.com',
			status: 'partial',
			v2Count: 2230,
			v3Count: 3000,
			error: null
		},
		{
			domain: 'tech-emporium.com',
			status: 'error',
			v2Count: 8100,
			v3Count: 14000,
			error: 'Connection timeout during migration'
		},
		{
			domain: 'fashion-hub.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 12340,
			error: null
		}
	];

	const mockStatsWithErrors = [
		{
			domain: 'acme-store.com',
			status: 'error',
			v2Count: 5420,
			v3Count: 10000,
			error: 'Database connection failed'
		},
		{
			domain: 'widgets-inc.com',
			status: 'error',
			v2Count: 3500,
			v3Count: 5250,
			error: 'Rate limit exceeded'
		},
		{
			domain: 'gadgets-world.com',
			status: 'error',
			v2Count: 2230,
			v3Count: 3000,
			error: 'Invalid data format detected'
		}
	];

	const mockStatsAllComplete = [
		{
			domain: 'acme-store.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 15420,
			error: null
		},
		{
			domain: 'widgets-inc.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 8750,
			error: null
		},
		{
			domain: 'gadgets-world.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 5230,
			error: null
		},
		{
			domain: 'tech-emporium.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 22100,
			error: null
		},
		{
			domain: 'fashion-hub.com',
			status: 'migrated',
			v2Count: 0,
			v3Count: 12340,
			error: null
		}
	];

	const defaultArgs = {
		stats: mockStatsMixed,
		loading: false,
		error: null,
		onRefresh: () => console.log('Refresh clicked'),
		onMigrateDomain: async (domain, dryRun) => {
			console.log('Migrating domain:', domain, 'Dry run:', dryRun);
			await new Promise((r) => setTimeout(r, 1000));
			return {
				domain,
				version: 'v3',
				dryRun,
				migrated: 1250,
				skipped: 50,
				errors: 3,
				results: [
					{ pdpUrl: 'https://example.com/product-1', status: 'migrated' },
					{ pdpUrl: 'https://example.com/product-2', status: 'migrated' },
					{ pdpUrl: 'https://example.com/product-3', status: 'skipped' },
					{ pdpUrl: 'https://example.com/product-4', status: 'error' }
				]
			};
		},
		onMigrateAll: async (pendingItems) => {
			console.log('Migrating all pending:', pendingItems);
			await new Promise((r) => setTimeout(r, 2000));
		},
		onDismissError: () => console.log('Error dismissed')
	};
</script>

{#snippet template(args)}
	<MigrationPage {...args} />
{/snippet}

<Story name="Default" args={defaultArgs} {template} />

<Story
	name="With Errors"
	args={{
		...defaultArgs,
		stats: mockStatsWithErrors
	}}
	{template}
/>

<Story
	name="All Complete"
	args={{
		...defaultArgs,
		stats: mockStatsAllComplete
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		...defaultArgs,
		loading: true
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		...defaultArgs,
		stats: []
	}}
	{template}
/>

<Story
	name="With API Error"
	args={{
		...defaultArgs,
		error: 'Failed to load migration stats. Please try again.'
	}}
	{template}
/>
