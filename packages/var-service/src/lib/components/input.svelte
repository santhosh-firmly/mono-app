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
		'border-border w-full rounded-full border bg-white px-4 py-3 text-sm',
		'focus:border-foreground transition-colors focus:outline-none',
		className
	)}
	{...rest}
/>
