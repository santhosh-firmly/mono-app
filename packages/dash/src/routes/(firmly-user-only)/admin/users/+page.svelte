<script>
	import PageHeader from '$lib/components/app/page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Search from 'lucide-svelte/icons/search';
	import Users from 'lucide-svelte/icons/users';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import UserExpandedRow from './user-expanded-row.svelte';
	import { formatDistanceToNow } from 'date-fns';

	let { data } = $props();

	// Local state
	let users = $state(data.users || []);
	let total = $state(data.total || 0);
	let searchQuery = $state('');
	let isSearching = $state(false);
	let offset = $state(0);
	let limit = $state(50);
	let expandedUserId = $state(null);

	// Debounced search
	let searchTimeout = null;

	function handleSearchInput(event) {
		const value = event.target.value;
		searchQuery = value;

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			offset = 0; // Reset to first page when searching
			fetchUsers();
		}, 300);
	}

	async function fetchUsers() {
		isSearching = true;

		try {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- URLSearchParams used for fetch URL building, not reactive state
			const params = new URLSearchParams({
				limit: limit.toString(),
				offset: offset.toString()
			});

			if (searchQuery) {
				params.set('search', searchQuery);
			}

			const response = await fetch(`/admin/api/users?${params}`);
			const result = await response.json();

			if (response.ok) {
				users = result.users;
				total = result.total;
			}
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			isSearching = false;
		}
	}

	function handlePrevPage() {
		if (offset > 0) {
			offset = Math.max(0, offset - limit);
			fetchUsers();
		}
	}

	function handleNextPage() {
		if (offset + limit < total) {
			offset = offset + limit;
			fetchUsers();
		}
	}

	function toggleExpanded(userId) {
		if (expandedUserId === userId) {
			expandedUserId = null;
		} else {
			expandedUserId = userId;
		}
	}

	function formatDate(dateString) {
		if (!dateString) return 'Never';
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatRelativeTime(dateString) {
		if (!dateString) return 'Never';
		return formatDistanceToNow(new Date(dateString), { addSuffix: true });
	}

	$effect(() => {
		// Clean up on unmount
		return () => {
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});

	let currentPage = $derived(Math.floor(offset / limit) + 1);
	let totalPages = $derived(Math.ceil(total / limit));

	function getInitials(email) {
		if (!email) return '?';
		return email[0].toUpperCase();
	}

	function handleAccessRevoked(userId, domain) {
		// Could trigger a refresh or show a toast notification
		console.log(`Access revoked for user ${userId} from ${domain}`);
	}
</script>

<div class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<PageHeader title="Dashboard Users" description="View and search all users in the system." />

	{#if data.error}
		<Card.Root>
			<Card.Content class="py-8 text-center text-red-600">
				{data.error}
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Search and Stats -->
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="relative w-full sm:max-w-md">
				<Search
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Search by email..."
					class="pl-10"
					value={searchQuery}
					oninput={handleSearchInput}
				/>
			</div>
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				{#if isSearching}
					<Loader2 class="h-4 w-4 animate-spin" />
				{/if}
				<span>{total} user{total !== 1 ? 's' : ''} total</span>
			</div>
		</div>

		{#if users.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center">
					<Users class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 class="mb-2 text-lg font-medium">
						{searchQuery ? 'No users found' : 'No users yet'}
					</h3>
					<p class="text-muted-foreground">
						{searchQuery
							? `No users match "${searchQuery}"`
							: 'No users have signed up yet.'}
					</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-12"></Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head>Last Login</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each users as user (user.id)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50"
								onclick={() => toggleExpanded(user.id)}
							>
								<Table.Cell>
									<Button
										variant="ghost"
										size="sm"
										class="h-8 w-8 p-0"
										onclick={(e) => {
											e.stopPropagation();
											toggleExpanded(user.id);
										}}
									>
										<ChevronRight
											class="h-4 w-4 transition-transform {expandedUserId ===
											user.id
												? 'rotate-90'
												: ''}"
										/>
									</Button>
								</Table.Cell>
								<Table.Cell class="font-medium">
									<div class="flex items-center gap-3">
										<Avatar.Root class="h-8 w-8">
											<Avatar.Image
												src={`/admin/api/users/${encodeURIComponent(user.id)}/avatar`}
												alt={user.email}
											/>
											<Avatar.Fallback class="text-xs">
												{getInitials(user.email)}
											</Avatar.Fallback>
										</Avatar.Root>
										<span>{user.email}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<span title={formatDate(user.created_at)}>
										{formatRelativeTime(user.created_at)}
									</span>
								</Table.Cell>
								<Table.Cell>
									{#if user.last_login_at}
										<span title={formatDate(user.last_login_at)}>
											{formatRelativeTime(user.last_login_at)}
										</span>
									{:else}
										<Badge variant="outline">Never</Badge>
									{/if}
								</Table.Cell>
							</Table.Row>
							{#if expandedUserId === user.id}
								<Table.Row class="bg-muted/30 hover:bg-muted/30">
									<Table.Cell colspan="4" class="p-0">
										<UserExpandedRow
											userId={user.id}
											email={user.email}
											onAccessRevoked={handleAccessRevoked}
										/>
									</Table.Cell>
								</Table.Row>
							{/if}
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Root>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="flex items-center justify-between">
					<p class="text-sm text-muted-foreground">
						Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} users
					</p>
					<div class="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onclick={handlePrevPage}
							disabled={offset === 0 || isSearching}
						>
							<ChevronLeft class="mr-1 h-4 w-4" />
							Previous
						</Button>
						<span class="text-sm text-muted-foreground">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="sm"
							onclick={handleNextPage}
							disabled={offset + limit >= total || isSearching}
						>
							Next
							<ChevronRight class="ml-1 h-4 w-4" />
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
