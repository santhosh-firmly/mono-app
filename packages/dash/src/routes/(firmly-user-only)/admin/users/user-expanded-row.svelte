<script>
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import User from 'lucide-svelte/icons/user';
	import Building from 'lucide-svelte/icons/building';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import Store from 'lucide-svelte/icons/store';
	import X from 'lucide-svelte/icons/x';

	let { userId = '', email = '', onAccessRevoked = () => {} } = $props();

	let isLoading = $state(true);
	let error = $state(null);
	let profile = $state(null);
	let merchantAccess = $state([]);
	let revokingDomain = $state(null);

	$effect(() => {
		if (userId) {
			loadUserDetails();
		}
	});

	async function loadUserDetails() {
		isLoading = true;
		error = null;

		try {
			const response = await fetch(`/admin/api/users/${encodeURIComponent(userId)}`);
			const result = await response.json();

			if (response.ok) {
				profile = result.profile;
				merchantAccess = result.merchantAccess || [];
			} else {
				error = result.error || 'Failed to load user details';
			}
		} catch (e) {
			error = 'Failed to load user details';
			console.error('Error loading user details:', e);
		} finally {
			isLoading = false;
		}
	}

	async function handleRevokeAccess(domain) {
		if (!confirm(`Are you sure you want to revoke ${email}'s access to ${domain}?`)) {
			return;
		}

		revokingDomain = domain;

		try {
			const response = await fetch(
				`/admin/api/users/${encodeURIComponent(userId)}/merchant-access/${encodeURIComponent(domain)}`,
				{ method: 'DELETE' }
			);

			if (response.ok) {
				// Remove from local state
				merchantAccess = merchantAccess.filter((a) => a.merchant_domain !== domain);
				onAccessRevoked(userId, domain);
			} else {
				const result = await response.json();
				alert(result.error || 'Failed to revoke access');
			}
		} catch (e) {
			console.error('Error revoking access:', e);
			alert('Failed to revoke access');
		} finally {
			revokingDomain = null;
		}
	}

	function getRoleBadgeVariant(role) {
		switch (role) {
			case 'owner':
				return 'default';
			case 'editor':
				return 'secondary';
			case 'viewer':
				return 'outline';
			default:
				return 'outline';
		}
	}

	let avatarUrl = $derived(
		profile?.hasAvatar ? `/admin/api/users/${encodeURIComponent(userId)}/avatar` : null
	);

	function getInitials(name, email) {
		if (name) return name[0].toUpperCase();
		if (email) return email[0].toUpperCase();
		return '?';
	}
</script>

<div class="px-4 py-4">
	{#if isLoading}
		<div class="flex items-center justify-center py-4">
			<Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
			<span class="ml-2 text-sm text-muted-foreground">Loading user details...</span>
		</div>
	{:else if error}
		<div class="py-4 text-center text-sm text-red-600">
			{error}
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Avatar and Name Section -->
			<div>
				<h4 class="mb-3 text-sm font-semibold text-muted-foreground">Profile</h4>
				<div class="flex items-start gap-4">
					<Avatar.Root class="h-16 w-16">
						{#if avatarUrl}
							<Avatar.Image src={avatarUrl} alt={profile?.name || email} />
						{/if}
						<Avatar.Fallback class="text-lg">
							{getInitials(profile?.name, email)}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="space-y-1">
						{#if profile?.name}
							<div class="flex items-center gap-2 text-sm">
								<User class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium">{profile.name}</span>
							</div>
						{/if}
						{#if profile?.company}
							<div class="flex items-center gap-2 text-sm">
								<Building class="h-4 w-4 text-muted-foreground" />
								<span>{profile.company}</span>
							</div>
						{/if}
						{#if profile?.location}
							<div class="flex items-center gap-2 text-sm">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span>{profile.location}</span>
							</div>
						{/if}
						{#if !profile?.name && !profile?.company && !profile?.location}
							<p class="text-sm text-muted-foreground">No profile information set</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Merchant Access Section -->
			<div class="md:col-span-2">
				<h4 class="mb-3 text-sm font-semibold text-muted-foreground">Merchant Access</h4>
				{#if merchantAccess.length === 0}
					<p class="text-sm text-muted-foreground">No merchant access granted</p>
				{:else}
					<div class="space-y-2">
						{#each merchantAccess as access (access.merchant_domain)}
							<div
								class="flex items-center justify-between gap-2 rounded-md border bg-background p-2 text-sm"
							>
								<div class="flex items-center gap-2">
									<Store class="h-4 w-4 text-muted-foreground" />
									<a
										href="/merchant/{access.merchant_domain}"
										class="font-medium hover:underline"
									>
										{access.merchant_domain}
									</a>
									<Badge variant={getRoleBadgeVariant(access.role)}>
										{access.role}
									</Badge>
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="h-7 text-red-600 hover:bg-red-50 hover:text-red-700"
									onclick={() => handleRevokeAccess(access.merchant_domain)}
									disabled={revokingDomain === access.merchant_domain}
									title="Revoke access"
								>
									{#if revokingDomain === access.merchant_domain}
										<Loader2 class="h-4 w-4 animate-spin" />
									{:else}
										<X class="h-4 w-4" />
									{/if}
									<span class="ml-1">Revoke</span>
								</Button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- User ID (for debugging/reference) -->
		<div class="mt-4 border-t pt-4">
			<p class="text-xs text-muted-foreground">
				User ID: <code class="rounded bg-muted px-1 py-0.5">{userId}</code>
			</p>
		</div>
	{/if}
</div>
