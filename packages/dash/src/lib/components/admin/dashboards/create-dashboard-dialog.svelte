<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let {
		open = $bindable(false),
		onSubmit = async () => {},
		isSubmitting = false,
		error = ''
	} = $props();

	let form = $state({ domain: '', notes: '' });

	async function handleSubmit() {
		await onSubmit(form);
		if (!error) {
			form = { domain: '', notes: '' };
		}
	}

	function handleOpenChange(isOpen) {
		open = isOpen;
		if (!isOpen) {
			form = { domain: '', notes: '' };
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create Merchant Dashboard</Dialog.Title>
			<Dialog.Description>
				Enter the merchant's domain to create a new dashboard.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="domain">Domain</Label>
				<Input
					id="domain"
					bind:value={form.domain}
					placeholder="example.com"
					disabled={isSubmitting}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="notes">Notes (optional)</Label>
				<Input
					id="notes"
					bind:value={form.notes}
					placeholder="Internal notes..."
					disabled={isSubmitting}
				/>
			</div>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting || !form.domain}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Creating...
				{:else}
					Create Dashboard
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
