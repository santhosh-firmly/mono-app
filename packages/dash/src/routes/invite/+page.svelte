<script>
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import XCircle from 'lucide-svelte/icons/x-circle';
	import Mail from 'lucide-svelte/icons/mail';
	import Globe from 'lucide-svelte/icons/globe';
	import Shield from 'lucide-svelte/icons/shield';

	let { data } = $props();

	let isAccepting = $state(false);
	let acceptError = $state('');

	const roleLabels = {
		owner: 'Owner',
		editor: 'Editor',
		viewer: 'Viewer'
	};

	const roleDescriptions = {
		owner: 'Full access and team management',
		editor: 'Edit merchant settings',
		viewer: 'Read-only access'
	};

	async function acceptInvite() {
		isAccepting = true;
		acceptError = '';

		try {
			const response = await fetch('/api/invite/accept', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: data.token })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to accept invitation');
			}

			// Redirect to merchant dashboard
			goto(result.redirectTo);
		} catch (error) {
			acceptError = error.message;
			isAccepting = false;
		}
	}

	function goToProfileForm() {
		goto(`invite/profile?token=${data.token}`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<Card.Root class="w-full max-w-md">
		{#if !data.valid}
			<!-- Invalid/Expired Invite -->
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"
				>
					<XCircle class="h-8 w-8 text-red-600" />
				</div>
				<Card.Title class="text-xl">Invalid Invitation</Card.Title>
				<Card.Description class="text-base">
					{data.error || 'This invitation link is not valid.'}
				</Card.Description>
			</Card.Header>
			<Card.Footer class="justify-center">
				<Button variant="outline" href="/">Go to Home</Button>
			</Card.Footer>
		{:else}
			<!-- Valid Invite -->
			<Card.Header class="text-center">
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100"
				>
					<Mail class="h-8 w-8 text-purple-600" />
				</div>
				<Card.Title class="text-xl">You're Invited!</Card.Title>
				<Card.Description class="text-base">
					You've been invited to access a merchant dashboard on Firmly.
				</Card.Description>
			</Card.Header>

			<Card.Content class="space-y-4">
				<!-- Invite Details -->
				<div class="rounded-lg bg-gray-50 p-4 space-y-3">
					<div class="flex items-center gap-3">
						<Globe class="h-5 w-5 text-gray-500" />
						<div>
							<p class="text-sm text-gray-500">Merchant</p>
							<p class="font-medium">{data.merchantDomain}</p>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<Shield class="h-5 w-5 text-gray-500" />
						<div>
							<p class="text-sm text-gray-500">Your Role</p>
							<p class="font-medium">
								<Badge variant="secondary">{roleLabels[data.role]}</Badge>
								<span class="ml-2 text-sm text-gray-500"
									>{roleDescriptions[data.role]}</span
								>
							</p>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<Mail class="h-5 w-5 text-gray-500" />
						<div>
							<p class="text-sm text-gray-500">Invited by</p>
							<p class="font-medium">
								{data.isFirmlyAdmin ? 'Firmly' : data.invitedByEmail}
							</p>
						</div>
					</div>
				</div>

				<p class="text-center text-sm text-gray-500">
					You will be signed in as <strong>{data.email}</strong>
				</p>

				{#if acceptError}
					<p class="text-center text-sm text-red-600">{acceptError}</p>
				{/if}
			</Card.Content>

			<Card.Footer class="flex-col gap-2">
				{#if data.existingUser}
					<!-- Existing user - can accept directly -->
					<Button class="w-full" onclick={acceptInvite} disabled={isAccepting}>
						{#if isAccepting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Accepting...
						{:else}
							<CheckCircle class="mr-2 h-4 w-4" />
							Accept Invitation
						{/if}
					</Button>
				{:else}
					<!-- New user - need to complete profile -->
					<Button class="w-full" onclick={goToProfileForm}>
						Continue to Complete Profile
					</Button>
					<p class="text-center text-xs text-gray-500">
						You'll need to set up your profile to accept this invitation.
					</p>
				{/if}
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
