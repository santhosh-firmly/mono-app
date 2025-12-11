<script>
	import { cn } from '$lib/utils/cn.js';

	let { class: className, ...rest } = $props();
</script>

<div class={cn('bg-muted/20 animate-pulse rounded', className)} {...rest}></div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
