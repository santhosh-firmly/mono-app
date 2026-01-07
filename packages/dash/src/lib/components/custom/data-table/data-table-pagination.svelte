<script>
	import ChevronRight from 'svelte-radix/ChevronRight.svelte';
	import ChevronLeft from 'svelte-radix/ChevronLeft.svelte';
	import DoubleArrowRight from 'svelte-radix/DoubleArrowRight.svelte';
	import DoubleArrowLeft from 'svelte-radix/DoubleArrowLeft.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	export let tableModel;

	const { pageRows, pluginStates, rows } = tableModel;
	const { hasNextPage, hasPreviousPage, pageIndex, pageCount, pageSize } = pluginStates.page;

	const rowsPerPageOptions = [10, 20, 30, 40, 50];
</script>

<div class="flex items-center justify-between px-2">
	<div class="flex-1 text-sm text-muted-foreground">
		{$rows.length} row(s) selected.
	</div>
	<div class="flex items-center space-x-6 lg:space-x-8">
		<div class="flex items-center space-x-2">
			<p class="text-sm font-medium">Rows per page</p>
			<Select.Root
				type="single"
				value={String($pageSize)}
				onValueChange={(value) => pageSize.set(Number(value))}
			>
				<Select.Trigger class="h-8 w-[70px]">
					<Select.Value placeholder="Select page size">{$pageSize}</Select.Value>
				</Select.Trigger>
				<Select.Content>
					{#each rowsPerPageOptions as quantity (quantity)}
						<Select.Item value={String(quantity)}>{quantity}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-[100px] items-center justify-center text-sm font-medium">
			Page {$pageIndex + 1} of {$pageCount}
		</div>
		<div class="flex items-center space-x-2">
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				on:click={() => ($pageIndex = 0)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to first page</span>
				<DoubleArrowLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="h-8 w-8 p-0"
				on:click={() => ($pageIndex = $pageIndex - 1)}
				disabled={!$hasPreviousPage}
			>
				<span class="sr-only">Go to previous page</span>
				<ChevronLeft size={15} />
			</Button>
			<Button
				variant="outline"
				class="h-8 w-8 p-0"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = $pageIndex + 1)}
			>
				<span class="sr-only">Go to next page</span>
				<ChevronRight size={15} />
			</Button>
			<Button
				variant="outline"
				class="hidden h-8 w-8 p-0 lg:flex"
				disabled={!$hasNextPage}
				on:click={() => ($pageIndex = Math.ceil($rows.length / $pageRows.length) - 1)}
			>
				<span class="sr-only">Go to last page</span>
				<DoubleArrowRight size={15} />
			</Button>
		</div>
	</div>
</div>
