<script>
	import { cn } from '$lib/utils.js';

	let { placeholder = '', class: className, children, ...restProps } = $props();
</script>

<span class={cn('pointer-events-none', className)} {...restProps}>
	{@render children?.()}
	{#if !children}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>
