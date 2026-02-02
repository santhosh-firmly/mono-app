<script>
	import { Progress } from '$lib/components/ui/progress/index.js';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';

	let {
		domains = [],
		selectedDomains = new Set(),
		onSelect,
		onSelectAll,
		sortField = null,
		sortDirection = 'asc',
		onSort,
		showSelection = true,
		showProgress = true,
		domainLinkPrefix = '/admin/catalog/product-details'
	} = $props();

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}

	function getSortIcon(field) {
		if (sortField !== field) return ArrowUpDown;
		return sortDirection === 'asc' ? ArrowUp : ArrowDown;
	}

	function handleSort(field) {
		if (onSort) {
			onSort(field);
		}
	}

	let allSelected = $derived(
		domains.length > 0 &&
			domains.every((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`))
	);

	let someSelected = $derived(
		domains.some((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`)) && !allSelected
	);
</script>

<div class="border rounded-lg overflow-hidden">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b bg-muted/50">
				{#if showSelection}
					<th class="w-10 p-3 text-center">
						<input
							type="checkbox"
							class="rounded"
							checked={allSelected}
							indeterminate={someSelected}
							onchange={onSelectAll}
						/>
					</th>
				{/if}
				<th class="p-3 text-left font-medium">
					{#if onSort}
						<button
							class="flex items-center gap-1 hover:text-foreground"
							onclick={() => handleSort('domain')}
						>
							Domain
							<svelte:component this={getSortIcon('domain')} class="h-4 w-4" />
						</button>
					{:else}
						Domain
					{/if}
				</th>
				<th class="p-3 text-left font-medium">
					{#if onSort}
						<button
							class="flex items-center gap-1 hover:text-foreground"
							onclick={() => handleSort('total')}
						>
							Products
							<svelte:component this={getSortIcon('total')} class="h-4 w-4" />
						</button>
					{:else}
						Products
					{/if}
				</th>
				<th class="p-3 text-left font-medium">Success</th>
				<th class="p-3 text-left font-medium">Pending</th>
				<th class="p-3 text-left font-medium">Failed</th>
				{#if showProgress}
					<th class="p-3 text-left font-medium">Completion</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each domains as domain (`${domain.domain}/${domain.countryCode}`)}
				{@const key = `${domain.domain}/${domain.countryCode}`}
				{@const isSelected = selectedDomains.has(key)}
				<tr
					class="border-b hover:bg-muted/30 transition-colors {isSelected ? 'bg-primary/5' : ''}"
				>
					{#if showSelection}
						<td class="p-3 text-center">
							<input
								type="checkbox"
								class="rounded"
								checked={isSelected}
								onchange={() => onSelect?.(domain.domain, domain.countryCode)}
							/>
						</td>
					{/if}
					<td class="p-3">
						<a
							href="{domainLinkPrefix}/{domain.domain}/{domain.countryCode}"
							class="text-primary hover:underline font-medium"
						>
							{domain.domain}
						</a>
						{#if domain.countryCode}
							<span class="text-xs text-muted-foreground ml-1">{domain.countryCode}</span>
						{/if}
					</td>
					<td class="p-3 text-muted-foreground">{formatNumber(domain.total)}</td>
					<td class="p-3 text-green-600">{formatNumber(domain.success)}</td>
					<td class="p-3 text-yellow-600">{formatNumber(domain.pending)}</td>
					<td class="p-3 text-red-600"
						>{formatNumber((domain.failed || 0) + (domain.permanently_failed || 0))}</td
					>
					{#if showProgress}
						<td class="p-3">
							<div class="flex items-center gap-2">
								<Progress value={domain.completion_percent} class="w-20 h-2" />
								<span class="text-muted-foreground">{domain.completion_percent}%</span>
							</div>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
