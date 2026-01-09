<script>
	import { cn } from '$lib/utils.js';

	let { class: className, ...restProps } = $props();
</script>

<div class={cn('-mx-1 my-1 h-px bg-muted', className)} role="separator" {...restProps}></div>
