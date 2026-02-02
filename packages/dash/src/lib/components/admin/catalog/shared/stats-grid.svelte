<script>
	import StatCard from './stat-card.svelte';

	let { stats = [], columns = 6, loading = false } = $props();

	const columnClasses = {
		3: 'grid-cols-1 md:grid-cols-3',
		4: 'grid-cols-2 md:grid-cols-4',
		5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
		6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
	};

	let gridClass = $derived(columnClasses[columns] || columnClasses[6]);
</script>

<div class="grid {gridClass} gap-4">
	{#each stats as stat (stat.label)}
		<StatCard
			icon={stat.icon}
			label={stat.label}
			value={stat.value}
			variant={stat.variant || 'default'}
			{loading}
		/>
	{/each}
</div>
