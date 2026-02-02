<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdminHeader from './admin-header.svelte';

	const { Story } = defineMeta({
		title: 'Admin/AdminHeader',
		component: AdminHeader,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			currentPath: {
				control: 'text',
				description: 'Current route path for active state highlighting'
			}
		}
	});

	const mockUser = {
		id: 'user-123',
		name: 'John Doe',
		email: 'john.doe@firmly.com',
		hasAvatar: true
	};

	const mockMerchants = [
		{ domain: 'acme-store.com', name: 'ACME Store' },
		{ domain: 'widgets-inc.com', name: 'Widgets Inc' },
		{ domain: 'gadgets-world.com', name: 'Gadgets World' },
		{ domain: 'tech-emporium.com', name: 'Tech Emporium' },
		{ domain: 'fashion-hub.com', name: 'Fashion Hub' }
	];
</script>

{#snippet template(args)}
	<AdminHeader {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		user: mockUser,
		merchants: mockMerchants,
		currentPath: '/admin'
	}}
	{template}
/>

<Story
	name="Without Merchants"
	args={{
		user: mockUser,
		merchants: [],
		currentPath: '/admin'
	}}
	{template}
/>

<Story
	name="On Catalog Page"
	args={{
		user: mockUser,
		merchants: mockMerchants,
		currentPath: '/admin/catalog'
	}}
	{template}
/>

<Story
	name="On Merchants Page"
	args={{
		user: mockUser,
		merchants: mockMerchants,
		currentPath: '/admin/merchants'
	}}
	{template}
/>

<Story
	name="On Catalog Sub-Page"
	args={{
		user: mockUser,
		merchants: mockMerchants,
		currentPath: '/admin/catalog/all-products'
	}}
	{template}
/>
