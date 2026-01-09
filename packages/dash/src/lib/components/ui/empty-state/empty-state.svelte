<script>
	import * as Card from '$lib/components/ui/card/index.js';

	let { icon: Icon = null, title = '', description = '', class: className = '' } = $props();
</script>

<Card.Root class={className}>
	<Card.Content class="py-12 text-center">
		{#if Icon}
			<Icon class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
		{/if}
		<h3 class="mb-2 text-lg font-medium">{title}</h3>
		{#if description}
			<p class="text-muted-foreground">
				{description}
			</p>
		{/if}
	</Card.Content>
</Card.Root>
