<script>
	let { title, description, children } = $props();
</script>

<div class="flex items-start justify-between gap-4">
	<div>
		<h1 class="text-2xl font-semibold text-foreground">{title}</h1>
		{#if description}
			<p class="text-sm text-muted-foreground mt-1">{description}</p>
		{/if}
	</div>
	{#if children}
		<div class="flex-shrink-0">
			{@render children()}
		</div>
	{/if}
</div>
