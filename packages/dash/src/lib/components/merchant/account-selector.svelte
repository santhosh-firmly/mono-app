<script>
	import { goto } from '$app/navigation';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import MerchantAvatar from './merchant-avatar.svelte';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Check from 'lucide-svelte/icons/check';
	import LayoutGrid from 'lucide-svelte/icons/layout-grid';
	import Search from 'lucide-svelte/icons/search';

	/**
	 * @type {{ currentDomain: string, merchantAccess: Array<{domain: string, displayName?: string, role: string}> }}
	 */
	let { currentDomain, merchantAccess } = $props();

	let searchQuery = $state('');
	let popoverOpen = $state(false);
	let highlightedIndex = $state(-1);

	// Get current merchant's display name
	let currentMerchant = $derived(merchantAccess.find((m) => m.domain === currentDomain));
	let currentDisplayName = $derived(currentMerchant?.displayName || currentDomain);

	// Filter and sort merchants alphabetically
	let filteredMerchants = $derived(
		merchantAccess
			.filter((merchant) => {
				if (!searchQuery) return true;
				const query = searchQuery.toLowerCase();
				return (
					merchant.domain.toLowerCase().includes(query) ||
					(merchant.displayName && merchant.displayName.toLowerCase().includes(query))
				);
			})
			.sort((a, b) => {
				const nameA = (a.displayName || a.domain).toLowerCase();
				const nameB = (b.displayName || b.domain).toLowerCase();
				return nameA.localeCompare(nameB);
			})
	);

	// Reset search and highlighted index when popover closes
	$effect(() => {
		if (!popoverOpen) {
			searchQuery = '';
			highlightedIndex = -1;
		}
	});

	// Reset highlighted index when filter changes
	$effect(() => {
		// Access filteredMerchants to create dependency
		filteredMerchants;
		highlightedIndex = -1;
	});

	function handleKeydown(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (highlightedIndex < filteredMerchants.length - 1) {
				highlightedIndex++;
			} else {
				highlightedIndex = 0;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (highlightedIndex > 0) {
				highlightedIndex--;
			} else {
				highlightedIndex = filteredMerchants.length - 1;
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightedIndex >= 0 && highlightedIndex < filteredMerchants.length) {
				const selected = filteredMerchants[highlightedIndex];
				popoverOpen = false;
				goto(`/merchant/${selected.domain}`);
			}
		}
	}
</script>

<Popover.Root bind:open={popoverOpen}>
	<Popover.Trigger>
		<button
			class="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
		>
			<MerchantAvatar domain={currentDomain} size="sm" />
			<span class="max-w-32 truncate">{currentDisplayName}</span>
			<ChevronDown class="h-4 w-4 text-muted-foreground" />
		</button>
	</Popover.Trigger>
	<Popover.Content class="w-72 p-0" align="start">
		<div class="px-3 py-3 text-sm font-semibold text-muted-foreground">Your Dashboards</div>

		<!-- Search input -->
		{#if merchantAccess.length > 5}
			<div class="px-2 pb-2">
				<div class="relative">
					<Search
						class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						type="text"
						placeholder="Search dashboards..."
						class="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={searchQuery}
						onkeydown={handleKeydown}
					/>
				</div>
			</div>
		{/if}

		<div class="border-t" />

		<div class="max-h-64 overflow-y-auto py-1">
			{#each filteredMerchants as merchant, index (merchant.domain)}
				{@const isCurrentDomain = merchant.domain === currentDomain}
				{@const isHighlighted = index === highlightedIndex}
				<a
					href={`/merchant/${merchant.domain}`}
					class="flex w-full items-center gap-2 px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground {isCurrentDomain
						? 'bg-primary/5'
						: ''} {isHighlighted ? 'bg-accent text-accent-foreground' : ''}"
					onclick={() => (popoverOpen = false)}
					onmouseenter={() => (highlightedIndex = index)}
				>
					{#if isCurrentDomain}
						<Check class="h-4 w-4 text-primary" />
					{:else}
						<div class="h-4 w-4"></div>
					{/if}
					<MerchantAvatar domain={merchant.domain} size="sm" />
					<div class="flex flex-col">
						<span class="max-w-36 truncate" class:font-medium={isCurrentDomain}>
							{merchant.displayName || merchant.domain}
						</span>
						{#if merchant.displayName && merchant.displayName !== merchant.domain}
							<span class="max-w-36 truncate text-xs text-muted-foreground">
								{merchant.domain}
							</span>
						{/if}
					</div>
				</a>
			{:else}
				<div class="px-2 py-4 text-center text-sm text-muted-foreground">
					No dashboards found
				</div>
			{/each}
		</div>

		<div class="border-t" />

		<a
			href="/"
			class="flex w-full items-center gap-2 px-3 py-3 text-sm text-primary transition-colors hover:bg-accent"
			onclick={() => (popoverOpen = false)}
		>
			<LayoutGrid class="h-4 w-4" />
			View all dashboards
		</a>
	</Popover.Content>
</Popover.Root>
