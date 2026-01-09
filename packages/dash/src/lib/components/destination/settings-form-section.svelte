<script>
	import * as Card from '$lib/components/ui/card/index.js';

	let { icon: Icon = null, title = '', description = '', children } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			{#if Icon}
				<Icon class="h-5 w-5" />
			{/if}
			{title}
		</Card.Title>
		{#if description}
			<Card.Description>{description}</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content>
		{@render children()}
	</Card.Content>
</Card.Root>
