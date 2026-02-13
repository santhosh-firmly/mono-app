<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CategoriesPage from './categories-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/CategoriesPage',
		component: CategoriesPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock categories data matching the expected structure
	const mockCategories = {
		totalDomains: 5,
		totalProducts: 63840,
		categories: [
			{
				category: 'Electronics',
				totalCount: 18500,
				byDomain: {
					'acme-store.com': 5200,
					'tech-emporium.com': 8100,
					'gadgets-world.com': 3400,
					'widgets-inc.com': 1800
				},
				rawTypes: [
					'Tech',
					'Gadgets',
					'Devices',
					'Accessories',
					'Audio',
					'Cameras',
					'Computers',
					'Phones',
					'Tablets',
					'Wearables',
					'Smart Home'
				]
			},
			{
				category: 'Apparel',
				totalCount: 14200,
				byDomain: {
					'fashion-hub.com': 9800,
					'acme-store.com': 2400,
					'widgets-inc.com': 2000
				},
				rawTypes: ['Clothing', 'Fashion', 'Wear', 'Shirts', 'Pants', 'Dresses']
			},
			{
				category: 'Home & Garden',
				totalCount: 12400,
				byDomain: {
					'acme-store.com': 4800,
					'widgets-inc.com': 3200,
					'tech-emporium.com': 4400
				},
				rawTypes: ['Home', 'Garden', 'Decor', 'Furniture', 'Kitchen']
			},
			{
				category: 'Sports & Outdoors',
				totalCount: 9800,
				byDomain: {
					'acme-store.com': 3000,
					'widgets-inc.com': 2800,
					'gadgets-world.com': 4000
				},
				rawTypes: ['Sports', 'Outdoor', 'Fitness', 'Camping', 'Hiking']
			},
			{
				category: 'Footwear',
				totalCount: 5200,
				byDomain: {
					'fashion-hub.com': 2540,
					'acme-store.com': 1800,
					'widgets-inc.com': 860
				},
				rawTypes: ['Shoes', 'Boots', 'Sneakers', 'Sandals']
			},
			{
				category: 'Uncategorized',
				totalCount: 3740,
				byDomain: {
					'acme-store.com': 1220,
					'gadgets-world.com': 830,
					'tech-emporium.com': 1690
				},
				rawTypes: []
			}
		]
	};

	// Empty categories
	const emptyCategories = {
		totalDomains: 0,
		totalProducts: 0,
		categories: []
	};
</script>

{#snippet template(args)}
	<CategoriesPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		categories: mockCategories,
		loading: false,
		error: null
	}}
	{template}
/>

{#snippet withExpandedTemplate(args)}
	<CategoriesPage {...args} />
{/snippet}

<Story
	name="With Expanded Category"
	args={{
		categories: mockCategories,
		loading: false,
		error: null
	}}
>
	{#snippet children(args)}
		<CategoriesPage {...args} />
	{/snippet}
</Story>

<Story
	name="Empty"
	args={{
		categories: emptyCategories,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		categories: null,
		loading: true,
		error: null
	}}
	{template}
/>
