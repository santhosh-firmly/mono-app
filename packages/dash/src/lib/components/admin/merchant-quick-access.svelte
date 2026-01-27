<script>
	import { goto } from '$app/navigation';
	import Search from 'lucide-svelte/icons/search';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import MerchantAvatar from '$lib/components/merchant/merchant-avatar.svelte';

	let { merchants = [] } = $props();

	let merchantSearchOpen = $state(false);
	let searchQuery = $state('');

	let filteredMerchants = $derived(
		merchants
			.filter((m) => m.domain.toLowerCase().includes(searchQuery.toLowerCase()))
			.slice(0, 10)
	);

	function handleMerchantSelect(domain) {
		merchantSearchOpen = false;
		searchQuery = '';
		goto(`/merchant/${domain}`);
	}
</script>

<Popover.Root bind:open={merchantSearchOpen}>
	<Popover.Trigger>
		<button
			class="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
		>
			<Search class="h-4 w-4" />
			<span class="hidden md:inline">Quick access...</span>
		</button>
	</Popover.Trigger>
	<Popover.Content class="w-72 p-0" align="start">
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
