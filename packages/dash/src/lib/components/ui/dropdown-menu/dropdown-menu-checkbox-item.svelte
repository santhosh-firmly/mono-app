<script>
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import Check from 'lucide-svelte/icons/check';
	import { cn } from '$lib/utils.js';

	let {
		checked = $bindable(false),
		class: className,
		children: slotContent,
		...restProps
	} = $props();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:checked
	class={cn(
		'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked: isChecked })}
		<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			{#if isChecked}
				<Check class="h-4 w-4" />
			{/if}
		</span>
		{@render slotContent?.()}
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
