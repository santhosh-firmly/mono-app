<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Search from 'lucide-svelte/icons/search';
	import Settings from 'lucide-svelte/icons/settings';
	import X from 'lucide-svelte/icons/x';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import RotateCw from 'lucide-svelte/icons/rotate-cw';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		stats = null,
		domains = [],
		configs = new Map(),
		loading = false,
		error = null,
		// Modal state
		showConfigModal = false,
		selectedDomain = null,
		domainConfig = null,
		loadingConfig = false,
		savingDomain = false,
		// Delete modal state
		showDeleteModal = false,
		domainToDelete = null,
		deletingDomain = false,
		// Filter state
		searchQuery = '',
		sortBy = 'domain_asc',
		// Handlers
		onRefresh = () => {},
		onOpenConfig = () => {},
		onSaveConfig = () => {},
		onCloseConfigModal = () => {},
		onTriggerSync = () => {},
		onOpenDeleteModal = () => {},
		onDeleteDomain = () => {},
		onCloseDeleteModal = () => {},
		onSearchQueryChange = () => {},
		onSortByChange = () => {},
		onDismissError = () => {},
		onConfigChange = () => {}
	} = $props();

	// Local state for delete confirmation
	let deleteConfirmText = $state('');

	const sortOptions = [
		{ value: 'domain_asc', label: 'Domain (A-Z)' },
		{ value: 'domain_desc', label: 'Domain (Z-A)' },
		{ value: 'total_desc', label: 'Most Products' },
		{ value: 'total_asc', label: 'Least Products' },
		{ value: 'completion_desc', label: 'Highest Completion' },
		{ value: 'completion_asc', label: 'Lowest Completion' }
	];

	// Derived values
	let filteredDomains = $derived.by(() => {
		if (!stats?.domains) return [];

		let result = [...stats.domains];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			result = result.filter((d) => d.domain.toLowerCase().includes(query));
		}

		// Apply sorting
		switch (sortBy) {
			case 'domain_asc':
				result.sort((a, b) => a.domain.localeCompare(b.domain));
				break;
			case 'domain_desc':
				result.sort((a, b) => b.domain.localeCompare(a.domain));
				break;
			case 'total_desc':
				result.sort((a, b) => b.total - a.total);
				break;
			case 'total_asc':
				result.sort((a, b) => a.total - b.total);
				break;
			case 'completion_desc':
				result.sort((a, b) => b.completion_percent - a.completion_percent);
				break;
			case 'completion_asc':
				result.sort((a, b) => a.completion_percent - b.completion_percent);
				break;
		}

		return result;
	});

	function getCompletionBadgeVariant(percent) {
		if (percent >= 90) return 'default';
		if (percent >= 50) return 'secondary';
		return 'destructive';
	}

	function handleSearchInput(e) {
		onSearchQueryChange(e.target.value);
	}

	function handleSortByChange(e) {
		onSortByChange(e.target.value);
	}

	function handleDeleteDomain() {
		if (deleteConfirmText === domainToDelete?.domain) {
			onDeleteDomain(domainToDelete);
			deleteConfirmText = '';
		}
	}

	function handleCloseDeleteModal() {
		deleteConfirmText = '';
		onCloseDeleteModal();
	}

	function handleConfigFieldChange(field, value) {
		onConfigChange({ ...domainConfig, [field]: value });
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader
			title="Settings"
			description="Configure per-domain settings for Product Details processing"
		/>
		<Button variant="outline" onclick={onRefresh} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	{#if stats}
		<!-- Stats Summary -->
		<div class="flex gap-6 flex-wrap">
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide">Total Domains</span>
				<span class="text-2xl font-bold">{stats.total_domains}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide"
					>Total Products</span
				>
				<span class="text-2xl font-bold"
					>{stats.aggregate?.total_products?.toLocaleString()}</span
				>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs text-muted-foreground uppercase tracking-wide"
					>Overall Completion</span
				>
				<span class="text-2xl font-bold">{stats.aggregate?.completion_percent}%</span>
			</div>
		</div>
	{/if}

	<!-- Domain Configuration Section -->
	<div class="space-y-4">
		<h2 class="text-lg font-semibold">Domain Configuration</h2>

		<div class="flex gap-4 flex-wrap items-end">
			<div class="flex-1 min-w-[200px]">
				<Label class="text-sm text-muted-foreground mb-1.5 block">Search Domains</Label>
				<div class="relative">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<Input
						placeholder="Type to search..."
						value={searchQuery}
						oninput={handleSearchInput}
						class="pl-9"
					/>
				</div>
			</div>
			<div class="min-w-[180px]">
				<Label class="text-sm text-muted-foreground mb-1.5 block">Sort By</Label>
				<select
					value={sortBy}
					onchange={handleSortByChange}
					class="w-full px-3 py-2 text-sm border rounded-md bg-background"
				>
					{#each sortOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if loading}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
					Loading domains...
				</Card.Content>
			</Card.Root>
		{:else if filteredDomains.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					{#if searchQuery}
						No domains found matching "{searchQuery}"
					{:else}
						No domains configured
					{/if}
				</Card.Content>
			</Card.Root>
		{:else}
			<p class="text-sm text-muted-foreground">
				Showing {filteredDomains.length} of {stats?.total_domains || 0} domains
			</p>

			<Card.Root class="overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/50">
								<th
									class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
									>Domain</th
								>
								<th
									class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
									>Country</th
								>
								<th
									class="p-3 text-right text-xs font-semibold text-muted-foreground uppercase"
									>Products</th
								>
								<th
									class="p-3 text-center text-xs font-semibold text-muted-foreground uppercase"
									>Completion</th
								>
								<th
									class="p-3 text-right text-xs font-semibold text-muted-foreground uppercase"
									>Actions</th
								>
							</tr>
						</thead>
						<tbody>
							{#each filteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
								<tr class="border-b hover:bg-muted/30 transition-colors">
									<td class="p-3">
										<a
											href="/admin/catalog/product-details/{domain.domain}/{domain.countryCode}"
											class="text-primary font-medium hover:underline"
										>
											{domain.domain}
										</a>
									</td>
									<td class="p-3 text-sm text-muted-foreground">{domain.countryCode}</td>
									<td class="p-3 text-right text-sm tabular-nums"
										>{domain.total.toLocaleString()}</td
									>
									<td class="p-3 text-center">
										<Badge variant={getCompletionBadgeVariant(domain.completion_percent)}>
											{domain.completion_percent}%
										</Badge>
									</td>
									<td class="p-3">
										<div class="flex gap-2 justify-end">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => onTriggerSync(domain)}
											>
												<RotateCw class="h-4 w-4 mr-1" />
												Sync
											</Button>
											<Button
												variant="outline"
												size="sm"
												onclick={() => onOpenConfig(domain)}
											>
												<Settings class="h-4 w-4 mr-1" />
												Configure
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onclick={() => onOpenDeleteModal(domain)}
											>
												<Trash2 class="h-4 w-4 mr-1" />
												Delete
											</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Root>
		{/if}
	</div>
</div>

<!-- Config Modal -->
{#if showConfigModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={onCloseConfigModal}
		onkeydown={(e) => e.key === 'Escape' && onCloseConfigModal()}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="bg-background rounded-xl max-w-[500px] w-full max-h-[90vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="document"
		>
			<div class="flex items-center justify-between p-4 border-b">
				<h3 class="text-lg font-semibold">
					Configure {selectedDomain?.domain || ''}
				</h3>
				<Button variant="ghost" size="sm" onclick={onCloseConfigModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>
			<div class="p-6 overflow-y-auto">
				{#if loadingConfig}
					<div class="flex items-center justify-center py-8 text-muted-foreground">
						<RefreshCw class="h-5 w-5 animate-spin mr-3" />
						Loading config...
					</div>
				{:else if domainConfig}
					{#if selectedDomain}
						<div class="mb-4 p-3 bg-muted rounded-md">
							<div class="grid grid-cols-3 gap-4 text-center">
								<div>
									<div class="text-lg font-semibold">
										{selectedDomain.total.toLocaleString()}
									</div>
									<div class="text-xs text-muted-foreground">Total Products</div>
								</div>
								<div>
									<div class="text-lg font-semibold text-green-600">
										{selectedDomain.success.toLocaleString()}
									</div>
									<div class="text-xs text-muted-foreground">Success</div>
								</div>
								<div>
									<div class="text-lg font-semibold text-yellow-600">
										{selectedDomain.pending.toLocaleString()}
									</div>
									<div class="text-xs text-muted-foreground">Pending</div>
								</div>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-2 gap-4">
						<div class="col-span-2">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={domainConfig.enabled}
									onchange={(e) => handleConfigFieldChange('enabled', e.target.checked)}
									class="w-4 h-4"
								/>
								<span class="text-sm font-medium">Enabled</span>
							</label>
							<p class="text-xs text-muted-foreground mt-1">
								Enable or disable product details fetching for this domain
							</p>
						</div>
						<div>
							<Label class="text-sm mb-1.5 block">Batch Size</Label>
							<Input
								type="number"
								value={domainConfig.batch_size}
								oninput={(e) =>
									handleConfigFieldChange('batch_size', parseInt(e.target.value))}
							/>
							<p class="text-xs text-muted-foreground mt-1">Products per batch</p>
						</div>
						<div>
							<Label class="text-sm mb-1.5 block">Delay Between Batches (ms)</Label>
							<Input
								type="number"
								value={domainConfig.delay_between_batches_ms}
								oninput={(e) =>
									handleConfigFieldChange(
										'delay_between_batches_ms',
										parseInt(e.target.value)
									)}
							/>
							<p class="text-xs text-muted-foreground mt-1">Milliseconds between batches</p>
						</div>
						<div>
							<Label class="text-sm mb-1.5 block">Freshness Threshold (hours)</Label>
							<Input
								type="number"
								value={domainConfig.freshness_threshold_hours}
								oninput={(e) =>
									handleConfigFieldChange(
										'freshness_threshold_hours',
										parseInt(e.target.value)
									)}
							/>
							<p class="text-xs text-muted-foreground mt-1">Re-fetch products older than this</p>
						</div>
						<div>
							<Label class="text-sm mb-1.5 block">Max Retries</Label>
							<Input
								type="number"
								value={domainConfig.max_retries}
								oninput={(e) =>
									handleConfigFieldChange('max_retries', parseInt(e.target.value))}
							/>
							<p class="text-xs text-muted-foreground mt-1">Retry failed requests</p>
						</div>
						<div class="col-span-2">
							<Label class="text-sm mb-1.5 block">Retry Delay (ms)</Label>
							<Input
								type="number"
								value={domainConfig.retry_delay_ms}
								oninput={(e) =>
									handleConfigFieldChange('retry_delay_ms', parseInt(e.target.value))}
							/>
							<p class="text-xs text-muted-foreground mt-1">Delay before retrying</p>
						</div>
					</div>
				{/if}
			</div>
			<div class="flex justify-end gap-2 p-4 border-t">
				<Button variant="outline" onclick={onCloseConfigModal}>Cancel</Button>
				<Button onclick={onSaveConfig} disabled={savingDomain}>
					{#if savingDomain}
						<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					Save Configuration
				</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={handleCloseDeleteModal}
		onkeydown={(e) => e.key === 'Escape' && handleCloseDeleteModal()}
		role="dialog"
		tabindex="-1"
	>
		<div
			class="bg-background rounded-xl max-w-[400px] w-full overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
			role="document"
		>
			<div class="flex items-center justify-between p-4 border-b">
				<h3 class="text-lg font-semibold">Delete Domain</h3>
				<Button variant="ghost" size="sm" onclick={handleCloseDeleteModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>
			<div class="p-6">
				{#if domainToDelete}
					<p class="text-sm text-muted-foreground mb-3">
						Are you sure you want to delete <strong>{domainToDelete.domain}</strong>? This
						will remove all catalog data for this domain.
					</p>
					<div
						class="bg-destructive/10 border border-destructive/30 rounded-md p-3 mb-4 flex items-start gap-2"
					>
						<AlertTriangle class="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
						<p class="text-destructive text-sm">
							This action cannot be undone. All {domainToDelete.total.toLocaleString()} products
							will be permanently deleted.
						</p>
					</div>
					<div>
						<Label class="text-sm mb-1.5 block">Type the domain name to confirm</Label>
						<Input placeholder={domainToDelete.domain} bind:value={deleteConfirmText} />
					</div>
				{/if}
			</div>
			<div class="flex justify-end gap-2 p-4 border-t">
				<Button variant="outline" onclick={handleCloseDeleteModal}>Cancel</Button>
				<Button
					variant="destructive"
					onclick={handleDeleteDomain}
					disabled={deletingDomain || deleteConfirmText !== domainToDelete?.domain}
				>
					{#if deletingDomain}
						<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					Delete Domain
				</Button>
			</div>
		</div>
	</div>
{/if}
