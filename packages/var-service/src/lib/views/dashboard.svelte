<script>
	import SessionList from '$lib/components/dashboard/session-list.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import DropdownMenu from '$lib/components/ui/dropdown-menu.svelte';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { goto } from '$app/navigation';

	let { sessions, loading, error, auth } = $props();

	function goToExample() {
		goto('/example');
	}

	function logOut() {
		goto('/auth/logout');
	}
</script>

<div>
	<header class="mx-auto mb-12 flex items-center justify-between">
		<div>
			<h1 class="font-serif text-2xl">Welcome to VAR</h1>
			<p class="text-muted text-sm">View and replay recorded user sessions.</p>
		</div>
		{#if auth?.name}
			<DropdownMenu>
				{#snippet trigger()}
					<Avatar name={auth.name} />
				{/snippet}
				<div class="text-muted-foreground border-border mb-1.5 border-b px-3 py-2 text-sm">
					{auth.name}
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

	<SessionList {sessions} {loading} {error}>
		{#snippet emptyState()}
			<div>
				<p class="text-muted mb-4 text-sm">No sessions yet</p>
				<Button variant="link" onclick={goToExample}>Try the example page</Button>
			</div>
		{/snippet}
	</SessionList>
</div>
