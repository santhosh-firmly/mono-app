<script>
	import * as Select from '$lib/components/ui/select/index.js';
	import Store from 'lucide-svelte/icons/store';

	/**
	 * @type {{
	 *   merchants: Array<{domain: string, displayName: string}>,
	 *   selectedMerchant: string | null,
	 *   onchange: (merchant: string | null) => void
	 * }}
	 */
	let { merchants = [], selectedMerchant = null, onchange } = $props();

	// Handle selection change
	function handleSelect(selected) {
		if (selected === '__all__' || !selected) {
			onchange(null);
		} else {
			onchange(selected);
		}
	}
</script>

<Select.Root type="single" value={selectedMerchant || '__all__'} onValueChange={handleSelect}>
	<Select.Trigger class="w-[200px]">
		<Store class="h-4 w-4 mr-2 text-muted-foreground" />
		{#if selectedMerchant}
			{merchants.find((m) => m.domain === selectedMerchant)?.displayName || selectedMerchant}
		{:else}
			All Merchants
		{/if}
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="__all__">All Merchants</Select.Item>
		<Select.Separator />
		{#each merchants as merchant (merchant.domain)}
			<Select.Item value={merchant.domain}>
				{merchant.displayName}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
