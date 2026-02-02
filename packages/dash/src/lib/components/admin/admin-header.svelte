<script>
	import AdminUserMenu from './admin-user-menu.svelte';
	import MerchantQuickAccess from './merchant-quick-access.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';
	import PanelLeft from 'lucide-svelte/icons/panel-left';
	import House from 'lucide-svelte/icons/house';
	import Store from 'lucide-svelte/icons/store';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
	import Users from 'lucide-svelte/icons/users';
	import Send from 'lucide-svelte/icons/send';
	import Database from 'lucide-svelte/icons/database';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	let { user, merchants = [], currentPath, env = null } = $props();

	// Check if catalog section is expanded
	let isCatalogActive = $derived(currentPath.startsWith('/admin/catalog'));

	// Main navigation items
	let mainNavItems = [
		{ icon: House, label: 'Home', href: '/admin' },
		{ icon: Store, label: 'Merchants', href: '/admin/merchants' },
		{ icon: Send, label: 'Destinations', href: '/admin/destinations' },
		{ icon: ClipboardList, label: 'Orders', href: '/admin/orders' }
	];

	// Admin tools items
	let adminToolsItems = [
		{ icon: LayoutDashboard, label: 'Dashboards', href: '/admin/dashboards' },
		{ icon: Users, label: 'Users', href: '/admin/users' }
	];

	// Catalog sub-items
	let catalogItems = [
		{ label: 'All Products', href: '/admin/catalog/all-products' },
		{ label: 'Product Details', href: '/admin/catalog/product-details' },
		{ label: 'Enrichment', href: '/admin/catalog/enrichment' },
		{ label: 'Export', href: '/admin/catalog/export' },
		{ label: 'Downloads', href: '/admin/catalog/downloads' },
		{ label: 'Publish', href: '/admin/catalog/publish' },
		{ label: 'Settings', href: '/admin/catalog/settings' }
	];

	function isSelected(href, path) {
		if (href === '/admin') {
			return path === '/admin';
		}
		return path.startsWith(href);
	}
</script>

<header
	class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6"
>
	<!-- Left side: Mobile menu + Logo -->
	<div class="flex items-center gap-4">
		<!-- Mobile menu button -->
		<Sheet.Root>
			<Sheet.Trigger>
				<Button size="icon" variant="ghost" class="sm:hidden">
					<PanelLeft class="h-5 w-5" />
					<span class="sr-only">Toggle Menu</span>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="w-72">
				<nav class="grid gap-2 py-4">
					<a href="/admin" class="mb-4 flex items-center gap-2 px-2">
						<FirmlyLogo size="sm" {env} />
					</a>

					<!-- Main Section -->
					{#each mainNavItems as { icon: Icon, label, href } (label)}
						{@const selected = isSelected(href, currentPath)}
						<a
							{href}
							class={[
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								selected
									? 'bg-primary/5 text-primary'
									: 'text-muted-foreground hover:bg-accent hover:text-foreground'
							]}
						>
							<Icon class="h-5 w-5" />
							{label}
						</a>
					{/each}

					<!-- Admin Tools Section -->
					<div class="mt-4 pt-4 border-t border-border">
						<p
							class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
						>
							Admin Tools
						</p>
						{#each adminToolsItems as { icon: Icon, label, href } (label)}
							{@const selected = isSelected(href, currentPath)}
							<a
								{href}
								class={[
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									selected
										? 'bg-primary/5 text-primary'
										: 'text-muted-foreground hover:bg-accent hover:text-foreground'
								]}
							>
								<Icon class="h-5 w-5" />
								{label}
							</a>
						{/each}

						<!-- Catalog Section -->
						<div>
							<a
								href="/admin/catalog"
								class={[
									'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									isCatalogActive
										? 'bg-primary/5 text-primary'
										: 'text-muted-foreground hover:bg-accent hover:text-foreground'
								]}
							>
								<Database class="h-5 w-5" />
								<span class="flex-1 text-left">Catalog</span>
								<ChevronDown
									class={[
										'h-4 w-4 transition-transform duration-200',
										isCatalogActive ? 'rotate-180' : ''
									]}
								/>
							</a>
							{#if isCatalogActive}
								<div class="ml-4 mt-1 space-y-1">
									{#each catalogItems as { label, href } (label)}
										{@const childSelected = currentPath === href}
										<a
											{href}
											class={[
												'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
												childSelected
													? 'bg-primary/5 text-primary'
													: 'text-muted-foreground hover:bg-accent hover:text-foreground'
											]}
										>
											{label}
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Logo - always visible -->
		<a href="/admin" class="flex items-center gap-2">
			<FirmlyLogo size="sm" {env} />
		</a>

		<!-- Merchant quick access - desktop only -->
		{#if merchants.length > 0}
			<div class="hidden sm:block">
				<MerchantQuickAccess {merchants} />
			</div>
		{/if}
	</div>

	<!-- Right side: Admin badge + User menu -->
	<div class="flex items-center gap-2">
		<span class="rounded-full bg-primary px-2 py-0.5 text-xs font-bold uppercase leading-none text-primary-foreground">
			admin
		</span>
		<AdminUserMenu {user} />
	</div>
</header>
