<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import UserX from 'lucide-svelte/icons/user-x';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let {
		open = $bindable(false),
		memberEmail = '',
		onConfirm = async () => {},
		isSubmitting = false,
		error = ''
	} = $props();

	function handleOpenChange(isOpen) {
		open = isOpen;
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Remove Team Member?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to remove <strong>{memberEmail}</strong> from this dashboard?
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<p class="text-sm text-muted-foreground">
				They will lose access to this dashboard immediately. You can invite them again later
				if needed.
			</p>

			{#if error}
				<p class="mt-4 text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button variant="destructive" onclick={onConfirm} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Removing...
				{:else}
					<UserX class="mr-2 h-4 w-4" />
					Remove Member
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
