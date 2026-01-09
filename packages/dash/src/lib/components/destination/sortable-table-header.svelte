<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';

	/**
	 * @typedef {'asc' | 'desc' | null} SortDirection
	 */

	let {
		label = '',
		sortKey = '',
		currentSortKey = '',
		/** @type {SortDirection} */
		sortDirection = null,
		onclick = () => {},
		class: className = ''
	} = $props();

	let isActive = $derived(currentSortKey === sortKey);

	function getSortIcon() {
		if (!isActive) return ArrowUpDown;
		return sortDirection === 'asc' ? ArrowUp : ArrowDown;
	}

	let SortIcon = $derived(getSortIcon());
</script>

<Table.Head class={className}>
	<Button variant="ghost" size="sm" class="h-8 -ml-3 font-medium" {onclick}>
		{label}
		<SortIcon class="ml-2 h-4 w-4" />
	</Button>
</Table.Head>
