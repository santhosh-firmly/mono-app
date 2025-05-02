<script>
	let { title, description } = $props();
</script>

<div class="flex flex-col">
	<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
	{#if description}
		<p class="text-muted-foreground">{description}</p>
	{/if}
</div>
