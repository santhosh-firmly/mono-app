<script>
	import * as Card from '$lib/components/ui/card/index.js';

	let { title, children, description, icon, spacing = 'space-y-4' } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			{#if icon}
				{@const Icon = icon}
				<Icon class="h-5 w-5"></Icon>
			{/if}
			{title}
		</Card.Title>
		{#if description}
			<Card.Description>{description}</Card.Description>
		{/if}
	</Card.Header>
	<Card.Content class={spacing}>
		{@render children()}
	</Card.Content>
</Card.Root>
