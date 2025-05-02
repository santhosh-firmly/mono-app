<script>
	let { title, children, description, icon, spacing = 'space-y-4' } = $props();
</script>

<div class="m-0 rounded-none border-0 border-b pb-10 pt-4 shadow-none">
	<div class="mb-6">
		<h3 class="flex items-center gap-2 text-lg font-bold">
			{#if icon}
				{@const Icon = icon}
				<Icon class="h-5 w-5"></Icon>
			{/if}
			{title}
		</h3>
		{#if description}
			<p class="text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>
	<div class={spacing}>
		{@render children()}
	</div>
</div>
