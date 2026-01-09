<script>
	import { Pagination as PaginationPrimitive } from 'bits-ui';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	let className = undefined;
	export { className as class };
</script>

<PaginationPrimitive.NextButton>
	<Button variant="ghost" class={cn('gap-1 pr-2.5', className)} on:click {...$$restProps}>
		<slot>
			<span>Next</span>
			<ChevronRight class="h-4 w-4" />
		</slot>
	</Button>
</PaginationPrimitive.NextButton>
