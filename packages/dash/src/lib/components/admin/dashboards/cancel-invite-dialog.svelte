<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import MailX from 'lucide-svelte/icons/mail-x';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let {
		open = $bindable(false),
		domain = '',
		email = '',
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
			<Dialog.Title>Cancel Invitation?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to cancel the invitation for <strong>{email}</strong> to
				access
				<strong>{domain}</strong>?
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<p class="text-sm text-muted-foreground">
				The invitation link will be invalidated and the user will no longer be able to
				accept it.
			</p>

			{#if error}
				<p class="mt-4 text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Keep Invitation
			</Button>
			<Button variant="destructive" onclick={onConfirm} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Cancelling...
				{:else}
					<MailX class="mr-2 h-4 w-4" />
					Cancel Invitation
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
