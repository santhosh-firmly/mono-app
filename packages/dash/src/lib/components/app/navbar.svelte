<script>
	import House from 'lucide-svelte/icons/house';
	import Store from 'lucide-svelte/icons/store';
	import PanelLeft from 'lucide-svelte/icons/panel-left';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import UserNav from './user-nav.svelte';

	let { data, currentPath } = $props();

	let navOptions = [
		{
			icon: House,
			label: 'Dashboard',
			href: '/'
		},
		{
			icon: Store,
			label: 'Merchants',
			href: '/merchants'
		}
	];
</script>

<aside class="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r bg-background sm:flex">
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
		{#each navOptions as { icon: Icon, label, href } (label)}
			{@const isSelected = href === '/' ? currentPath === '/' : currentPath.includes(href)}

			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<a
						{href}
						class={[
							'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
							isSelected ? 'bg-muted text-black' : 'text-gray-500 hover:text-black'
						]}
						use:builder.action
						{...builder}
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
		<UserNav user={data.authInfo} />
	</nav>
</aside>

<!-- Mobile -->

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
				{#each navOptions as { icon: Icon, label, href } (label)}
					{@const isSelected = href === '/' ? currentPath === '/' : currentPath.includes(href)}
					<a
						{href}
						class={[
							'flex items-center gap-4 px-2.5',
							isSelected ? 'rounded-md bg-muted py-2 text-black' : 'text-gray-500 hover:text-black'
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
