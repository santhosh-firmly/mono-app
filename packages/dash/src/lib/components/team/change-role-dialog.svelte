<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let {
		open = $bindable(false),
		memberEmail = '',
		currentRole = '',
		onSubmit = async () => {},
		isSubmitting = false,
		error = ''
	} = $props();

	let newRole = $state(currentRole);

	// Reset role when dialog opens
	$effect(() => {
		if (open) {
			newRole = currentRole;
		}
	});

	async function handleSubmit() {
		if (newRole === currentRole) {
			open = false;
			return;
		}
		await onSubmit(newRole);
	}

	function handleOpenChange(isOpen) {
		open = isOpen;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Change Role</Dialog.Title>
			<Dialog.Description>
				Update the role for <strong>{memberEmail}</strong>
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="newRole">New Role</Label>
				<select
					id="newRole"
					bind:value={newRole}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					disabled={isSubmitting}
				>
					<option value="owner">Owner - Full access + manage team</option>
					<option value="editor">Editor - Edit merchant settings</option>
					<option value="viewer">Viewer - Read-only access</option>
				</select>
			</div>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Updating...
				{:else}
					Save Changes
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
