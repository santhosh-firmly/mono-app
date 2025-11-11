<script>
	import { cn } from '$lib/utils/cn.js';

	let {
		value = $bindable(''),
		placeholder = '',
		type = 'text',
		class: className,
		...rest
	} = $props();
</script>

<input
	bind:value
	{type}
	{placeholder}
	class={cn(
		'w-full px-4 py-3 text-sm bg-white border-0 border-b border-border',
		'focus:border-foreground focus:outline-none transition-colors',
		className
	)}
	{...rest}
/>
