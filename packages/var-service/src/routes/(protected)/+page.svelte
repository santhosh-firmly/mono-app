<script>
	import { sessionsStore } from '$lib/stores/sessions.svelte.js';
	import SessionList from '$lib/components/session-list.svelte';
	import Button from '$lib/components/button.svelte';
	import Avatar from '$lib/components/avatar.svelte';
	import DropdownMenu from '$lib/components/dropdown-menu.svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { goto } from '$app/navigation';

	let { data } = $props();

	$effect(() => {
		sessionsStore.fetchSessions(data.dvrServiceUrl);
	});

	function goToExample() {
		goto('/example');
	}

	function logOut() {
		goto('/auth/logout');
	}
</script>

<div>
	<header class="mb-12 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-2xl">Welcome to VAR</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions.</p>
		</div>
		{#if data?.authInfo?.name}
			<DropdownMenu>
				{#snippet trigger()}
					<Avatar name={data.authInfo.name} />
				{/snippet}
				<div class="text-muted-foreground border-border mb-1.5 border-b px-3 py-2 text-sm">
					{data.authInfo.name}
				</div>
				<DropdownMenuPrimitive.Item
					class="relative flex cursor-pointer items-center rounded-md px-3 py-2 text-xs text-red-600 transition-colors outline-none select-none hover:bg-red-50"
					onclick={logOut}
				>
					Logout
				</DropdownMenuPrimitive.Item>
			</DropdownMenu>
		{/if}
	</header>

	<SessionList
		sessions={sessionsStore.sessions}
		loading={sessionsStore.loading}
		error={sessionsStore.error}
		onDelete={() => {}}
	>
		{#snippet emptyState()}
			<div>
				<p class="text-muted mb-4 text-sm">No sessions yet</p>
				<Button variant="link" onclick={goToExample}>Try the example page</Button>
			</div>
		{/snippet}
	</SessionList>
</div>
