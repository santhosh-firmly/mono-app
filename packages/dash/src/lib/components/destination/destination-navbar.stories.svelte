<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationNavbar from './destination-navbar.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Navigation/Navbar',
		component: DestinationNavbar,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="flex h-screen">
		<DestinationNavbar
			currentPath={args.currentPath}
			appId={args.appId}
			userRole={args.userRole}
			isFirmlyAdmin={args.isFirmlyAdmin}
		/>
		<div class="flex-1 bg-background p-6">
			<p class="text-muted-foreground">Main content area</p>
		</div>
	</div>
{/snippet}

<Story
	name="Dashboard Selected"
	args={{
		currentPath: '/destination/chatgpt',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Merchants Selected"
	args={{
		currentPath: '/destination/chatgpt/merchants',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Orders Selected"
	args={{
		currentPath: '/destination/chatgpt/orders',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Team Selected"
	args={{
		currentPath: '/destination/chatgpt/team',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Settings Selected"
	args={{
		currentPath: '/destination/chatgpt/settings',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Viewer Role (No Audit Logs)"
	args={{
		currentPath: '/destination/chatgpt',
		appId: 'chatgpt',
		userRole: 'viewer',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Firmly Admin"
	args={{
		currentPath: '/destination/chatgpt',
		appId: 'chatgpt',
		userRole: 'owner',
		isFirmlyAdmin: true
	}}
	{template}
/>
