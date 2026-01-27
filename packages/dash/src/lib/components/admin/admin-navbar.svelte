<script>
	import House from 'lucide-svelte/icons/house';
	import Store from 'lucide-svelte/icons/store';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
	import Users from 'lucide-svelte/icons/users';
	import Send from 'lucide-svelte/icons/send';
	import Database from 'lucide-svelte/icons/database';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Package from 'lucide-svelte/icons/package';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import FileText from 'lucide-svelte/icons/file-text';
	import Download from 'lucide-svelte/icons/download';
	import Upload from 'lucide-svelte/icons/upload';
	import Settings from 'lucide-svelte/icons/settings';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let { currentPath } = $props();

	// Check if catalog section should be expanded
	let isCatalogActive = $derived(currentPath.startsWith('/admin/catalog'));

	// Main navigation items
	let mainNavItems = [
		{ icon: House, label: 'Home', href: '/admin' },
		{ icon: Store, label: 'Merchants', href: '/admin/merchants' },
		{ icon: Send, label: 'Destinations', href: '/admin/destinations' },
		{ icon: ClipboardList, label: 'Orders', href: '/admin/orders' }
	];

	// Admin tools items (without catalog)
	let adminToolsItems = [
		{ icon: LayoutDashboard, label: 'Dashboards', href: '/admin/dashboards' },
		{ icon: Users, label: 'Users', href: '/admin/users' }
	];

	// Catalog sub-items
	let catalogItems = [
		{ icon: Package, label: 'All Products', href: '/admin/catalog/all-products' },
		{ icon: Sparkles, label: 'Enrichment', href: '/admin/catalog/enrichment' },
		{ icon: FileText, label: 'Product Details', href: '/admin/catalog/product-details' },
		{ icon: Upload, label: 'Export', href: '/admin/catalog/export' },
		{ icon: Download, label: 'Downloads', href: '/admin/catalog/downloads' },
		{ icon: Upload, label: 'Publish', href: '/admin/catalog/publish' },
		{ icon: Settings, label: 'Settings', href: '/admin/catalog/settings' }
	];

	function isSelected(href, path) {
		if (href === '/admin') {
			return path === '/admin';
		}
		return path.startsWith(href);
	}
</script>

<!-- Desktop Navigation - Full sidebar -->
<aside
	class="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex"
>
	<nav class="flex-1 space-y-1 px-3 py-4">
		<!-- Main Section -->
		{#each mainNavItems as item (item.label)}
			{@const Icon = item.icon}
			{@const selected = isSelected(item.href, currentPath)}
			<a
				href={item.href}
				class={[
					'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					selected
						? 'bg-primary/5 text-primary'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				]}
			>
				<Icon class="h-5 w-5" />
				{item.label}
			</a>
		{/each}

		<!-- Admin Tools Section -->
		<div class="mt-6 pt-4 border-t border-border">
			<p
				class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
			>
				Admin Tools
			</p>
			{#each adminToolsItems as item (item.label)}
				{@const Icon = item.icon}
				{@const selected = isSelected(item.href, currentPath)}
				<a
					href={item.href}
					class={[
						'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
						selected
							? 'bg-primary/5 text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					]}
				>
					<Icon class="h-5 w-5" />
					{item.label}
				</a>
			{/each}

			<!-- Catalog Section with expandable sub-items -->
			<div>
				<a
					href="/admin/catalog"
					class={[
						'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
						isCatalogActive
							? 'bg-primary/5 text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
						{#each catalogItems as child (child.label)}
							{@const ChildIcon = child.icon}
							{@const childSelected = currentPath === child.href}
							<a
								href={child.href}
								class={[
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									childSelected
										? 'bg-primary/5 text-primary'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								]}
							>
								<ChildIcon class="h-4 w-4" />
								{child.label}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</nav>
</aside>

<!-- Tablet Navigation - Compact icon sidebar -->
<aside
	class="sticky top-16 hidden h-[calc(100vh-4rem)] w-16 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card sm:flex lg:hidden"
>
	<nav class="flex flex-1 flex-col items-center gap-2 px-2 py-4">
		<!-- Main Section -->
		{#each mainNavItems as item (item.label)}
			{@const Icon = item.icon}
			{@const selected = isSelected(item.href, currentPath)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						href={item.href}
						class={[
							'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
							selected
								? 'bg-primary/5 text-primary'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
						]}
					>
						<Icon class="h-5 w-5" />
						<span class="sr-only">{item.label}</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">{item.label}</Tooltip.Content>
			</Tooltip.Root>
		{/each}

		<!-- Admin Tools Section Separator -->
		<div class="my-2 h-px w-8 bg-border"></div>

		<!-- Admin Tools Section -->
		{#each adminToolsItems as item (item.label)}
			{@const Icon = item.icon}
			{@const selected = isSelected(item.href, currentPath)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						href={item.href}
						class={[
							'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
							selected
								? 'bg-primary/5 text-primary'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
						]}
					>
						<Icon class="h-5 w-5" />
						<span class="sr-only">{item.label}</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">{item.label}</Tooltip.Content>
			</Tooltip.Root>
		{/each}

		<!-- Catalog -->
		<Tooltip.Root>
			<Tooltip.Trigger>
				<a
					href="/admin/catalog"
					class={[
						'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
						isCatalogActive
							? 'bg-primary/5 text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					]}
				>
					<Database class="h-5 w-5" />
					<span class="sr-only">Catalog</span>
				</a>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Catalog</Tooltip.Content>
		</Tooltip.Root>
	</nav>
</aside>
