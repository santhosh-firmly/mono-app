<script>
	import House from 'lucide-svelte/icons/house';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import Package from 'lucide-svelte/icons/package';
	import Settings from 'lucide-svelte/icons/settings';
	import StoreIcon from 'lucide-svelte/icons/store';
	import Users from 'lucide-svelte/icons/users';
	import History from 'lucide-svelte/icons/history';
	import FileSignature from 'lucide-svelte/icons/file-signature';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import TagIcon from 'lucide-svelte/icons/tag';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Sliders from 'lucide-svelte/icons/sliders';
	import Shield from 'lucide-svelte/icons/shield';
	import Cog from 'lucide-svelte/icons/cog';
	import Zap from 'lucide-svelte/icons/zap';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';

	let { currentPath, domain, userRole = 'viewer', isFirmlyAdmin = false } = $props();

	// Check if user has admin privileges (owner or editor for team management)
	let isOwner = $derived(userRole === 'owner');

	// Check if sections should be highlighted
	let isCatalogActive = $derived(currentPath.startsWith(`/merchant/${domain}/catalog`));
	let isSettingsActive = $derived(
		currentPath.startsWith(`/merchant/${domain}/settings`) ||
			currentPath.startsWith(`/merchant/${domain}/agreement`) ||
			currentPath.startsWith(`/merchant/${domain}/audit-logs`)
	);
	let isFirmlyAdminActive = $derived(
		currentPath.startsWith(`/merchant/${domain}/integration-admin`)
	);

	// Sections expand only when on their pages
	let expandedSections = $derived({
		catalog: isCatalogActive,
		settings: isSettingsActive,
		firmlyAdmin: isFirmlyAdminActive
	});

	let navItems = $derived([
		{
			icon: House,
			label: 'Dashboard',
			href: `/merchant/${domain}`
		},
		{
			icon: ClipboardList,
			label: 'Orders',
			href: `/merchant/${domain}/orders`
		},
		{
			icon: TagIcon,
			label: 'Catalog',
			href: `/merchant/${domain}/catalog`,
			defaultHref: `/merchant/${domain}/catalog/products`,
			hasChildren: true,
			sectionKey: 'catalog',
			children: [
				{
					icon: Package,
					label: 'Products',
					href: `/merchant/${domain}/catalog/products`
				},
				{
					icon: Sliders,
					label: 'Configuration',
					href: `/merchant/${domain}/catalog`
				}
			]
		},
		{
			icon: StoreIcon,
			label: 'Destinations',
			href: `/merchant/${domain}/destinations`
		}
	]);

	let adminItems = $derived([
		{
			icon: Users,
			label: 'Team',
			href: `/merchant/${domain}/team`
		},
		// Firmly Admin section only visible to Firmly admins
		...(isFirmlyAdmin
			? [
					{
						icon: ShieldCheck,
						label: 'Admin',
						href: `/merchant/${domain}/integration-admin`,
						defaultHref: `/merchant/${domain}/integration-admin`,
						hasChildren: true,
						sectionKey: 'firmlyAdmin',
						children: [
							{
								icon: Zap,
								label: 'Integration',
								href: `/merchant/${domain}/integration-admin`
							}
						]
					}
				]
			: []),
		{
			icon: Settings,
			label: 'Settings',
			href: `/merchant/${domain}/settings`,
			defaultHref: `/merchant/${domain}/settings`,
			hasChildren: true,
			sectionKey: 'settings',
			children: [
				{
					icon: Cog,
					label: 'General',
					href: `/merchant/${domain}/settings`
				},
				// Agreement and Audit logs only visible to owners
				...(isOwner
					? [
							{
								icon: FileSignature,
								label: 'Agreement',
								href: `/merchant/${domain}/agreement`
							},
							{
								icon: History,
								label: 'Audit Logs',
								href: `/merchant/${domain}/audit-logs`
							}
						]
					: []),
				{
					icon: Shield,
					label: 'CDN Whitelisting',
					href: `/merchant/${domain}/settings/cdn`
				}
			]
		}
	]);

	function isSelected(href, path) {
		// Dashboard - exact match only
		if (href === `/merchant/${domain}`) {
			return path === `/merchant/${domain}`;
		}
		// Catalog configuration - exact match for base catalog path
		if (href === `/merchant/${domain}/catalog`) {
			return path === `/merchant/${domain}/catalog`;
		}
		// Settings general - exact match for base settings path
		if (href === `/merchant/${domain}/settings`) {
			return path === `/merchant/${domain}/settings`;
		}
		return path.startsWith(href);
	}
