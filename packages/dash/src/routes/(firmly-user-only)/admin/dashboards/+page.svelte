<script>
	import PageHeader from '$lib/components/app/page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Globe from 'lucide-svelte/icons/globe';
	import {
		InviteUserDialog,
		CancelInviteDialog,
		DashboardsTable
	} from '$lib/components/admin/dashboards/index.js';

	let { data } = $props();

	// Local dashboards state for updates
	let dashboards = $state(data.dashboards || []);

	// Invite dialog state
	let showInviteDialog = $state(false);
	let inviteDomain = $state('');
	let isResend = $state(false);
	let initialEmail = $state('');
	let initialRole = $state('owner');
	let isInviting = $state(false);
	let inviteError = $state('');
	let inviteSuccess = $state('');

	// Cancel invite state
	let showCancelDialog = $state(false);
	let cancelDomain = $state('');
	let cancelEmail = $state('');
	let isCancelling = $state(false);
	let cancelError = $state('');

	function handleOpenInvite(domain) {
		inviteDomain = domain;
		isResend = false;
		initialEmail = '';
		initialRole = 'owner';
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleResendInvite(domain, pendingInvite) {
		inviteDomain = domain;
		isResend = true;
		initialEmail = pendingInvite.email;
		initialRole = pendingInvite.role;
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleOpenCancelInvite(domain, email) {
		cancelDomain = domain;
		cancelEmail = email;
		cancelError = '';
		showCancelDialog = true;
	}

	async function handleSendInvite(form) {
		if (!form.email) {
			inviteError = 'Email is required';
			return;
		}

		isInviting = true;
		inviteError = '';
		inviteSuccess = '';

		try {
			const response = await fetch('/admin/api/invites/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: form.email,
					merchantDomain: inviteDomain,
					role: form.role
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send invite');
			}

			inviteSuccess = `Invitation ${isResend ? 'resent' : 'sent'} to ${form.email}`;

			// Update the dashboard in the list
			dashboards = dashboards.map((d) =>
				d.domain === inviteDomain
					? {
							...d,
							owner_email: form.email,
							pendingInvite: {
								email: form.email,
								role: form.role,
								expiresAt: result.expiresAt
							}
						}
					: d
			);

			// Close after short delay
			setTimeout(() => {
				inviteSuccess = '';
				showInviteDialog = false;
			}, 2000);
		} catch (error) {
			inviteError = error.message;
		} finally {
			isInviting = false;
		}
	}

	async function handleConfirmCancelInvite() {
		isCancelling = true;
		cancelError = '';

		try {
			const response = await fetch('/admin/api/invites/cancel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ merchantDomain: cancelDomain })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to cancel invite');
			}

			// Update local state - remove pending invite
			dashboards = dashboards.map((d) =>
				d.domain === cancelDomain ? { ...d, pendingInvite: null, owner_email: null } : d
			);

			showCancelDialog = false;
		} catch (error) {
			cancelError = error.message;
		} finally {
			isCancelling = false;
		}
	}
</script>

<div class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<PageHeader
		title="Merchant Dashboards"
		description="Manage merchant dashboard access and invitations."
	/>

	{#if data.error}
		<Card.Root>
			<Card.Content class="py-8 text-center text-red-600">
				{data.error}
			</Card.Content>
		</Card.Root>
	{:else if dashboards.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<Globe class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-lg font-medium">No merchants found</h3>
				<p class="text-muted-foreground">No merchants are configured in the system yet.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<DashboardsTable
			{dashboards}
			onInvite={handleOpenInvite}
			onResend={handleResendInvite}
			onCancelInvite={handleOpenCancelInvite}
		/>
	{/if}
</div>

<InviteUserDialog
	bind:open={showInviteDialog}
	domain={inviteDomain}
	{isResend}
	{initialEmail}
	{initialRole}
	onSubmit={handleSendInvite}
	isSubmitting={isInviting}
	error={inviteError}
	success={inviteSuccess}
/>

<CancelInviteDialog
	bind:open={showCancelDialog}
	domain={cancelDomain}
	email={cancelEmail}
	onConfirm={handleConfirmCancelInvite}
	isSubmitting={isCancelling}
	error={cancelError}
/>
