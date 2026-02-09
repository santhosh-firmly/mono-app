<script>
	import { cn } from '$lib/utils.js';

	let { placeholder = '', class: className, children, ...restProps } = $props();
</script>

<span class={cn('pointer-events-none', className)} data-placeholder={!children} {...restProps}>
	{#if children}
		{@render children()}
	{:else}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>
