<script>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	let {
		children,
		open = $bindable(false),
		trigger,
		items = [],
		align = 'end',
		...rest
	} = $props();
</script>

<DropdownMenuPrimitive.Root bind:open {...rest}>
	<DropdownMenuPrimitive.Trigger class="outline-none">
		{@render trigger()}
	</DropdownMenuPrimitive.Trigger>

	<DropdownMenuPrimitive.Content
		class={[
			'border-border bg-background z-50 min-w-40 rounded-lg border p-1 shadow-lg',
			'animate-in fade-in-0 zoom-in-95'
		]}
		{align}
		sideOffset={4}
	>
		{#if children}
			{@render children()}
		{:else}
			{#each items as item (item.label)}
				{#if item.separator}
					<DropdownMenuPrimitive.Separator class="bg-border -mx-1 my-1 h-px" />
				{:else}
					<DropdownMenuPrimitive.Item
						class={[
							'text-foreground hover:bg-hover relative flex cursor-pointer items-center rounded-md px-3 py-2 text-xs transition-colors outline-none select-none',
							item.destructive && 'text-red-600 hover:bg-red-50'
						]}
						onselect={item.onSelect}
						disabled={item.disabled}
					>
						{item.label}
					</DropdownMenuPrimitive.Item>
				{/if}
			{/each}
		{/if}
	</DropdownMenuPrimitive.Content>
</DropdownMenuPrimitive.Root>
