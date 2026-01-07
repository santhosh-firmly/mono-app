<script>
	import User from 'lucide-svelte/icons/user';
	import Mail from 'lucide-svelte/icons/mail';
	import Phone from 'lucide-svelte/icons/phone';
	import * as Card from '$lib/components/ui/card/index.js';
	import { displayFromHash } from '$lib/order-utils.js';

	let { email = '', phone = '', maskValues = true, title = 'Customer Information' } = $props();

	function displayValue(value) {
		if (!value) return '-';
		return maskValues ? displayFromHash(value) : value;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<User class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-3">
		<div class="flex items-center gap-2 text-sm">
			<Mail class="h-4 w-4 text-muted-foreground" />
			<span class="truncate">
				{displayValue(email)}
			</span>
		</div>
		<div class="flex items-center gap-2 text-sm">
			<Phone class="h-4 w-4 text-muted-foreground" />
			<span>{displayValue(phone)}</span>
		</div>
	</Card.Content>
</Card.Root>
