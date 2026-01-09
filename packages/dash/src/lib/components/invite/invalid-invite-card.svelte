<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import XCircle from 'lucide-svelte/icons/x-circle';

	let {
		title = 'Invalid Invitation',
		error = 'This invitation link is not valid.',
		href = '/',
		buttonText = 'Go to Home',
		buttonVariant = 'outline'
	} = $props();
</script>

<Card.Root class="w-full max-w-md">
	<Card.Header class="text-center">
		<div
			class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
		>
			<XCircle class="h-8 w-8 text-red-600" />
		</div>
		<Card.Title class="text-xl">{title}</Card.Title>
		<Card.Description class="text-base">
			{error}
		</Card.Description>
	</Card.Header>
	<Card.Footer class="justify-center">
		<Button variant={buttonVariant} {href}>{buttonText}</Button>
	</Card.Footer>
</Card.Root>
