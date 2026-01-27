<script>
	import { goto } from '$app/navigation';
	import House from 'lucide-svelte/icons/house';
	import Store from 'lucide-svelte/icons/store';
	import ClipboardList from 'lucide-svelte/icons/clipboard-list';
	import LayoutDashboard from 'lucide-svelte/icons/layout-dashboard';
	import Users from 'lucide-svelte/icons/users';
	import PanelLeft from 'lucide-svelte/icons/panel-left';
	import Search from 'lucide-svelte/icons/search';
	import Send from 'lucide-svelte/icons/send';
	import Database from 'lucide-svelte/icons/database';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import MerchantAvatar from '$lib/components/merchant/merchant-avatar.svelte';
	import UserNav from './user-nav.svelte';

	let { data, currentPath } = $props();

	// Merchant quick-access state
	let merchantSearchOpen = $state(false);
	let searchQuery = $state('');

	// Get merchants from layout data
	let merchants = $derived(data.merchants || []);
	let filteredMerchants = $derived(
		merchants
			.filter((m) => m.domain.toLowerCase().includes(searchQuery.toLowerCase()))
			.slice(0, 10)
	);

	function handleMerchantSelect(domain) {
		merchantSearchOpen = false;
		searchQuery = '';
		goto(`merchant/${domain}`);
	}

	let navOptions = [
		{
			icon: House,
			label: 'Dashboard',
			href: '/admin'
		},
		{
			icon: LayoutDashboard,
			label: 'Dashboards',
			href: '/admin/dashboards'
		},
		{
			icon: Store,
			label: 'Merchants',
			href: '/admin/merchants'
		},
		{
			icon: Send,
			label: 'Destinations',
			href: '/admin/destinations'
		},
		{
			icon: ClipboardList,
			label: 'Orders',
			href: '/admin/orders'
		},
		{
			icon: Users,
			label: 'Users',
			href: '/admin/users'
		},
		{
			icon: Database,
			label: 'Catalog',
			href: '/admin/catalog'
		}
	];
</script>

<aside class="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex">
	<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
		<a
			href="/admin"
			class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
		>
			<img
				src="/favicon.png"
				class="h-6 w-6 transition-all group-hover:scale-110"
				alt="firmly logo"
			/>
			<span class="sr-only">firmly Inc</span>
		</a>
		{#each navOptions as { icon: Icon, label, href } (label)}
			{@const isSelected =
				href === '/admin' ? currentPath === '/admin' : currentPath.includes(href)}

			<Tooltip.Root>
				<Tooltip.Trigger>
					<a
						{href}
						class={[
							'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
							isSelected ? 'bg-muted text-black' : 'text-gray-500 hover:text-black'
						]}
					>
						<Icon class="h-4 w-4" />
						<span class="sr-only">{label}</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">{label}</Tooltip.Content>
			</Tooltip.Root>
		{/each}
	</nav>
	<nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
		<!-- Merchant Quick Access -->
		<Popover.Root bind:open={merchantSearchOpen}>
			<Popover.Trigger>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-muted hover:text-black"
						>
							<Search class="h-4 w-4" />
							<span class="sr-only">Quick access merchant</span>
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content side="right">Quick Access</Tooltip.Content>
				</Tooltip.Root>
			</Popover.Trigger>
			<Popover.Content side="right" class="w-64 p-0">
				<Command.Root>
					<Command.Input placeholder="Search merchants..." bind:value={searchQuery} />
					<Command.List>
						<Command.Empty>No merchants found.</Command.Empty>
						<Command.Group heading="Merchants">
							{#each filteredMerchants as merchant (merchant.domain)}
								<Command.Item
									value={merchant.domain}
									onSelect={() => handleMerchantSelect(merchant.domain)}
								>
									<div class="flex items-center gap-2">
										<MerchantAvatar domain={merchant.domain} size="sm" />
										{merchant.domain}
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>

		<UserNav user={data.authInfo} />
	</nav>
</aside>

<!-- Mobile -->

<header
	class="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-transparent px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
>
	<Sheet.Root>
		<Sheet.Trigger>
			<Button size="icon" variant="outline" class="sm:hidden">
				<PanelLeft class="h-5 w-5" />
				<span class="sr-only">Toggle Menu</span>
			</Button>
		</Sheet.Trigger>
		<Sheet.Content side="left" class="sm:max-w-xs">
			<nav class="grid gap-6 text-lg font-medium">
				<a
					href="/admin"
					class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
				>
					<img
						src="/favicon.png"
						class="h-6 w-6 transition-all group-hover:scale-110"
						alt="firmly logo"
					/>
					<span class="sr-only">firmly Inc</span>
				</a>
				{#each navOptions as { icon: Icon, label, href } (label)}
					{@const isSelected =
						href === '/admin' ? currentPath === '/admin' : currentPath.includes(href)}
					<a
						{href}
						class={[
							'flex items-center gap-4 px-2.5',
							isSelected
								? 'rounded-md bg-muted py-2 text-black'
								: 'text-gray-500 hover:text-black'
						]}
					>
						<Icon class="h-5 w-5" />
						{label}
					</a>
				{/each}
			</nav>
		</Sheet.Content>
	</Sheet.Root>
	<div class="relative ml-auto flex-1 md:grow-0"></div>
	<div class="md:hidden">
		<UserNav user={data.authInfo} />
	</div>
</header>
