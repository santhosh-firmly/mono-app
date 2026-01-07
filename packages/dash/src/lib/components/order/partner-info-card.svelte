<script>
	import Store from 'lucide-svelte/icons/store';
	import * as Card from '$lib/components/ui/card/index.js';

	let { name = '', title = 'Partner' } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<Store class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
				<Store class="h-5 w-5 text-muted-foreground" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">{name || 'Unknown Partner'}</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
