<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantNavbar from './merchant-navbar.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Navigation/Navbar',
		component: MerchantNavbar,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="flex h-screen">
		<MerchantNavbar
			currentPath={args.currentPath}
			domain={args.domain}
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
		currentPath: '/merchant/acme.com',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Orders Selected"
	args={{
		currentPath: '/merchant/acme.com/orders',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Catalog Expanded"
	args={{
		currentPath: '/merchant/acme.com/catalog/products',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Settings Expanded"
	args={{
		currentPath: '/merchant/acme.com/settings',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Viewer Role (Limited Menu)"
	args={{
		currentPath: '/merchant/acme.com',
		domain: 'acme.com',
		userRole: 'viewer',
		isFirmlyAdmin: false
	}}
	{template}
/>

<Story
	name="Firmly Admin (With Admin Section)"
	args={{
		currentPath: '/merchant/acme.com/integration-admin',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: true
	}}
	{template}
/>

<Story
	name="Team Selected"
	args={{
		currentPath: '/merchant/acme.com/team',
		domain: 'acme.com',
		userRole: 'owner',
		isFirmlyAdmin: false
	}}
	{template}
/>
