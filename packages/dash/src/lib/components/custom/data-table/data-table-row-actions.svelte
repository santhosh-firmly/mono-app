<script lang="ts">
	import DotsHorizontal from 'svelte-radix/DotsHorizontal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let { onEdit, onOpenProducts } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
		>
			<DotsHorizontal class="h-4 w-4" />
			<span class="sr-only">Open Menu</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-[160px]" align="end">
		<DropdownMenu.Item on:click={onEdit}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item on:click={onOpenProducts}>Products</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
