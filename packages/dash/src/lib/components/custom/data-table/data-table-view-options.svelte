<script>
	import MixerHorizontal from 'svelte-radix/MixerHorizontal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	export let tableModel;
	const { pluginStates, flatColumns } = tableModel;
	const { hiddenColumnIds } = pluginStates.hide;

	function handleHide(id) {
		hiddenColumnIds.update((ids) => {
			if (ids.includes(id)) {
				return ids.filter((i) => i !== id);
			}
			return [...ids, id];
		});
	}

	const hidableCols = ['title', 'status', 'priority'];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline" size="sm" class="ml-auto h-8">
			<MixerHorizontal class="mr-2 h-4 w-4" />
			View
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>Toggle columns</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each flatColumns as col (col.id)}
			{#if hidableCols.includes(col.id)}
				<DropdownMenu.CheckboxItem
					checked={!$hiddenColumnIds.includes(col.id)}
					onCheckedChange={() => handleHide(col.id)}
				>
					{col.header}
				</DropdownMenu.CheckboxItem>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
