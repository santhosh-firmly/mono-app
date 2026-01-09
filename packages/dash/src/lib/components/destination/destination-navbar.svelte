<script>
	import House from 'lucide-svelte/icons/house';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import Settings from 'lucide-svelte/icons/settings';
	import StoreIcon from 'lucide-svelte/icons/store';
	import Users from 'lucide-svelte/icons/users';
	import History from 'lucide-svelte/icons/history';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let { currentPath, appId, userRole = 'viewer' } = $props();

	// Check if user has admin privileges (owner for team management and audit logs)
	let isOwner = $derived(userRole === 'owner');

	let navItems = $derived([
		{
			icon: House,
			label: 'Dashboard',
			href: `/destination/${appId}`
		},
		{
			icon: StoreIcon,
			label: 'Merchants',
			href: `/destination/${appId}/merchants`
		},
		{
			icon: ClipboardList,
			label: 'Orders',
			href: `/destination/${appId}/orders`
		}
	]);

	let adminItems = $derived([
		{
			icon: Users,
			label: 'Team',
			href: `/destination/${appId}/team`
		},
		// Audit logs only visible to owners
		...(isOwner
			? [
					{
						icon: History,
						label: 'Audit Logs',
						href: `/destination/${appId}/audit-logs`
					}
				]
			: []),
		{
			icon: Settings,
			label: 'Settings',
			href: `/destination/${appId}/settings`
		}
	]);

	function isSelected(href, path) {
		// Dashboard - exact match only
		if (href === `/destination/${appId}`) {
			return path === `/destination/${appId}`;
		}
		// Settings - exact match for base settings path
		if (href === `/destination/${appId}/settings`) {
			return path === `/destination/${appId}/settings`;
		}
		return path.startsWith(href);
	}
</script>

<!-- Desktop Navigation - Full sidebar -->
<aside
	class="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-card lg:flex"
>
	<nav class="flex-1 space-y-1 px-3 py-4">
		{#each navItems as item (item.label)}
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

		<!-- Admin Section -->
		<div class="mt-6 pt-4 border-t border-border">
			<p
				class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
			>
				Admin
			</p>
			{#each adminItems as item (item.label)}
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

		<!-- Admin Section Separator -->
		<div class="my-2 h-px w-8 bg-border"></div>

		{#each adminItems as item (item.label)}
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
	</nav>
</aside>
