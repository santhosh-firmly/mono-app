<script>
	import Clock from 'lucide-svelte/icons/clock';

	/**
	 * @typedef {Object} Contact
	 * @property {string} [name]
	 * @property {string} [email]
	 */

	/**
	 * @typedef {Object} PendingInvite
	 * @property {string} email
	 */

	let { contact = null, pendingInvite = null } = $props();

	let hasContact = $derived(contact?.name || contact?.email);
</script>

{#if hasContact}
	<div class="flex flex-col gap-0.5">
		{#if contact.name}
			<span class="text-sm font-medium">{contact.name}</span>
		{/if}
		{#if contact.email}
			<span class="text-xs text-muted-foreground">{contact.email}</span>
		{/if}
	</div>
{:else if pendingInvite}
	<div class="flex flex-col gap-1">
		<span class="text-sm">{pendingInvite.email}</span>
		<span class="flex items-center gap-1 text-xs text-amber-600">
			<Clock class="h-3 w-3" />
			Invite pending
		</span>
	</div>
{:else}
	<span class="text-sm text-muted-foreground">Not set</span>
{/if}
