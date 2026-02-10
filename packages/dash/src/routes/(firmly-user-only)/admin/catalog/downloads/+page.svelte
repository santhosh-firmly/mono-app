<script>
	import { onMount } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Download from 'lucide-svelte/icons/download';
	import FileText from 'lucide-svelte/icons/file-text';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { catalogApi } from '$lib/api/catalog/index.js';

	let domains = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let selectedDomains = new SvelteSet();
	let exporting = $state(false);
	let exportFormat = $state('jsonl.gz');

	// Per-domain exports
	let domainExports = $state(new SvelteMap());

	const formatOptions = [
		{ value: 'jsonl.gz', label: 'JSONL (gzipped)' },
		{ value: 'jsonl', label: 'JSONL (plain)' }
	];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;
		try {
			domains = await catalogApi.domains.list();
			await loadExports();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function loadExports() {
		const newExports = new SvelteMap();

		await Promise.all(
			domains.map(async (d) => {
				try {
					const manifest = await catalogApi.exports.getLatest(d.domain);
					newExports.set(d.domain, manifest);
				} catch {
					// No export available
				}
			})
		);

		// Reassign to trigger reactivity in $derived computations
		domainExports = newExports;
	}

	function toggleDomain(domain) {
		if (selectedDomains.has(domain)) {
			selectedDomains.delete(domain);
		} else {
			selectedDomains.add(domain);
		}
	}

	function toggleAll() {
		if (selectedDomains.size === domains.length) {
			selectedDomains.clear();
		} else {
			for (const d of domains) {
				selectedDomains.add(d.domain);
			}
		}
	}

	async function exportSelected() {
		if (selectedDomains.size === 0) {
			error = 'Select at least one domain to export';
			return;
		}

		exporting = true;
		try {
			const blob = await catalogApi.exports.bulkDownload(
				Array.from(selectedDomains),
				exportFormat
			);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `products-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Export failed';
		} finally {
			exporting = false;
		}
	}

	function downloadSingleExport(domain, filename) {
		const manifest = domainExports.get(domain);
		if (!manifest) return;
		const url = catalogApi.exports.getFileUrl(domain, manifest.workflowId, filename);
		window.open(url, '_blank');
	}

	let allSelected = $derived(selectedDomains.size === domains.length && domains.length > 0);
	let totalSelectedProducts = $derived(
		Array.from(selectedDomains).reduce((sum, d) => {
			const manifest = domainExports.get(d);
			return sum + (manifest?.totalProducts || 0);
		}, 0)
	);
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Downloads" description="Export product data from one or more domains" />
		<div class="flex items-center gap-4">
			<select
				bind:value={exportFormat}
				class="px-3 py-2 text-sm border rounded-md bg-background"
			>
				{#each formatOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<Button onclick={exportSelected} disabled={selectedDomains.size === 0 || exporting}>
				{#if exporting}
					<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
				{:else}
					<Download class="h-4 w-4 mr-2" />
				{/if}
				Export Selected ({selectedDomains.size})
			</Button>
		</div>
	</div>

	{#if error}
		<div
			class="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center justify-between"
		>
			<span>{error}</span>
			<Button variant="ghost" size="sm" onclick={() => (error = null)}>Dismiss</Button>
		</div>
	{/if}

	{#if selectedDomains.size > 0}
		<div
			class="flex items-center justify-between flex-wrap gap-3 px-4 py-3 bg-primary/10 rounded-lg"
		>
			<span class="text-sm text-primary">
				<strong>{selectedDomains.size}</strong> domains selected with
				<strong>{totalSelectedProducts.toLocaleString()}</strong> total products
			</span>
			<Button variant="ghost" size="sm" onclick={() => selectedDomains.clear()}>
				Clear selection
			</Button>
		</div>
	{/if}

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading...
			</Card.Content>
		</Card.Root>
	{:else if domains.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<p>No domains found. Add domains first to export data.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="p-3 w-10">
								<input
									type="checkbox"
									class="w-4 h-4 cursor-pointer"
									checked={allSelected}
									onchange={toggleAll}
								/>
							</th>
							<th
								class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
								>Domain</th
							>
							<th
								class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
								>Products</th
							>
							<th
								class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
								>Last Export</th
							>
							<th
								class="p-3 text-left text-xs font-semibold text-muted-foreground uppercase"
								>Files</th
							>
						</tr>
					</thead>
					<tbody>
						{#each domains as domain (domain.domain)}
							{@const manifest = domainExports.get(domain.domain)}
							<tr class="border-b hover:bg-muted/30 transition-colors">
								<td class="p-3">
									<input
										type="checkbox"
										class="w-4 h-4 cursor-pointer"
										checked={selectedDomains.has(domain.domain)}
										onchange={() => toggleDomain(domain.domain)}
									/>
								</td>
								<td class="p-3">
									<span class="font-medium">{domain.domain}</span>
								</td>
								<td class="p-3">
									{#if manifest}
										<Badge variant="default"
											>{manifest.totalProducts?.toLocaleString()}</Badge
										>
									{:else}
										<span class="text-muted-foreground italic">-</span>
									{/if}
								</td>
								<td class="p-3">
									{#if manifest}
										<span class="text-sm text-muted-foreground">
											{new Date(manifest.createdAt).toLocaleDateString()}
										</span>
									{:else}
										<span class="text-muted-foreground italic">No export</span>
									{/if}
								</td>
								<td class="p-3">
									{#if manifest && manifest.files?.length > 0}
										<div class="flex flex-wrap gap-2">
											{#each manifest.files as file (file.filename)}
												<Button
													variant="ghost"
													size="sm"
													onclick={() =>
														downloadSingleExport(
															domain.domain,
															file.filename
														)}
												>
													<FileText class="h-3 w-3 mr-1" />
													{file.filename}
												</Button>
											{/each}
										</div>
									{:else}
										<span class="text-muted-foreground italic">-</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card.Root>
	{/if}
</div>
