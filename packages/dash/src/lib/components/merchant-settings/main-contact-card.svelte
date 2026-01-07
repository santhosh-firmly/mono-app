<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import User from 'lucide-svelte/icons/user';

	let {
		contactName = $bindable(''),
		contactEmail = $bindable(''),
		contactPhone = $bindable(''),
		disabled = false
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
				<User class="h-5 w-5 text-green-600" />
			</div>
			<div>
				<Card.Title>Main Contact</Card.Title>
				<Card.Description>Primary point of contact for this merchant</Card.Description>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<div class="space-y-2">
				<Label for="contactName">Contact Name</Label>
				<Input
					id="contactName"
					bind:value={contactName}
					placeholder="John Doe"
					{disabled}
				/>
			</div>
			<div class="space-y-2">
				<Label for="contactEmail">Email</Label>
				<Input
					id="contactEmail"
					type="email"
					bind:value={contactEmail}
					placeholder="john@example.com"
					{disabled}
				/>
			</div>
			<div class="space-y-2">
				<Label for="contactPhone">Phone (optional)</Label>
				<Input
					id="contactPhone"
					type="tel"
					bind:value={contactPhone}
					placeholder="+1-555-123-4567"
					{disabled}
				/>
			</div>
		</div>
	</Card.Content>
</Card.Root>
