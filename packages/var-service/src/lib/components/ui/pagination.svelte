<script>
	let {
		currentPage = $bindable(1),
		totalItems,
		itemsPerPage = 10,
		siblingCount = 1,
		class: className,
		...rest
	} = $props();

	const showPagination = $derived(totalItems > 10);
	const totalPages = $derived(Math.ceil(totalItems / itemsPerPage));

	function getPaginationItems() {
		const items = [];
		const total = totalPages;

		if (total <= 1) return items;

		items.push({ type: 'page', value: 1, key: '1' });

		const start = Math.max(2, currentPage - siblingCount);
		const end = Math.min(total - 1, currentPage + siblingCount);

		if (start > 2) {
			items.push({ type: 'ellipsis', key: 'start-ellipsis' });
		}

		for (let i = start; i <= end; i++) {
			items.push({ type: 'page', value: i, key: i.toString() });
		}

		if (end < total - 1) {
			items.push({ type: 'ellipsis', key: 'end-ellipsis' });
		}

		if (total > 1) {
			items.push({ type: 'page', value: total, key: total.toString() });
		}

		return items;
	}

	const paginationItems = $derived(getPaginationItems());

	function goToPage(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
		}
	}
</script>

{#if showPagination}
	<nav
		class={['flex items-center justify-center gap-1', className]}
		aria-label="Pagination"
		{...rest}
	>
		<button
			type="button"
			disabled={currentPage <= 1}
			onclick={() => goToPage(currentPage - 1)}
			class="text-muted hover:text-foreground disabled:hover:text-muted px-3 py-1.5 text-xs transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label="Previous page"
		>
			Previous
		</button>

		{#each paginationItems as item (item.key)}
			{#if item.type === 'page'}
				<button
					type="button"
					onclick={() => goToPage(item.value)}
					class={[
						'min-w-8 px-2.5 py-1.5 text-xs transition-all duration-200',
						item.value === currentPage
							? 'font-bold'
							: 'text-muted hover:text-foreground'
					]}
					aria-label={`Page ${item.value}`}
					aria-current={item.value === currentPage ? 'page' : undefined}
				>
					{item.value}
				</button>
			{:else}
				<span class="text-muted px-2 py-1.5 text-xs" aria-hidden="true">…</span>
			{/if}
		{/each}

		<button
			type="button"
			disabled={currentPage >= totalPages}
			onclick={() => goToPage(currentPage + 1)}
			class="text-muted hover:text-foreground disabled:hover:text-muted px-3 py-1.5 text-xs transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
			aria-label="Next page"
		>
			Next
		</button>
	</nav>
{/if}
