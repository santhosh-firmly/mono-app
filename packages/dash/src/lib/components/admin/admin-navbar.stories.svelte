<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdminNavbar from './admin-navbar.svelte';

	const { Story } = defineMeta({
		title: 'Admin/AdminNavbar',
		component: AdminNavbar,
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
</script>

{#snippet template(args)}
	<div class="flex h-screen bg-background">
		<AdminNavbar {...args} />
		<div class="flex-1 p-8">
			<p class="text-muted-foreground">Main content area</p>
		</div>
	</div>
{/snippet}

<Story name="Default" args={{ currentPath: '/admin' }} {template} />

<Story name="Home Active" args={{ currentPath: '/admin' }} {template} />

<Story name="Merchants Active" args={{ currentPath: '/admin/merchants' }} {template} />

<Story name="Catalog Active" args={{ currentPath: '/admin/catalog' }} {template} />

<Story name="Catalog Expanded" args={{ currentPath: '/admin/catalog/all-products' }} {template} />

<Story name="Enrichment Sub-Page" args={{ currentPath: '/admin/catalog/enrichment' }} {template} />

<Story name="Users Active" args={{ currentPath: '/admin/users' }} {template} />