</script>

<!-- Desktop Navigation - Full sidebar -->
<aside
	class="sticky top-0 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex"
>
	<nav class="flex-1 space-y-1 px-3 py-4">
		{#each navItems as item (item.label)}
			{@const Icon = item.icon}
			{#if item.hasChildren}
				{@const isExpanded = expandedSections[item.sectionKey]}
				{@const sectionActive = currentPath.startsWith(item.href)}
				<div>
					<a
						href={item.defaultHref || item.href}
						class={[
							'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
							sectionActive
								? 'bg-primary/5 text-primary'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
						]}
					>
						<Icon class="h-5 w-5" />
						<span class="flex-1 text-left">{item.label}</span>
						<ChevronDown
							class={[
								'h-4 w-4 transition-transform duration-200',
								isExpanded ? 'rotate-180' : ''
							]}
						/>
					</a>
					{#if isExpanded}
						<div class="ml-4 mt-1 space-y-1">
							{#each item.children as child (child.label)}
								{@const ChildIcon = child.icon}
								{@const childSelected = isSelected(child.href, currentPath)}
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
			{:else}
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
			{/if}
		{/each}

		<!-- Admin Section -->
		<div class="mt-6 pt-4 border-t border-border">
			<p
				class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
			>
				Admin
			</p>
			{#each adminItems as item (item.label)}
				{@const Icon = item.icon}
				{#if item.hasChildren}
					{@const isExpanded = expandedSections[item.sectionKey]}
					{@const sectionActive = currentPath.startsWith(item.href)}
					<div>
						<a
							href={item.defaultHref || item.href}
							class={[
								'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								sectionActive
									? 'bg-primary/5 text-primary'
									: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
							]}
						>
							<Icon class="h-5 w-5" />
							<span class="flex-1 text-left">{item.label}</span>
							<ChevronDown
								class={[
									'h-4 w-4 transition-transform duration-200',
									isExpanded ? 'rotate-180' : ''
								]}
							/>
						</a>
						{#if isExpanded}
							<div class="ml-4 mt-1 space-y-1">
								{#each item.children as child (child.label)}
									{@const ChildIcon = child.icon}
									{@const childSelected = isSelected(child.href, currentPath)}
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
				{:else}
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
				{/if}
			{/each}
		</div>
	</nav>
</aside>

<!-- Tablet Navigation - Compact icon sidebar -->
<aside
	class="sticky top-0 z-10 hidden h-[calc(100vh-4rem)] w-16 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card sm:flex lg:hidden"
>
	<nav class="flex flex-1 flex-col items-center gap-2 px-2 py-4">
		{#each navItems as item (item.label)}
			{@const Icon = item.icon}
			{@const selected = item.hasChildren
				? currentPath.startsWith(item.href)
				: isSelected(item.href, currentPath)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						href={item.defaultHref || item.href}
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

		<!-- Admin Section Separator -->
		<div class="my-2 h-px w-8 bg-border"></div>

		{#each adminItems as item (item.label)}
			{@const Icon = item.icon}
			{@const selected = item.hasChildren
				? currentPath.startsWith(item.href)
				: isSelected(item.href, currentPath)}
			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						href={item.defaultHref || item.href}
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
	</nav>
</aside>
