<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import TriangleAlert from 'lucide-svelte/icons/triangle-alert';

	let {
		open = $bindable(false),
		domain = '',
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
			<Dialog.Title class="flex items-center gap-2 text-red-600">
				<TriangleAlert class="h-5 w-5" />
				Reset Dashboard?
			</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to reset the dashboard for <strong>{domain}</strong>?
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
				<p class="font-medium">This action will permanently delete:</p>
				<ul class="mt-2 list-inside list-disc space-y-1">
					<li>All team members and their access</li>
					<li>Signed merchant agreement</li>
					<li>All onboarding progress</li>
					<li>Catalog configuration</li>
					<li>Integration steps progress</li>
					<li>KYB approval status</li>
					<li>Go Live approval status</li>
					<li>All audit logs</li>
					<li>Any pending invitations</li>
				</ul>
			</div>
			<p class="mt-4 text-sm text-muted-foreground">
				The dashboard will be reset to its initial state, as if it was never configured.
				This action cannot be undone.
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
					Resetting...
				{:else}
					<RotateCcw class="mr-2 h-4 w-4" />
					Reset Dashboard
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
