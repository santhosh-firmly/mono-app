<script>
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let { value, class: className, children, ...restProps } = $props();
</script>

<TabsPrimitive.Content
	class={cn(
		'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		className
	)}
	{value}
	{...restProps}
>
	{@render children?.()}
</TabsPrimitive.Content>
