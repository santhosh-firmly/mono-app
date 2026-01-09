<script>
	import DestinationUserMenu from './destination-user-menu.svelte';
	import DestinationSelector from './destination-selector.svelte';
	import PendingInvitesPopover from '../merchant/pending-invites-popover.svelte';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';
	import PanelLeft from 'lucide-svelte/icons/panel-left';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import House from 'lucide-svelte/icons/house';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import Settings from 'lucide-svelte/icons/settings';
	import StoreIcon from 'lucide-svelte/icons/store';
	import Users from 'lucide-svelte/icons/users';
	import History from 'lucide-svelte/icons/history';

	let {
		user,
		appId,
		destinationAccess = [],
		merchantAccess = [],
		currentPath,
		userRole = 'viewer',
		pendingInvites = []
	} = $props();

	// Show dashboard selector when user has access to multiple dashboards (either type)
	let showSelector = $derived(destinationAccess.length + merchantAccess.length > 1);
	let isOwner = $derived(userRole === 'owner');

	let navItems = $derived([
		{ icon: House, label: 'Dashboard', href: `/destination/${appId}` },
		{ icon: StoreIcon, label: 'Merchants', href: `/destination/${appId}/merchants` },
		{ icon: ClipboardList, label: 'Orders', href: `/destination/${appId}/orders` }
	]);

	let adminItems = $derived([
		{ icon: Users, label: 'Team', href: `/destination/${appId}/team` },
		// Audit logs only visible to owners
		...(isOwner
			? [{ icon: History, label: 'Audit Logs', href: `/destination/${appId}/audit-logs` }]
			: []),
		{ icon: Settings, label: 'Settings', href: `/destination/${appId}/settings` }
	]);

	function isSelected(href, path) {
		if (href === `/destination/${appId}`) {
			return path === `/destination/${appId}`;
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
					<a href={`/destination/${appId}`} class="mb-4 flex items-center gap-2 px-2">
						<FirmlyLogo size="sm" />
					</a>
					{#if showSelector}
						<div class="mb-4 px-2">
							<DestinationSelector
								currentAppId={appId}
								{destinationAccess}
								{merchantAccess}
							/>
						</div>
					{/if}
					{#each navItems as { icon: Icon, label, href } (label)}
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

					<!-- Admin Section -->
					<div class="mt-4 pt-4 border-t border-border">
						<p
							class="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
						>
							Admin
						</p>
						{#each adminItems as { icon: Icon, label, href } (label)}
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
					</div>
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Logo - always visible -->
		<a href={`/destination/${appId}`} class="flex items-center gap-2">
			<FirmlyLogo size="sm" />
		</a>

		<!-- Destination selector - shown when user has multiple dashboards -->
		{#if showSelector}
			<div class="hidden sm:block">
				<DestinationSelector currentAppId={appId} {destinationAccess} {merchantAccess} />
			</div>
		{/if}
	</div>

	<!-- Right side: Notifications + User menu -->
	<div class="flex items-center gap-2">
		<PendingInvitesPopover {pendingInvites} />
		<DestinationUserMenu {user} {appId} />
	</div>
</header>
