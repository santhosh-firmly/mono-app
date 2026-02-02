<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DomainTable from './domain-table.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/DomainTable',
		component: DomainTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			showSelection: { control: 'boolean' },
			showProgress: { control: 'boolean' }
		}
	});

	const mockDomains = [
		{
			domain: 'acme-store.com',
			countryCode: 'US',
			total: 15420,
			pending: 234,
			success: 14986,
			failed: 150,
			permanently_failed: 50,
			completion_percent: 97
		},
		{
			domain: 'widgets-inc.com',
			countryCode: 'US',
			total: 8750,
			pending: 0,
			success: 8700,
			failed: 30,
			permanently_failed: 20,
			completion_percent: 100
		},
		{
			domain: 'gadgets-world.com',
			countryCode: 'UK',
			total: 5230,
			pending: 1500,
			success: 3500,
			failed: 180,
			permanently_failed: 50,
			completion_percent: 67
		},
		{
			domain: 'tech-emporium.com',
			countryCode: 'US',
			total: 22100,
			pending: 5000,
			success: 16500,
			failed: 400,
			permanently_failed: 200,
			completion_percent: 75
		},
		{
			domain: 'fashion-hub.com',
			countryCode: 'DE',
			total: 12340,
			pending: 0,
			success: 12340,
			failed: 0,
			permanently_failed: 0,
			completion_percent: 100
		}
	];

	let selectedDomains = new Set(['acme-store.com/US', 'gadgets-world.com/UK']);
</script>

{#snippet template(args)}
	<DomainTable
		{...args}
		onSelect={(domain, cc) => alert(`Select: ${domain}/${cc}`)}
		onSelectAll={() => alert('Select all')}
	/>
{/snippet}

<Story name="Default" args={{ domains: mockDomains, showSelection: true }} {template} />

<Story
	name="With Selection"
	args={{ domains: mockDomains, selectedDomains, showSelection: true }}
	{template}
/>

<Story
	name="Without Selection"
	args={{ domains: mockDomains, showSelection: false }}
	{template}
/>

<Story
	name="Without Progress"
	args={{ domains: mockDomains, showSelection: true, showProgress: false }}
	{template}
/>

{#snippet sortableTemplate(args)}
	<DomainTable
		{...args}
		sortField="total"
		sortDirection="desc"
		onSort={(field) => alert(`Sort by: ${field}`)}
		onSelect={(domain, cc) => alert(`Select: ${domain}/${cc}`)}
		onSelectAll={() => alert('Select all')}
	/>
{/snippet}

<Story name="Sortable" args={{ domains: mockDomains, showSelection: true }} template={sortableTemplate} />

<Story name="Empty" args={{ domains: [], showSelection: true }} {template} />
