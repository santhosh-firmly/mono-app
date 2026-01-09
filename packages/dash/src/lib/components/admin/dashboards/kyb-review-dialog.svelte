<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Building2 from 'lucide-svelte/icons/building-2';
	import User from 'lucide-svelte/icons/user';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';

	let {
		open = $bindable(false),
		merchant = null,
		onApprove = async () => {},
		onReject = async () => {},
		isSubmitting = false,
		error = ''
	} = $props();

	let notes = $state('');

	function handleOpenChange(isOpen) {
		open = isOpen;
		if (!isOpen) {
			notes = '';
		}
	}

	async function handleApprove() {
		await onApprove(notes);
	}

	async function handleReject() {
		if (!notes.trim()) {
			return;
		}
		await onReject(notes);
	}
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>KYB Review: {merchant?.domain}</Dialog.Title>
			<Dialog.Description>
				Review the merchant's business information and approve or reject their KYB
				submission.
			</Dialog.Description>
		</Dialog.Header>

		{#if error}
			<div class="rounded-md border border-red-200 bg-red-50 p-3">
				<div class="flex items-center gap-2 text-red-700">
					<AlertCircle class="h-4 w-4" />
					<p class="text-sm">{error}</p>
				</div>
			</div>
		{/if}

		<div class="space-y-4 py-4">
			<!-- Company Info Section -->
			<Card.Root>
				<Card.Header class="pb-3">
					<div class="flex items-center gap-2">
						<Building2 class="h-5 w-5 text-muted-foreground" />
						<Card.Title class="text-base">Company Information</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-2 text-sm">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-muted-foreground">Company Name</p>
							<p class="font-medium">{merchant?.company?.name || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Employee Count</p>
							<p class="font-medium">{merchant?.company?.employeeCount || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Annual Revenue</p>
							<p class="font-medium">{merchant?.company?.annualRevenue || '-'}</p>
						</div>
					</div>
					{#if merchant?.company?.address}
						<div class="pt-2">
							<p class="text-muted-foreground">Address</p>
							<p class="font-medium">
								{#if merchant.company.address.street}
									{merchant.company.address.street}<br />
								{/if}
								{#if merchant.company.address.city || merchant.company.address.state || merchant.company.address.postalCode}
									{[
										merchant.company.address.city,
										merchant.company.address.state,
										merchant.company.address.postalCode
									]
										.filter(Boolean)
										.join(', ')}
									<br />
								{/if}
								{#if merchant.company.address.country}
									{merchant.company.address.country}
								{/if}
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Contact Info Section -->
			<Card.Root>
				<Card.Header class="pb-3">
					<div class="flex items-center gap-2">
						<User class="h-5 w-5 text-muted-foreground" />
						<Card.Title class="text-base">Main Contact</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-2 text-sm">
					<div class="grid grid-cols-2 gap-4">
						<div>
							<p class="text-muted-foreground">Name</p>
							<p class="font-medium">{merchant?.contact?.name || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Email</p>
							<p class="font-medium">{merchant?.contact?.email || '-'}</p>
						</div>
						<div>
							<p class="text-muted-foreground">Phone</p>
							<p class="font-medium">{merchant?.contact?.phone || '-'}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Link to full merchant dashboard -->
			<Button
				variant="outline"
				href={`/merchant/${merchant?.domain}`}
				target="_blank"
				class="w-full"
			>
				<ExternalLink class="mr-2 h-4 w-4" />
				View Full Merchant Dashboard
			</Button>

			<!-- Notes input -->
			<div class="space-y-2">
				<Label for="kyb-notes">Notes (required for rejection)</Label>
				<Textarea
					id="kyb-notes"
					bind:value={notes}
					placeholder="Add notes about your decision..."
					rows={3}
				/>
			</div>
		</div>

		<Dialog.Footer class="gap-2 sm:gap-0">
			<Button variant="outline" onclick={() => (open = false)} disabled={isSubmitting}>
				Cancel
			</Button>
			<Button
				variant="destructive"
				onclick={handleReject}
				disabled={isSubmitting || !notes.trim()}
			>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<X class="mr-2 h-4 w-4" />
				{/if}
				Reject
			</Button>
			<Button
				onclick={handleApprove}
				disabled={isSubmitting}
				class="bg-green-600 hover:bg-green-700"
			>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<Check class="mr-2 h-4 w-4" />
				{/if}
				Approve
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
