<script>
	import { invalidateAll } from '$app/navigation';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Bell from 'lucide-svelte/icons/bell';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import MerchantAvatar from './merchant-avatar.svelte';

	let { pendingInvites = [] } = $props();
	let declining = $state({});

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

{#if pendingInvites.length > 0}
	<Popover.Root>
		<Popover.Trigger>
			<button
				class="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
			>
				<Bell class="h-5 w-5" />
				<span
					class="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-medium text-white"
				>
					{pendingInvites.length}
				</span>
				<span class="sr-only">Pending invitations</span>
			</button>
		</Popover.Trigger>
		<Popover.Content class="w-80 p-0" align="end">
			<div class="border-b px-4 py-3">
				<h3 class="text-sm font-semibold">Pending Invitations</h3>
				<p class="text-xs text-muted-foreground">
					You have {pendingInvites.length} pending invitation{pendingInvites.length === 1
						? ''
						: 's'}
				</p>
			</div>
			<div class="max-h-80 overflow-y-auto">
				{#each pendingInvites as invite (invite.token)}
					<div class="border-b px-4 py-3 last:border-b-0">
						<div class="flex items-start gap-3">
							<MerchantAvatar domain={invite.merchant_domain} size="sm" />
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{invite.merchant_domain}</p>
								<div class="mt-1 flex items-center gap-2">
									<Badge variant={roleVariants[invite.role]} class="text-xs">
										{roleLabels[invite.role] || invite.role}
									</Badge>
									<span class="text-xs text-muted-foreground">
										{formatExpiry(invite.expires_at)}
									</span>
								</div>
								{#if invite.invited_by_email || invite.isFirmlyAdmin}
									<p class="mt-1 truncate text-xs text-muted-foreground">
										Invited by {invite.isFirmlyAdmin
											? 'Firmly'
											: invite.invited_by_email}
									</p>
								{/if}
							</div>
						</div>
						<div class="mt-3 flex gap-2">
							<Button size="sm" class="flex-1" href={`/invite?token=${invite.token}`}>
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
					</div>
				{/each}
			</div>
		</Popover.Content>
	</Popover.Root>
{/if}
