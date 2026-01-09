<script>
	import PageHeader from '$lib/components/app/page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { EmptyState } from '$lib/components/ui/empty-state/index.js';
	import Globe from 'lucide-svelte/icons/globe';
	import StoreIcon from 'lucide-svelte/icons/store';
	import Building2 from 'lucide-svelte/icons/building-2';
	import {
		InviteUserDialog,
		CancelInviteDialog,
		ResetDashboardDialog,
		KYBReviewDialog,
		GoLiveReviewDialog,
		DashboardsTable,
		DestinationsTable
	} from '$lib/components/admin/dashboards/index.js';

	let { data } = $props();

	// Local state for updates
	let dashboards = $state(data.dashboards || []);
	let destinations = $state(data.destinations || []);

	// Active tab
	let activeTab = $state('merchants');

	// Invite dialog state
	let showInviteDialog = $state(false);
	let inviteTarget = $state(''); // domain or appId
	let inviteType = $state('merchant'); // 'merchant' or 'destination'
	let isResend = $state(false);
	let initialEmail = $state('');
	let initialRole = $state('owner');
	let isInviting = $state(false);
	let inviteError = $state('');
	let inviteSuccess = $state('');

	// Cancel invite state
	let showCancelDialog = $state(false);
	let cancelTarget = $state('');
	let cancelType = $state('merchant');
	let cancelEmail = $state('');
	let isCancelling = $state(false);
	let cancelError = $state('');

	// Reset dashboard state
	let showResetDialog = $state(false);
	let resetTarget = $state('');
	let resetType = $state('merchant');
	let isResetting = $state(false);
	let resetError = $state('');

	// KYB review state
	let showKybDialog = $state(false);
	let kybReviewMerchant = $state(null);
	let isKybSubmitting = $state(false);
	let kybError = $state('');

	// Go Live review state
	let showGoLiveDialog = $state(false);
	let goLiveReviewMerchant = $state(null);
	let isGoLiveSubmitting = $state(false);
	let goLiveError = $state('');

	// ============================================================
	// MERCHANT HANDLERS
	// ============================================================

	function handleOpenMerchantInvite(domain) {
		inviteTarget = domain;
		inviteType = 'merchant';
		isResend = false;
		initialEmail = '';
		initialRole = 'owner';
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleResendMerchantInvite(domain, pendingInvite) {
		inviteTarget = domain;
		inviteType = 'merchant';
		isResend = true;
		initialEmail = pendingInvite.email;
		initialRole = pendingInvite.role;
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleOpenCancelMerchantInvite(domain, email) {
		cancelTarget = domain;
		cancelType = 'merchant';
		cancelEmail = email;
		cancelError = '';
		showCancelDialog = true;
	}

	function handleOpenResetMerchant(domain) {
		resetTarget = domain;
		resetType = 'merchant';
		resetError = '';
		showResetDialog = true;
	}

	function handleOpenKybReview(merchant) {
		kybReviewMerchant = merchant;
		kybError = '';
		showKybDialog = true;
	}

	async function handleApproveKyb(notes) {
		if (!kybReviewMerchant) return;

		isKybSubmitting = true;
		kybError = '';

		try {
			const response = await fetch(
				`/admin/api/kyb/${encodeURIComponent(kybReviewMerchant.domain)}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'approve', notes })
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to approve KYB');
			}

			// Update local state
			dashboards = dashboards.map((d) =>
				d.domain === kybReviewMerchant.domain
					? { ...d, kyb_status: 'approved', kyb_rejection_notes: null }
					: d
			);

			showKybDialog = false;
		} catch (error) {
			kybError = error.message;
		} finally {
			isKybSubmitting = false;
		}
	}

	async function handleRejectKyb(notes) {
		if (!kybReviewMerchant || !notes) return;

		isKybSubmitting = true;
		kybError = '';

		try {
			const response = await fetch(
				`/admin/api/kyb/${encodeURIComponent(kybReviewMerchant.domain)}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'reject', notes })
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to reject KYB');
			}

			// Update local state
			dashboards = dashboards.map((d) =>
				d.domain === kybReviewMerchant.domain
					? { ...d, kyb_status: 'rejected', kyb_rejection_notes: notes }
					: d
			);

			showKybDialog = false;
		} catch (error) {
			kybError = error.message;
		} finally {
			isKybSubmitting = false;
		}
	}

	function handleOpenGoLiveReview(merchant) {
		goLiveReviewMerchant = merchant;
		goLiveError = '';
		showGoLiveDialog = true;
	}

	async function handleApproveGoLive(notes) {
		if (!goLiveReviewMerchant) return;

		isGoLiveSubmitting = true;
		goLiveError = '';

		try {
			const response = await fetch(
				`/admin/api/go-live/${encodeURIComponent(goLiveReviewMerchant.domain)}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'approve', notes })
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to approve go live');
			}

			// Update local state
			dashboards = dashboards.map((d) =>
				d.domain === goLiveReviewMerchant.domain
					? { ...d, go_live_status: 'approved', go_live_rejection_notes: null }
					: d
			);

			showGoLiveDialog = false;
		} catch (error) {
			goLiveError = error.message;
		} finally {
			isGoLiveSubmitting = false;
		}
	}

	async function handleRejectGoLive(notes) {
		if (!goLiveReviewMerchant || !notes) return;

		isGoLiveSubmitting = true;
		goLiveError = '';

		try {
			const response = await fetch(
				`/admin/api/go-live/${encodeURIComponent(goLiveReviewMerchant.domain)}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'reject', notes })
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to reject go live');
			}

			// Update local state
			dashboards = dashboards.map((d) =>
				d.domain === goLiveReviewMerchant.domain
					? { ...d, go_live_status: 'rejected', go_live_rejection_notes: notes }
					: d
			);

			showGoLiveDialog = false;
		} catch (error) {
			goLiveError = error.message;
		} finally {
			isGoLiveSubmitting = false;
		}
	}

	// ============================================================
	// DESTINATION HANDLERS
	// ============================================================

	function handleOpenDestinationInvite(appId) {
		inviteTarget = appId;
		inviteType = 'destination';
		isResend = false;
		initialEmail = '';
		initialRole = 'owner';
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleResendDestinationInvite(appId, pendingInvite) {
		inviteTarget = appId;
		inviteType = 'destination';
		isResend = true;
		initialEmail = pendingInvite.email;
		initialRole = pendingInvite.role;
		inviteError = '';
		inviteSuccess = '';
		showInviteDialog = true;
	}

	function handleOpenCancelDestinationInvite(appId, email) {
		cancelTarget = appId;
		cancelType = 'destination';
		cancelEmail = email;
		cancelError = '';
		showCancelDialog = true;
	}

	function handleOpenResetDestination(appId) {
		resetTarget = appId;
		resetType = 'destination';
		resetError = '';
		showResetDialog = true;
	}

	// ============================================================
	// SHARED HANDLERS
	// ============================================================

	async function handleSendInvite(form) {
		if (!form.email) {
			inviteError = 'Email is required';
			return;
		}

		isInviting = true;
		inviteError = '';
		inviteSuccess = '';

		try {
			const endpoint =
				inviteType === 'merchant'
					? '/admin/api/invites/send'
					: '/admin/api/invites/send-destination';

			const body =
				inviteType === 'merchant'
					? { email: form.email, merchantDomain: inviteTarget, role: form.role }
					: { email: form.email, appId: inviteTarget, role: form.role };

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send invite');
			}

			inviteSuccess = `Invitation ${isResend ? 'resent' : 'sent'} to ${form.email}`;

			// Update the appropriate list
			if (inviteType === 'merchant') {
				dashboards = dashboards.map((d) =>
					d.domain === inviteTarget
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
			} else {
				destinations = destinations.map((d) =>
					d.appId === inviteTarget
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
			}

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
			const endpoint =
				cancelType === 'merchant'
					? '/admin/api/invites/cancel'
					: '/admin/api/invites/cancel-destination';

			const body =
				cancelType === 'merchant'
					? { merchantDomain: cancelTarget }
					: { appId: cancelTarget };

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to cancel invite');
			}

			// Update local state - remove pending invite
			if (cancelType === 'merchant') {
				dashboards = dashboards.map((d) =>
					d.domain === cancelTarget ? { ...d, pendingInvite: null, owner_email: null } : d
				);
			} else {
				destinations = destinations.map((d) =>
					d.appId === cancelTarget ? { ...d, pendingInvite: null, owner_email: null } : d
				);
			}

			showCancelDialog = false;
		} catch (error) {
			cancelError = error.message;
		} finally {
			isCancelling = false;
		}
	}

	async function handleConfirmReset() {
		isResetting = true;
		resetError = '';

		try {
			const endpoint =
				resetType === 'merchant'
					? `/admin/api/dashboards/${encodeURIComponent(resetTarget)}`
					: `/admin/api/destinations/${encodeURIComponent(resetTarget)}`;

			const response = await fetch(endpoint, { method: 'DELETE' });

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to reset dashboard');
			}

			// Update local state - reset dashboard to initial state
			if (resetType === 'merchant') {
				dashboards = dashboards.map((d) =>
					d.domain === resetTarget
						? {
								...d,
								owner_user_id: null,
								status: 'pending',
								pendingInvite: null,
								contact: null
							}
						: d
				);
			} else {
				destinations = destinations.map((d) =>
					d.appId === resetTarget
						? {
								...d,
								owner_user_id: null,
								status: 'pending',
								pendingInvite: null,
								contact: null
							}
						: d
				);
			}

			showResetDialog = false;
		} catch (error) {
			resetError = error.message;
		} finally {
			isResetting = false;
		}
	}

	// Computed display name for dialogs
	let dialogTargetName = $derived(
		inviteType === 'merchant'
			? inviteTarget
			: destinations.find((d) => d.appId === inviteTarget)?.displayName || inviteTarget
	);

	let cancelTargetName = $derived(
		cancelType === 'merchant'
			? cancelTarget
			: destinations.find((d) => d.appId === cancelTarget)?.displayName || cancelTarget
	);

	let resetTargetName = $derived(
		resetType === 'merchant'
			? resetTarget
			: destinations.find((d) => d.appId === resetTarget)?.displayName || resetTarget
	);
