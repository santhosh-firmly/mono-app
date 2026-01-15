<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Rocket from 'lucide-svelte/icons/rocket';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import CheckCircle2 from 'lucide-svelte/icons/check-circle-2';
	import Circle from 'lucide-svelte/icons/circle';

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

	// Onboarding status checks (matching onboarding-tasks.svelte)
	let integrationComplete = $derived(merchant?.integration_complete === true);
	let agreementSigned = $derived(merchant?.agreement_signed === true);
	let kybApproved = $derived(merchant?.kyb_status === 'approved');
	let kybPending = $derived(merchant?.kyb_status === 'pending');
	let destinationsConfigured = $derived(merchant?.destinations_configured === true);
	let catalogConfigured = $derived(merchant?.catalog_configured === true);
	let cdnWhitelistingComplete = $derived(merchant?.cdn_whitelisting_complete === true);

	// Count completed tasks (excluding Go Live since that's what we're reviewing)
	let completedCount = $derived(
		[
			integrationComplete,
			agreementSigned,
			kybApproved,
			destinationsConfigured,
			catalogConfigured,
			cdnWhitelistingComplete
		].filter(Boolean).length
	);
	let totalTasks = 6;
	let allTasksComplete = $derived(completedCount === totalTasks);
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
	<Dialog.Content class="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Rocket class="h-5 w-5 text-green-600" />
				Go Live Review: {merchant?.domain}
			</Dialog.Title>
			<Dialog.Description>
				Review the merchant's configuration status and approve or reject their request to go
				live.
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
			<!-- Onboarding Status Summary -->
			<Card.Root>
				<Card.Header class="pb-3">
					<div class="flex items-center justify-between">
						<div>
							<Card.Title class="text-base">Onboarding Progress</Card.Title>
							<Card.Description>
								Summary of the merchant's onboarding tasks
							</Card.Description>
						</div>
						<div class="text-right">
							<span class="text-xl font-semibold">{completedCount}</span>
							<span class="text-sm text-muted-foreground">/{totalTasks}</span>
						</div>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3">
					<!-- 1. Complete Integration -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if integrationComplete}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Complete integration</span>
						</div>
						<Badge variant={integrationComplete ? 'default' : 'outline'}>
							{integrationComplete ? 'Completed' : 'In progress'}
						</Badge>
					</div>

					<!-- 2. Sign Merchant Agreement -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if agreementSigned}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Sign merchant agreement</span>
						</div>
						<Badge variant={agreementSigned ? 'default' : 'outline'}>
							{agreementSigned ? 'Signed' : 'Pending'}
						</Badge>
					</div>

					<!-- 3. Know Your Business (KYB) -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if kybApproved}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Know your business</span>
						</div>
						{#if kybApproved || kybPending || merchant?.kyb_status === 'rejected'}
							<Badge
								variant={kybApproved
									? 'default'
									: kybPending
										? 'secondary'
										: 'destructive'}
							>
								{kybApproved
									? 'Approved'
									: kybPending
										? 'Pending review'
										: 'Rejected'}
							</Badge>
						{/if}
					</div>

					<!-- 4. Configure Destinations -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if destinationsConfigured}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Configure destinations</span>
						</div>
						<Badge variant={destinationsConfigured ? 'default' : 'outline'}>
							{destinationsConfigured ? 'Configured' : 'Pending'}
						</Badge>
					</div>

					<!-- 5. Configure Product Catalog -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if catalogConfigured}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Configure product catalog</span>
						</div>
						<Badge variant={catalogConfigured ? 'default' : 'outline'}>
							{catalogConfigured ? 'Configured' : 'Pending'}
						</Badge>
					</div>

					<!-- 6. Complete CDN Whitelisting -->
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if cdnWhitelistingComplete}
								<CheckCircle2 class="h-4 w-4 text-green-600" />
							{:else}
								<Circle class="h-4 w-4 text-muted-foreground" />
							{/if}
							<span class="text-sm">Complete CDN whitelisting</span>
						</div>
						<Badge variant={cdnWhitelistingComplete ? 'default' : 'outline'}>
							{cdnWhitelistingComplete ? 'Completed' : 'Pending'}
						</Badge>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Company Details (if available) -->
			{#if merchant?.company?.name}
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Company Details</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-2 text-sm">
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-muted-foreground">Company Name</p>
								<p class="font-medium">{merchant.company.name}</p>
							</div>
							{#if merchant.company.employeeCount}
								<div>
									<p class="text-muted-foreground">Employee Count</p>
									<p class="font-medium">{merchant.company.employeeCount}</p>
								</div>
							{/if}
							{#if merchant.company.annualRevenue}
								<div>
									<p class="text-muted-foreground">Annual Revenue</p>
									<p class="font-medium">{merchant.company.annualRevenue}</p>
								</div>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

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
				<Label for="go-live-notes">Notes (required for rejection)</Label>
				<Textarea
					id="go-live-notes"
					bind:value={notes}
					placeholder="Add notes about your decision..."
					rows={3}
				/>
			</div>

			<!-- Warning when not all tasks are complete -->
			{#if !allTasksComplete}
				<div class="rounded-md border border-amber-200 bg-amber-50 p-3">
					<div class="flex items-center gap-2 text-amber-700">
						<AlertCircle class="h-4 w-4 shrink-0" />
						<p class="text-sm">
							Cannot approve Go Live until all onboarding tasks are completed ({completedCount}/{totalTasks}
							complete).
						</p>
					</div>
				</div>
			{/if}
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
				disabled={isSubmitting || !allTasksComplete}
				class="bg-green-600 hover:bg-green-700"
			>
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<Check class="mr-2 h-4 w-4" />
				{/if}
				Approve & Go Live
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
