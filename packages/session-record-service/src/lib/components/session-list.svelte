<script>
	import { goto } from '$app/navigation';
	import Pagination from './pagination.svelte';
	import Input from './input.svelte';
	import Button from './button.svelte';
	import { cn } from '$lib/utils/cn.js';

	const DEFAULT_ITEMS_PER_PAGE = 7;

	let {
		sessions = [],
		loading = false,
		error = null,
		searchable = true,
		emptyMessage = 'No sessions yet',
		emptyAction = null,
		itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
		class: className,
		...rest
	} = $props();

	let searchQuery = $state('');
	let currentPage = $state(1);

	const filteredSessions = $derived(() => {
		if (!searchQuery) return sessions;

		const query = searchQuery.toLowerCase();
		return sessions.filter(
			(session) =>
				session.url.toLowerCase().includes(query) ||
				session.sessionId.toLowerCase().includes(query)
		);
	});

	const totalItems = $derived(filteredSessions().length);
	const startIndex = $derived((currentPage - 1) * itemsPerPage);
	const endIndex = $derived(startIndex + itemsPerPage);
	const currentSessions = $derived(filteredSessions().slice(startIndex, endIndex));

	function formatDate(timestamp) {
		const date = new Date(timestamp);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		}).format(date);
	}

	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes === 0) return `${remainingSeconds}s`;
		return `${minutes}m ${remainingSeconds}s`;
	}

	function handleSessionClick(sessionId) {
		goto(`/player/${sessionId}`);
	}
</script>

<div class={cn('mx-auto flex min-h-[500px] w-full max-w-[680px] flex-col', className)} {...rest}>
	{#if searchable}
		<div class="mb-8">
			<Input bind:value={searchQuery} placeholder="Search sessions..." />
		</div>
	{/if}

	{#if loading}
		<div class="flex flex-1 items-center justify-center py-24">
			<div
				class="border-foreground inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
			></div>
		</div>
	{:else if error}
		<div class="flex flex-1 items-center justify-center py-12">
			<p class="text-muted text-sm">{error}</p>
		</div>
	{:else if filteredSessions().length === 0}
		<div class="flex flex-1 items-center justify-center py-24 text-center">
			{#if searchQuery}
				<p class="text-muted text-sm">No sessions found matching "{searchQuery}"</p>
			{:else}
				<div>
					<p class="text-muted mb-4 text-sm">{emptyMessage}</p>
					{#if emptyAction}
						<Button variant="link" onclick={emptyAction.onClick}>
							{emptyAction.label}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 flex-col">
			<div class="flex-1 space-y-px">
				{#each currentSessions as session (session.sessionId)}
					<button
						type="button"
						onclick={() => handleSessionClick(session.sessionId)}
						class="hover:bg-hover block w-full px-4 py-4 text-left transition-colors"
					>
						<h2 class="text-foreground mb-1 font-serif text-base">{session.url}</h2>
						<div class="text-muted text-xs">
							{session.eventCount} events · {formatDuration(session.duration)} · {formatDate(
								session.timestamp
							)}
						</div>
					</button>
				{/each}
			</div>

			{#if totalItems > DEFAULT_ITEMS_PER_PAGE}
				<div class="border-border mt-6 flex items-center justify-between border-t pt-4">
					<div class="text-muted text-xs">
						Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of {totalItems}
					</div>
					<Pagination bind:currentPage {totalItems} {itemsPerPage} />
				</div>
			{/if}
		</div>
	{/if}
</div>
