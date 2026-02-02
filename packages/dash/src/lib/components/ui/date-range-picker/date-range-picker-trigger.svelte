<script>
	import { cn } from '$lib/utils.js';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { format } from 'date-fns';

	let {
		value = { start: null, end: null },
		placeholder = 'Select date range',
		disabled = false,
		class: className,
		...restProps
	} = $props();

	let displayText = $derived(formatDateRange(value));
	let hasValue = $derived(value.start || value.end);

	function formatDateRange(range) {
		if (!range.start && !range.end) {
			return placeholder;
		}
		if (range.start && range.end) {
			return `${format(range.start, 'MMM d, yyyy')} - ${format(range.end, 'MMM d, yyyy')}`;
		}
		if (range.start) {
			return `${format(range.start, 'MMM d, yyyy')} - ...`;
		}
		return placeholder;
	}
</script>

<PopoverPrimitive.Trigger
	{disabled}
	class={cn(
		buttonVariants({ variant: 'outline' }),
		'w-[280px] justify-start text-left font-normal',
		!hasValue && 'text-muted-foreground',
		className
	)}
	{...restProps}
>
	<CalendarIcon class="mr-2 h-4 w-4" />
	{displayText}
</PopoverPrimitive.Trigger>
