<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';

	let {
		open = $bindable(false),
		title = 'Confirm Action',
		description = 'Are you sure you want to proceed?',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		variant = 'destructive',
		onConfirm = async () => {},
		isSubmitting = false,
		error = '',
		icon: Icon = AlertTriangle
	} = $props();

	function handleOpenChange(isOpen) {
		if (!isSubmitting) {
			open = isOpen;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				{#if Icon}
					<Icon class="h-5 w-5 text-red-500" />
				{/if}
				{title}
			</Dialog.Title>
			<Dialog.Description>
				{description}
			</Dialog.Description>
		</Dialog.Header>

		{#if error}
			<div class="py-2">
				<p class="text-sm text-red-600">{error}</p>
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				{cancelLabel}
			</Button>
			<Button {variant} onclick={onConfirm} disabled={isSubmitting}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Please wait...
				{:else}
					{confirmLabel}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
