<script>
	import { cn } from '$lib/utils.js';
	import { addMonths, subMonths, format, isBefore } from 'date-fns';
	import DateRangePickerMonth from './date-range-picker-month.svelte';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';

	let {
		value = { start: null, end: null },
		onSelect = () => {},
		minDate = null,
		maxDate = null,
		weekStartsOn = 0
	} = $props();

	let viewDate = $state(value.start || new Date());
	let hoverDate = $state(null);
	let selectionState = $state(
		value.start && !value.end ? 'selecting-end' : 'selecting-start'
	);

	let leftMonth = $derived(viewDate);
	let rightMonth = $derived(addMonths(viewDate, 1));

	function goToPreviousMonth() {
		viewDate = subMonths(viewDate, 1);
	}

	function goToNextMonth() {
		viewDate = addMonths(viewDate, 1);
	}

	function handleDayClick(day) {
		if (selectionState === 'selecting-start') {
			onSelect({ start: day, end: null });
			selectionState = 'selecting-end';
		} else {
			let start = value.start;
			let end = day;
			if (isBefore(end, start)) {
				[start, end] = [end, start];
			}
			onSelect({ start, end });
			selectionState = 'selecting-start';
		}
	}

	function handleDayHover(day) {
		hoverDate = day;
	}

	function handleMouseLeave() {
		hoverDate = null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex flex-col" onmouseleave={handleMouseLeave}>
	<div class="flex items-center justify-between px-3 py-2">
		<button
			type="button"
			class={cn(
				'inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent p-0 opacity-50 hover:opacity-100',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
			)}
			onclick={goToPreviousMonth}
		>
			<ChevronLeft class="h-4 w-4" />
			<span class="sr-only">Previous month</span>
		</button>

		<div class="flex gap-4">
			<div class="min-w-[120px] text-center text-sm font-medium">
				{format(leftMonth, 'MMMM yyyy')}
			</div>
			<div class="min-w-[120px] text-center text-sm font-medium">
				{format(rightMonth, 'MMMM yyyy')}
			</div>
		</div>

		<button
			type="button"
			class={cn(
				'inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent p-0 opacity-50 hover:opacity-100',
				'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
			)}
			onclick={goToNextMonth}
		>
			<ChevronRight class="h-4 w-4" />
			<span class="sr-only">Next month</span>
		</button>
	</div>

	<div class="flex gap-4">
		<DateRangePickerMonth
			month={leftMonth}
			selectedRange={value}
			{hoverDate}
			onDayClick={handleDayClick}
			onDayHover={handleDayHover}
			{minDate}
			{maxDate}
			{weekStartsOn}
		/>
		<DateRangePickerMonth
			month={rightMonth}
			selectedRange={value}
			{hoverDate}
			onDayClick={handleDayClick}
			onDayHover={handleDayHover}
			{minDate}
			{maxDate}
			{weekStartsOn}
		/>
	</div>
</div>
