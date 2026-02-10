<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		open = $bindable(false),
		title = 'Confirm',
		description = '',
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		variant = 'default', // 'default' | 'destructive' | 'warning'
		onConfirm = () => {},
		onCancel = () => {}
	} = $props();

	function handleOpenChange(value) {
		if (!value) onCancel();
		open = value;
	}

	function handleConfirm() {
		onConfirm();
		open = false;
	}

	let confirmButtonClass = $derived(
		variant === 'destructive'
			? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
			: variant === 'warning'
				? 'bg-amber-600 text-white hover:bg-amber-700'
				: ''
	);
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class={variant === 'warning' ? 'text-amber-600' : ''}>{title}</Dialog.Title>
			<Dialog.Description>
				{description}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={onCancel}>{cancelText}</Button>
			<Button class={confirmButtonClass} onclick={handleConfirm}>{confirmText}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
