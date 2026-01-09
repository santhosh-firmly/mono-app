<script>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import Circle from 'lucide-svelte/icons/circle';
	import { cn } from '$lib/utils.js';

	let { value, class: className, children: slotContent, ...restProps } = $props();
</script>

<DropdownMenuPrimitive.RadioItem
	class={cn(
		'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
		className
	)}
	{value}
	{...restProps}
>
	{#snippet children({ checked })}
		<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			{#if checked}
				<Circle class="h-2 w-2 fill-current" />
			{/if}
		</span>
		{@render slotContent?.()}
	{/snippet}
</DropdownMenuPrimitive.RadioItem>
