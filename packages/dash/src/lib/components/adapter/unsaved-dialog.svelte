<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let { open = false, onSave = () => {}, onDiscard = () => {}, onCancel = () => {} } = $props();

	function handleOpenChange(value) {
		if (!value) onCancel();
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Unsaved Changes</Dialog.Title>
			<Dialog.Description>
				You have unsaved changes in the current file. What would you like to do?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" on:click={onCancel}>Cancel</Button>
			<Button variant="secondary" on:click={onDiscard}>Discard</Button>
			<Button on:click={onSave}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
