<script>
	let { title, description, children } = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="flex flex-col">
		<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
		{#if description}
			<p class="text-muted-foreground">{description}</p>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</div>
