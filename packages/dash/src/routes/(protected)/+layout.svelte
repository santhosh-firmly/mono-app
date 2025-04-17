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

	let { data, children } = $props();
</script>

<div class="flex min-h-screen w-full flex-col bg-background">
	<NavBar {data} currentPath={$page.url.pathname} />
	<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
		{@render children()}
	</div>
</div>
