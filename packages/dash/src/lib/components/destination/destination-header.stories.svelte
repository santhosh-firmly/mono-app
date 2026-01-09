<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationHeader from './destination-header.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Navigation/Header',
		component: DestinationHeader,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const mockUser = {
		id: 'user-123',
		name: 'John Doe',
		email: 'john@example.com',
		hasAvatar: false
	};

	const mockDestinations = [
		{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
		{ appId: 'claude', displayName: 'Claude', role: 'admin' },
		{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' }
	];

	const mockMerchants = [
		{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
		{ domain: 'example.com', displayName: 'Example Store', role: 'admin' }
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
	<DestinationHeader
		user={args.user}
		appId={args.appId}
		destinationName={args.destinationName}
		destinationAccess={args.destinationAccess}
		merchantAccess={args.merchantAccess}
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
		appId: 'chatgpt',
		destinationName: 'ChatGPT',
		destinationAccess: mockDestinations,
		merchantAccess: mockMerchants,
		currentPath: '/destination/chatgpt',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="Single Dashboard (No Selector)"
	args={{
		user: mockUser,
		appId: 'chatgpt',
		destinationName: 'ChatGPT',
		destinationAccess: [{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' }],
		merchantAccess: [],
		currentPath: '/destination/chatgpt',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="With Pending Invites"
	args={{
		user: mockUser,
		appId: 'chatgpt',
		destinationName: 'ChatGPT',
		destinationAccess: mockDestinations,
		merchantAccess: mockMerchants,
		currentPath: '/destination/chatgpt',
		userRole: 'owner',
		pendingInvites: mockPendingInvites
	}}
	{template}
/>

<Story
	name="Viewer Role"
	args={{
		user: mockUser,
		appId: 'chatgpt',
		destinationName: 'ChatGPT',
		destinationAccess: mockDestinations,
		merchantAccess: [],
		currentPath: '/destination/chatgpt/orders',
		userRole: 'viewer',
		pendingInvites: []
	}}
	{template}
/>

<Story
	name="Many Dashboards"
	args={{
		user: mockUser,
		appId: 'chatgpt',
		destinationName: 'ChatGPT',
		destinationAccess: [
			{ appId: 'chatgpt', displayName: 'ChatGPT', role: 'owner' },
			{ appId: 'claude', displayName: 'Claude', role: 'admin' },
			{ appId: 'gemini', displayName: 'Gemini', role: 'viewer' },
			{ appId: 'copilot', displayName: 'GitHub Copilot', role: 'viewer' },
			{ appId: 'perplexity', displayName: 'Perplexity AI', role: 'admin' },
			{ appId: 'jasper', displayName: 'Jasper AI', role: 'viewer' }
		],
		merchantAccess: [
			{ domain: 'acme.com', displayName: 'Acme Corporation', role: 'owner' },
			{ domain: 'example.com', displayName: 'Example Store', role: 'admin' },
			{ domain: 'myshop.com', displayName: 'My Shop', role: 'viewer' }
		],
		currentPath: '/destination/chatgpt',
		userRole: 'owner',
		pendingInvites: []
	}}
	{template}
/>