</script>

<div class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<PageHeader
		title="Dashboards"
		description="Manage merchant and destination dashboard access."
	/>

	{#if data.error}
		<Card.Root>
			<Card.Content class="py-8 text-center text-red-600">
				{data.error}
			</Card.Content>
		</Card.Root>
	{:else}
		<Tabs.Root bind:value={activeTab}>
			<Tabs.List class="w-fit">
				<Tabs.Trigger value="merchants" class="gap-2">
					<StoreIcon class="h-4 w-4" />
					Merchants ({dashboards.length})
				</Tabs.Trigger>
				<Tabs.Trigger value="destinations" class="gap-2">
					<Building2 class="h-4 w-4" />
					Destinations ({destinations.length})
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="merchants" class="mt-6">
				{#if dashboards.length === 0}
					<EmptyState
						icon={Globe}
						title="No merchants found"
						description="No merchants are configured in the system yet."
					/>
				{:else}
					<DashboardsTable
						{dashboards}
						onInvite={handleOpenMerchantInvite}
						onResend={handleResendMerchantInvite}
						onCancelInvite={handleOpenCancelMerchantInvite}
						onReset={handleOpenResetMerchant}
						onReviewKyb={handleOpenKybReview}
						onReviewGoLive={handleOpenGoLiveReview}
					/>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="destinations" class="mt-6">
				{#if destinations.length === 0}
					<EmptyState
						icon={Building2}
						title="No destinations found"
						description="No destinations are configured in the system yet."
					/>
				{:else}
					<DestinationsTable
						{destinations}
						onInvite={handleOpenDestinationInvite}
						onResend={handleResendDestinationInvite}
						onCancelInvite={handleOpenCancelDestinationInvite}
						onReset={handleOpenResetDestination}
					/>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>

<InviteUserDialog
	bind:open={showInviteDialog}
	domain={dialogTargetName}
	{isResend}
	{initialEmail}
	{initialRole}
	onSubmit={handleSendInvite}
	isSubmitting={isInviting}
	error={inviteError}
	success={inviteSuccess}
	dashboardType={inviteType}
/>

<CancelInviteDialog
	bind:open={showCancelDialog}
	domain={cancelTargetName}
	email={cancelEmail}
	onConfirm={handleConfirmCancelInvite}
	isSubmitting={isCancelling}
	error={cancelError}
/>

<ResetDashboardDialog
	bind:open={showResetDialog}
	domain={resetTargetName}
	onConfirm={handleConfirmReset}
	isSubmitting={isResetting}
	error={resetError}
/>

<KYBReviewDialog
	bind:open={showKybDialog}
	merchant={kybReviewMerchant}
	onApprove={handleApproveKyb}
	onReject={handleRejectKyb}
	isSubmitting={isKybSubmitting}
	error={kybError}
/>

<GoLiveReviewDialog
	bind:open={showGoLiveDialog}
	merchant={goLiveReviewMerchant}
	onApprove={handleApproveGoLive}
	onReject={handleRejectGoLive}
	isSubmitting={isGoLiveSubmitting}
	error={goLiveError}
/>
