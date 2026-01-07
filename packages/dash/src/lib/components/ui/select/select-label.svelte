<script>
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps } = $props();
</script>

<div class={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)} {...restProps}>
	{@render children?.()}
</div>
