<script>
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/ui/pagination.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import SessionListItem from './session-list-item.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import { DEFAULT_ITEMS_PER_PAGE, PAGINATION_THRESHOLD } from '$lib/constants/pagination.js';

	let {
		sessions = [],
		totalItems = 0,
		loading = false,
		error = null,
		searchable = true,
		emptyMessage = 'No sessions yet',
		itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
		itemContent,
		emptyState,
		onSearch,
		onPageChange,
		class: className,
		...rest
	} = $props();

	const DEBOUNCE_DELAY = 300;

	let searchQuery = $state('');
	let currentPage = $state(1);
	let initialized = false;

	const startIndex = $derived((currentPage - 1) * itemsPerPage);
	const endIndex = $derived(Math.min(startIndex + itemsPerPage, totalItems));

	$effect(() => {
		searchQuery;

		if (!initialized) {
			initialized = true;
			return;
		}

		const timer = setTimeout(() => {
			currentPage = 1;
			onSearch?.(searchQuery);
		}, DEBOUNCE_DELAY);

		return () => clearTimeout(timer);
	});

	function handlePageChange(page) {
		currentPage = page;
		onPageChange?.(page);
	}

	function handlePlay(sessionId) {
		goto(`/player/${sessionId}`);
	}
</script>

<div class={['mx-auto flex min-h-125 w-full flex-col', className]} {...rest}>
	{#if searchable}
		<div class="mb-8">
			<Input bind:value={searchQuery} placeholder="Search sessions..." />
		</div>
	{/if}

	{#if loading}
		<div class="flex-1 space-y-2">
			<!-- eslint-disable-next-line no-unused-vars -->
			{#each Array(5) as _, i (i)}
				<div class="hover:bg-hover rounded-xl px-4 py-4 transition-colors">
					<div class="mb-2 flex items-start justify-between gap-4">
						<Skeleton class="h-5 flex-1" />
						<Skeleton class="h-4 w-4" />
					</div>
					<Skeleton class="h-4 w-2/3" />
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="flex flex-1 items-center justify-center py-12">
			<p class="text-muted text-sm">{error}</p>
		</div>
	{:else if sessions.length === 0}
		<div class="flex flex-1 items-center justify-center py-24 text-center">
			{#if searchQuery}
				<p class="text-muted text-sm">No sessions found matching "{searchQuery}"</p>
			{:else if emptyState}
				{@render emptyState()}
			{:else}
				<p class="text-muted text-sm">{emptyMessage}</p>
			{/if}
		</div>
	{:else}
		<div class="flex flex-1 flex-col">
			<div class="flex-1 space-y-1">
				{#each sessions as session (session.sessionId)}
					{#if itemContent}
						<SessionListItem {session} onPlay={handlePlay}>
							{@render itemContent(session)}
						</SessionListItem>
					{:else}
						<SessionListItem {session} onPlay={handlePlay} />
					{/if}
				{/each}
			</div>

			{#if totalItems > PAGINATION_THRESHOLD}
				<div class="border-border mt-6 flex items-center justify-between border-t pt-4">
					<div class="text-muted text-xs">
						Showing {startIndex + 1}–{endIndex} of {totalItems}
					</div>
					<Pagination
						{currentPage}
						onPageChange={handlePageChange}
						{totalItems}
						{itemsPerPage}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>
