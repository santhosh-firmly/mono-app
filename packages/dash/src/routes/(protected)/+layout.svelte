<script>
	import '../../app.css';
	import UserNav from '$lib/components/ui/data-table/user-nav.svelte';

	import House from 'lucide-svelte/icons/house';
	// import Store from 'lucide-svelte/icons/store';
	// import ChartLine from 'lucide-svelte/icons/chart-line';
	// import Package from 'lucide-svelte/icons/package';
	import Package2 from 'lucide-svelte/icons/package-2';
	import PanelLeft from 'lucide-svelte/icons/panel-left';
	// import Search from 'lucide-svelte/icons/search';
	import Settings from 'lucide-svelte/icons/settings';
	// import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
	// import UsersRound from 'lucide-svelte/icons/users-round';

	// import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	// import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	// import { Input } from '$lib/components/ui/input/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	// import { page } from '$app/stores';

	export let data;
</script>

<div class="flex min-h-screen w-full flex-col bg-background">
	<aside class="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-transparent sm:flex">
		<nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
			<a
				href="/"
				class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
			>
				<img
					src="/favicon.png"
					class="h-6 w-6 transition-all group-hover:scale-110"
					alt="firmly logo"
				/>
				<span class="sr-only">firmly Inc</span>
			</a>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/"
						class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-black"
						use:builder.action
						{...builder}
					>
						<House class="h-4 w-4" />
						<span class="sr-only">Dashboard</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Dashboard</Tooltip.Content>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="/merchants"
						class="flex h-10 w-10 items-center justify-center rounded-lg {$page.url.pathname.includes(
							'/merchants'
						)
							? 'bg-muted text-black'
							: 'text-gray-500 hover:text-black'} transition-colors"
						use:builder.action
						{...builder}
					>
						<Store class="h-4 w-4" />
						<span class="sr-only">Merchants</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Merchants</Tooltip.Content>
			</Tooltip.Root>
		</nav>
		<nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						href="##"
						class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:text-black"
						use:builder.action
						{...builder}
					>
						<Settings class="h-4 w-4" />
						<span class="sr-only">Settings</span>
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Settings</Tooltip.Content>
			</Tooltip.Root>
		</nav>
	</aside>
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
		<header
			class="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-transparent px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
		>
			<Sheet.Root>
				<Sheet.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
						<PanelLeft class="h-5 w-5" />
						<span class="sr-only">Toggle Menu</span>
					</Button>
				</Sheet.Trigger>
				<Sheet.Content side="left" class="sm:max-w-xs">
					<nav class="grid gap-6 text-lg font-medium">
						<a
							href="/"
							class="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
						>
							<img
								src="/favicon.png"
								class="h-6 w-6 transition-all group-hover:scale-110"
								alt="firmly logo"
							/>
							<span class="sr-only">firmly Inc</span>
						</a>
						<a href="/" class="flex items-center gap-4 px-2.5 text-gray-500 hover:text-black">
							<House class="h-5 w-5" />
							Dashboard
						</a>
						<a
							href="/merchants"
							class="flex items-center gap-4 px-2.5 {$page.url.pathname.includes('/merchants')
								? 'rounded-md bg-muted py-2 text-black'
								: 'text-gray-500 hover:text-black'}"
						>
							<Store class="h-5 w-5" />
							Merchants
						</a>
					</nav>
				</Sheet.Content>
			</Sheet.Root>
			<div class="relative ml-auto flex-1 md:grow-0"></div>
			<UserNav user={data.authInfo} />
		</header>
		<slot></slot>
	</div>
</div>
