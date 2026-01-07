<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Shield from 'lucide-svelte/icons/shield';
	import Monitor from 'lucide-svelte/icons/monitor';
	import Smartphone from 'lucide-svelte/icons/smartphone';
	import Tablet from 'lucide-svelte/icons/tablet';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Trash2 from 'lucide-svelte/icons/trash-2';

	let {
		sessions = [],
		isLoading = false,
		terminatingSessionId = null,
		isTerminatingAll = false,
		error = '',
		onTerminate = async () => {},
		onTerminateAll = async () => {},
		onRetry = () => {}
	} = $props();

	let otherSessions = $derived(sessions.filter((s) => !s.isCurrent));

	function getDeviceIcon(deviceType) {
		switch (deviceType) {
			case 'mobile':
				return Smartphone;
			case 'tablet':
				return Tablet;
			default:
				return Monitor;
		}
	}

	function formatDate(dateString) {
		if (!dateString) return 'Unknown';
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
		if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	}
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2">
			<Shield class="h-5 w-5 text-gray-600" />
			<Card.Title class="text-lg">Active Sessions</Card.Title>
		</div>
		<Card.Description>
			Devices where you're currently signed in. You can sign out of any session except the
			current one.
		</Card.Description>
	</Card.Header>

	<Card.Content>
		{#if error}
			<div class="rounded-md bg-red-50 p-3 text-sm text-red-700">
				{error}
				<button onclick={onRetry} class="ml-2 underline">Retry</button>
			</div>
		{:else if isLoading}
			<div class="flex items-center justify-center py-8">
				<Loader2 class="h-6 w-6 animate-spin text-gray-400" />
			</div>
		{:else if sessions.length === 0}
			<p class="py-4 text-center text-sm text-gray-500">No active sessions found.</p>
		{:else}
			<div class="divide-y">
				{#each sessions as session (session.id)}
					{@const DeviceIcon = getDeviceIcon(session.device_type)}
					<div class="flex items-center gap-4 py-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full {session.isCurrent
								? 'bg-green-100'
								: 'bg-gray-100'}"
						>
							<DeviceIcon
								class="h-5 w-5 {session.isCurrent
									? 'text-green-600'
									: 'text-gray-600'}"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate text-sm font-medium text-gray-900">
									{session.device_name || 'Unknown Device'}
								</p>
								{#if session.isCurrent}
									<span
										class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
									>
										Current
									</span>
								{/if}
							</div>
							<p class="text-xs text-gray-500">
								Last active: {formatDate(session.last_access_at)}
								{#if session.ip_address}
									<span class="mx-1">·</span>
									{session.ip_address}
								{/if}
							</p>
						</div>
						{#if !session.isCurrent}
							<Button
								variant="ghost"
								size="sm"
								class="text-red-600 hover:bg-red-50 hover:text-red-700"
								onclick={() => onTerminate(session.id)}
								disabled={terminatingSessionId === session.id}
							>
								{#if terminatingSessionId === session.id}
									<Loader2 class="h-4 w-4 animate-spin" />
								{:else}
									<Trash2 class="h-4 w-4" />
								{/if}
							</Button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>

	{#if otherSessions.length > 0}
		<Card.Footer class="border-t pt-4">
			<Button
				variant="outline"
				class="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
				onclick={onTerminateAll}
				disabled={isTerminatingAll}
			>
				{#if isTerminatingAll}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Signing out...
				{:else}
					Sign out of all other devices
				{/if}
			</Button>
		</Card.Footer>
	{/if}
</Card.Root>
