<script>
	import Badge from '$lib/components/ui/badge/badge.svelte';

	export let value;
</script>

{#if value}
	<Badge variant="secondary">
		{value}
	</Badge>
{/if}
