<script>
	import { cn } from '$lib/utils/cn.js';

	let {
		children,
		variant = 'default',
		class: className,
		onclick,
		type = 'button',
		...rest
	} = $props();

	const variants = {
		default: 'text-foreground hover:text-foreground',
		ghost: 'text-muted hover:text-foreground',
		link: 'text-accent hover:underline'
	};
</script>

<button
	{type}
	{onclick}
	class={cn('text-xs transition-colors', variants[variant], className)}
	{...rest}
>
	{@render children()}
</button>
