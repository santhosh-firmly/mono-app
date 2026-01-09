<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Loader2 from 'lucide-svelte/icons/loader-2';

	let {
		open = $bindable(false),
		domain = '',
		isResend = false,
		initialEmail = '',
		initialRole = 'owner',
		onSubmit = async () => {},
		isSubmitting = false,
		error = '',
		success = '',
		dashboardType = 'merchant' // 'merchant' or 'destination'
	} = $props();

	let typeLabel = $derived(dashboardType === 'merchant' ? 'merchant' : 'destination');

	let form = $state({ email: initialEmail, role: initialRole });

	// Reset form when dialog opens with new values
	$effect(() => {
		if (open) {
			form = { email: initialEmail, role: initialRole };
		}
	});

	async function handleSubmit() {
		await onSubmit(form);
	}

	function handleOpenChange(isOpen) {
		open = isOpen;
		if (!isOpen) {
			form = { email: '', role: 'owner' };
		}
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>{isResend ? 'Resend' : 'Invite User to'} {domain}</Dialog.Title>
			<Dialog.Description>
				{isResend
					? 'Resend the invitation email. This will invalidate the previous invite link.'
					: `Send an invitation email to grant access to this ${typeLabel} dashboard.`}
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="email">Email Address</Label>
				<Input
					id="email"
					type="email"
					bind:value={form.email}
					placeholder="user@example.com"
					disabled={isSubmitting}
				/>
			</div>
			<div class="grid gap-2">
				<Label for="role">Role</Label>
				<select
					id="role"
					bind:value={form.role}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					disabled={isSubmitting}
				>
					<option value="owner">Owner - Full access + manage team</option>
					<option value="editor">Editor - Edit settings</option>
					<option value="viewer">Viewer - Read-only access</option>
				</select>
			</div>

			{#if error}
				<p class="text-sm text-red-600">{error}</p>
			{/if}
			{#if success}
				<p class="text-sm text-green-600">{success}</p>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting || !form.email}>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{isResend ? 'Resending...' : 'Sending...'}
				{:else if isResend}
					<RefreshCw class="mr-2 h-4 w-4" />
					Resend Invitation
				{:else}
					<Mail class="mr-2 h-4 w-4" />
					Send Invitation
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
