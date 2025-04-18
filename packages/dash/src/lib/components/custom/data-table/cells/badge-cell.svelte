<script>
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Alert from 'lucide-svelte/icons/octagon-alert';

	let { value = 'Unconfigured' } = $props();
	let isUnconfigured = $derived(value === 'Unconfigured' || value.length <= 0);
</script>

<Badge variant="secondary">
	{#if isUnconfigured}
		<span class="flex items-center gap-x-2">
			<Alert class="w-3" />
			Unconfigured
		</span>
	{:else}
		{value}
	{/if}
</Badge>
