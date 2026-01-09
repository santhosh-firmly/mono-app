<script>
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		title = 'Order Details',
		subtitle = '',
		currentIndex = 0,
		totalOrders = 0,
		hasPrev = false,
		hasNext = false,
		onBack = () => {},
		onPrev = () => {},
		onNext = () => {}
	} = $props();

	let displaySubtitle = $derived(
		subtitle || (currentIndex && totalOrders ? `Order ${currentIndex} of ${totalOrders}` : '')
	);
</script>

<div class="flex items-center gap-4">
	<Button variant="ghost" size="icon" onclick={onBack} class="h-8 w-8">
		<ArrowLeft class="h-4 w-4" />
		<span class="sr-only">Back to orders</span>
	</Button>
	<div class="flex-1">
		<h1 class="text-2xl font-semibold text-gray-900">{title}</h1>
		{#if displaySubtitle}
			<p class="text-sm text-muted-foreground">
				{displaySubtitle}
			</p>
		{/if}
	</div>
	<div class="flex gap-2">
		<Button variant="outline" size="icon" disabled={!hasPrev} onclick={onPrev}>
			<ChevronLeft class="h-4 w-4" />
			<span class="sr-only">Previous order</span>
		</Button>
		<Button variant="outline" size="icon" disabled={!hasNext} onclick={onNext}>
			<ChevronRight class="h-4 w-4" />
			<span class="sr-only">Next order</span>
		</Button>
	</div>
</div>
