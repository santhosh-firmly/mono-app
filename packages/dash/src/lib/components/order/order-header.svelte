<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatDate } from 'date-fns';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';

	let {
		orderNumber,
		status = 'Completed',
		createdAt,
		dateFormat = "MMM dd 'at' h:mmaaa"
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-start justify-between">
			<div>
				<Card.Title class="flex items-center gap-2">
					Order #{orderNumber}
					<CopyToClipboard value={orderNumber} />
				</Card.Title>
				{#if createdAt}
					<Card.Description>
						Placed on {formatDate(createdAt, dateFormat)}
					</Card.Description>
				{/if}
			</div>
			<Badge variant="outline">
				{status}
			</Badge>
		</div>
	</Card.Header>
</Card.Root>
