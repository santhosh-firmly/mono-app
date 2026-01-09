<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Navbar from './navbar.svelte';

	const { Story } = defineMeta({
		title: 'App/Navbar',
		component: Navbar,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="flex min-h-[400px]">
		<Navbar {...args} />
		<main class="ml-16 flex-1 p-8 sm:ml-0">
			<h1 class="text-2xl font-bold">Page Content</h1>
			<p class="mt-2 text-muted-foreground">This is the main content area.</p>
		</main>
	</div>
{/snippet}

<Story
	name="Dashboard"
	args={{
		data: {
			authInfo: {
				id: 'user-123',
				name: 'John Doe',
				email: 'john@firmly.com',
				hasAvatar: false
			},
			merchants: [
				{ domain: 'store-one.com' },
				{ domain: 'store-two.com' },
				{ domain: 'another-store.com' }
			]
		},
		currentPath: '/admin'
	}}
	{template}
/>

<Story
	name="Dashboards Page"
	args={{
		data: {
			authInfo: {
				id: 'user-123',
				name: 'Jane Smith',
				email: 'jane@firmly.com',
				hasAvatar: true
			},
			merchants: [{ domain: 'example.com' }, { domain: 'test-store.com' }]
		},
		currentPath: '/admin/dashboards'
	}}
	{template}
/>

<Story
	name="Merchants Page"
	args={{
		data: {
			authInfo: {
				id: 'user-456',
				name: 'Admin User',
				email: 'admin@firmly.com',
				hasAvatar: false
			},
			merchants: []
		},
		currentPath: '/admin/merchants'
	}}
	{template}
/>

<Story
	name="Orders Page"
	args={{
		data: {
			authInfo: {
				id: 'user-789',
				name: 'Support Agent',
				email: 'support@firmly.com',
				hasAvatar: false
			},
			merchants: [
				{ domain: 'merchant-1.com' },
				{ domain: 'merchant-2.com' },
				{ domain: 'merchant-3.com' },
				{ domain: 'merchant-4.com' },
				{ domain: 'merchant-5.com' }
			]
		},
		currentPath: '/admin/orders'
	}}
	{template}
/>
