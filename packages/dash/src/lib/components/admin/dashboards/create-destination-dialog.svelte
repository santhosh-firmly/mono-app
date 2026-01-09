<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import RefreshCcw from 'lucide-svelte/icons/refresh-ccw';

	let {
		open = $bindable(false),
		onSubmit = async () => {},
		isSubmitting = false,
		error = ''
	} = $props();

	let form = $state({ appId: '', subject: '', isComingSoon: false, isSystem: false });

	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	let isValidUUID = $derived(uuidPattern.test(form.appId));

	async function handleSubmit() {
		await onSubmit(form);
		if (!error) {
			form = { appId: '', subject: '', isComingSoon: false, isSystem: false };
		}
	}

	function handleOpenChange(isOpen) {
		open = isOpen;
		if (!isOpen) {
			form = { appId: '', subject: '', isComingSoon: false, isSystem: false };
		}
	}

	function generateUUID() {
		form.appId = crypto.randomUUID();
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Create Destination</Dialog.Title>
			<Dialog.Description>Create a new destination partner configuration.</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="appId">App ID</Label>
				<div class="flex gap-2">
					<Input
						id="appId"
						bind:value={form.appId}
						disabled={isSubmitting}
						class="flex-1"
						pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
						placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
					/>
					<Button
						variant="outline"
						size="icon"
						onclick={generateUUID}
						disabled={isSubmitting}
						title="Generate UUID"
					>
						<RefreshCcw class="h-4 w-4" />
					</Button>
				</div>
				<p class="text-xs text-muted-foreground">
					Must be a valid UUID. Use the generate button to create one.
				</p>
			</div>

			<div class="grid gap-2">
				<Label for="subject">Subject</Label>
				<Input
					id="subject"
					bind:value={form.subject}
					placeholder="My Destination"
					disabled={isSubmitting}
				/>
				<p class="text-xs text-muted-foreground">Display name for this destination</p>
			</div>

			<div class="flex items-center gap-2">
				<Checkbox
					id="isComingSoon"
					bind:checked={form.isComingSoon}
					disabled={isSubmitting}
				/>
				<Label for="isComingSoon" class="text-sm font-normal cursor-pointer"
					>Coming Soon</Label
				>
			</div>

			<div class="flex items-center gap-2">
				<Checkbox id="isSystem" bind:checked={form.isSystem} disabled={isSubmitting} />
				<Label for="isSystem" class="text-sm font-normal cursor-pointer"
					>System Destination</Label
				>
			</div>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting || !isValidUUID || !form.subject}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Creating...
				{:else}
					Create Destination
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
