<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantHeader from './merchant-header.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Navigation/Header',
		component: MerchantHeader,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const mockUser = {
		id: 'user-123',
		name: 'John Doe',
		email: 'john@acme.com',
		hasAvatar: false
	};

	const mockMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
		{ domain: 'example.com', displayName: 'Example Store', role: 'admin' },
		{ domain: 'myshop.com', displayName: 'My Shop', role: 'viewer' }
	];

	const mockDestinations = [
		{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
		{ appId: 'claude', displayName: 'Claude', role: 'admin' }
	];

	const mockPendingInvites = [
		{
			id: 'inv-1',
			merchant_domain: 'newstore.com',
			display_name: 'New Store',
			invited_by_name: 'Jane Smith',
			role: 'admin',
			created_at: new Date().toISOString()
		}
	];
</script>

{#snippet template(args)}
	<MerchantHeader
		user={args.user}
		domain={args.domain}
		merchantAccess={args.merchantAccess}
		destinationAccess={args.destinationAccess}
		currentPath={args.currentPath}
		userRole={args.userRole}
		pendingInvites={args.pendingInvites}
	/>
	<div class="p-6 bg-background">
		<p class="text-muted-foreground">Page content below header</p>
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		user: mockUser,
		domain: 'acme.com',
		merchantAccess: mockMerchants,
		destinationAccess: mockDestinations,
		currentPath: '/merchant/acme.com',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="Single Dashboard (No Selector)"
	args={{
		user: mockUser,
		domain: 'acme.com',
		merchantAccess: [{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' }],
		destinationAccess: [],
		currentPath: '/merchant/acme.com',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="With Pending Invites"
	args={{
		user: mockUser,
		domain: 'acme.com',
		merchantAccess: mockMerchants,
		destinationAccess: [],
		currentPath: '/merchant/acme.com',
		userRole: 'owner',
		pendingInvites: mockPendingInvites
	}}
	{template}
/>

<Story
	name="Viewer Role"
	args={{
		user: mockUser,
		domain: 'acme.com',
		merchantAccess: mockMerchants,
		destinationAccess: [],
		currentPath: '/merchant/acme.com/orders',
		userRole: 'viewer',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="Many Dashboards"
	args={{
		user: mockUser,
		domain: 'acme.com',
		merchantAccess: [
			{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
			{ domain: 'example.com', displayName: 'Example Store', role: 'admin' },
			{ domain: 'myshop.com', displayName: 'My Shop', role: 'viewer' },
			{ domain: 'bestgoods.com', displayName: 'Best Goods', role: 'admin' },
			{ domain: 'qualityitems.com', displayName: 'Quality Items', role: 'viewer' }
		],
		destinationAccess: [
			{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
			{ appId: 'claude', displayName: 'Claude', role: 'admin' },
			{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' }
		],
		currentPath: '/merchant/acme.com',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>
