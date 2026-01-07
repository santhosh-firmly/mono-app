<script>
	import { goto, invalidateAll } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Globe from 'lucide-svelte/icons/globe';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Shield from 'lucide-svelte/icons/shield';
	import Mail from 'lucide-svelte/icons/mail';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import Search from 'lucide-svelte/icons/search';
	import FirmlyLogo from '$lib/components/firmly-logo.svelte';
	import MerchantUserMenu from '$lib/components/merchant/merchant-user-menu.svelte';
	import MerchantAvatar from '$lib/components/merchant/merchant-avatar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
	let declining = $state({});
	let searchQuery = $state('');
	let highlightedIndex = $state(-1);

	// Filter and sort dashboards alphabetically
	let filteredDashboards = $derived(
		data.dashboards
			.filter((dashboard) => {
				if (!searchQuery) return true;
				const query = searchQuery.toLowerCase();
				return (
					dashboard.domain.toLowerCase().includes(query) ||
					(dashboard.displayName && dashboard.displayName.toLowerCase().includes(query))
				);
			})
			.sort((a, b) => {
				const nameA = (a.displayName || a.domain).toLowerCase();
				const nameB = (b.displayName || b.domain).toLowerCase();
				return nameA.localeCompare(nameB);
			})
	);

	// Reset highlighted index when filter changes
	$effect(() => {
		// Access filteredDashboards to create dependency
		filteredDashboards;
		highlightedIndex = -1;
	});

	function handleKeydown(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (highlightedIndex < filteredDashboards.length - 1) {
				highlightedIndex++;
			} else {
				highlightedIndex = 0;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (highlightedIndex > 0) {
				highlightedIndex--;
			} else {
				highlightedIndex = filteredDashboards.length - 1;
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightedIndex >= 0 && highlightedIndex < filteredDashboards.length) {
				const selected = filteredDashboards[highlightedIndex];
				goto(`/merchant/${selected.domain}`);
			}
		}
	}

	const roleLabels = {
		owner: 'Owner',
		editor: 'Editor',
		viewer: 'Viewer'
	};

	const roleVariants = {
		owner: 'default',
		editor: 'secondary',
		viewer: 'outline'
	};

	function formatExpiry(expiresAt) {
		if (!expiresAt) return '';
		const date = new Date(expiresAt);
		const now = new Date();
		const diffMs = date - now;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return 'Expired';
		if (diffDays === 0) return 'Expires today';
		if (diffDays === 1) return 'Expires tomorrow';
		return `Expires in ${diffDays} days`;
	}

	async function declineInvite(token) {
		declining[token] = true;
		try {
			const response = await fetch('/api/invites/decline', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			if (response.ok) {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Error declining invite:', error);
		} finally {
			declining[token] = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Firmly Admin Banner -->
	{#if data.isFirmlyAdmin}
		<div class="flex items-center justify-between bg-primary px-4 py-2 text-primary-foreground">
			<div class="flex items-center gap-2">
				<Shield class="h-4 w-4" />
				<span class="text-sm font-medium">Viewing as Firmly Admin</span>
			</div>
			<Button
				variant="ghost"
				size="sm"
				href="/admin"
				class="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
			>
				Go to Admin Panel
			</Button>
		</div>
	{/if}

	<!-- Header -->
	<header
		class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6"
	>
		<a href="/" class="flex items-center gap-2">
			<FirmlyLogo size="sm" />
		</a>
		<MerchantUserMenu user={data.user} />
	</header>

	<!-- Main Content -->
	<main class="flex flex-1 items-start justify-center p-4 pt-12 lg:p-8 lg:pt-16">
		<div class="w-full max-w-4xl space-y-8">
			<!-- Pending Invitations Section -->
			{#if data.pendingInvites?.length > 0}
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Mail class="h-5 w-5 text-amber-600" />
						<h2 class="text-lg font-semibold">Pending Invitations</h2>
					</div>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each data.pendingInvites as invite (invite.token)}
							<Card.Root class="border-amber-200 bg-amber-50/50">
								<Card.Content class="flex flex-col gap-4 p-6">
									<div class="flex items-start gap-3">
										<MerchantAvatar domain={invite.merchant_domain} size="lg" />
										<div class="min-w-0 flex-1">
											<h3 class="truncate font-medium text-foreground">
												{invite.merchant_domain}
											</h3>
											<div class="mt-1 flex items-center gap-2">
												<Badge
													variant={roleVariants[invite.role]}
													class="text-xs"
												>
													{roleLabels[invite.role] || invite.role}
												</Badge>
											</div>
										</div>
									</div>

									<div class="text-sm text-muted-foreground">
										{#if invite.invited_by_email || invite.isFirmlyAdmin}
											<p class="truncate">
												Invited by {invite.isFirmlyAdmin
													? 'Firmly'
													: invite.invited_by_email}
											</p>
										{/if}
										<p class="text-amber-700">
											{formatExpiry(invite.expires_at)}
										</p>
									</div>

									<div class="flex gap-2">
										<Button
											size="sm"
											class="flex-1"
											href={`/invite?token=${invite.token}`}
										>
											<Check class="mr-1 h-3 w-3" />
											Accept
										</Button>
										<Button
											size="sm"
											variant="outline"
											class="flex-1"
											onclick={() => declineInvite(invite.token)}
											disabled={declining[invite.token]}
										>
											<X class="mr-1 h-3 w-3" />
											Decline
										</Button>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				</div>
			{/if}

			{#if data.dashboards.length === 0 && (!data.pendingInvites || data.pendingInvites.length === 0)}
				<!-- Empty state - no dashboards and no pending invites -->
				<Card.Root class="mx-auto max-w-md">
					<Card.Content class="py-12 text-center">
						<Globe class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h2 class="mb-2 text-xl font-semibold">No Dashboards Available</h2>
						<p class="text-muted-foreground">
							{#if data.isFirmlyAdmin}
								No merchant dashboards have been created yet.
							{:else}
								You don't have access to any merchant dashboards yet. Please contact
								your administrator for an invitation.
							{/if}
						</p>
					</Card.Content>
				</Card.Root>
			{:else if data.dashboards.length > 0}
				<!-- Dashboard Selection -->
				<div class="mb-6 text-center">
					<h1 class="mb-2 text-2xl font-semibold">
						{#if data.isFirmlyAdmin}
							All Merchant Dashboards
						{:else}
							Select a Dashboard
						{/if}
					</h1>
					<p class="text-muted-foreground">
						{#if data.isFirmlyAdmin}
							Access any merchant dashboard as admin ({data.dashboards.length} total)
						{:else}
							Choose a merchant dashboard to manage
						{/if}
					</p>
				</div>

				<!-- Search Input -->
				{#if data.dashboards.length > 5}
					<div class="relative mx-auto mb-6 max-w-md">
						<Search
							class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="text"
							placeholder="Search dashboards..."
							class="pl-10"
							bind:value={searchQuery}
							onkeydown={handleKeydown}
						/>
					</div>
				{/if}

				<!-- Dashboard List -->
				<Card.Root>
					<div class="divide-y">
						{#each filteredDashboards as dashboard, index (dashboard.domain)}
							{@const isHighlighted = index === highlightedIndex}
							<a
								href={`/merchant/${dashboard.domain}`}
								class="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-primary/5 {isHighlighted
									? 'bg-primary/5'
									: ''}"
								onmouseenter={() => (highlightedIndex = index)}
							>
								<div class="flex items-center gap-4">
									<MerchantAvatar domain={dashboard.domain} size="md" />
									<div>
										<h3 class="font-medium text-foreground">
											{dashboard.displayName || dashboard.domain}
										</h3>
										{#if dashboard.displayName && dashboard.displayName !== dashboard.domain}
											<p class="text-sm text-muted-foreground">
												{dashboard.domain}
											</p>
										{:else}
											<p class="text-sm text-muted-foreground">
												Merchant Dashboard
											</p>
										{/if}
									</div>
								</div>
								<div
									class="flex items-center gap-2 text-sm font-medium text-primary transition-opacity {isHighlighted
										? 'opacity-100'
										: 'opacity-0 group-hover:opacity-100'}"
								>
									Open
									<ArrowRight class="h-4 w-4" />
								</div>
							</a>
						{:else}
							<div class="p-8 text-center text-muted-foreground">
								No dashboards match your search
							</div>
						{/each}
					</div>
				</Card.Root>
			{/if}
		</div>
	</main>
</div>
