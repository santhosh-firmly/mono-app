<script>
	import SessionsService from '$lib/services/sessions.js';
	import SessionList from '$lib/components/session-list.svelte';
	import Button from '$lib/components/button.svelte';
	import Avatar from '$lib/components/avatar.svelte';
	import DropdownMenu from '$lib/components/dropdown-menu.svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { goto } from '$app/navigation';

	let { data } = $props();

	let sessions = $state([]);
	let loading = $state(true);
	let error = $state(null);

	let service = $derived(new SessionsService(data.dvrServiceUrl, data.auth.jwt));

	$effect(async () => {
		loading = true;
		error = null;
		sessions = [];

		try {
			sessions = await service.fetchSessions();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
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
		{#if data?.auth?.name}
			<DropdownMenu>
				{#snippet trigger()}
					<Avatar name={data.auth.name} />
				{/snippet}
				<div class="text-muted-foreground border-border mb-1.5 border-b px-3 py-2 text-sm">
					{data.auth.name}
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

	<SessionList {sessions} {loading} {error} onDelete={() => {}}>
		{#snippet emptyState()}
			<div>
				<p class="text-muted mb-4 text-sm">No sessions yet</p>
				<Button variant="link" onclick={goToExample}>Try the example page</Button>
			</div>
		{/snippet}
	</SessionList>
</div>
