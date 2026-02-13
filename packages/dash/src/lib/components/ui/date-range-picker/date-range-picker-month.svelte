<script>
	import { cn } from '$lib/utils.js';
	import {
		startOfMonth,
		endOfMonth,
		startOfWeek,
		endOfWeek,
		eachDayOfInterval,
		isSameMonth,
		isSameDay,
		isWithinInterval,
		isBefore,
		isAfter,
		format
	} from 'date-fns';

	let {
		month,
		selectedRange = { start: null, end: null },
		hoverDate = null,
		onDayClick = () => {},
		onDayHover = () => {},
		minDate = null,
		maxDate = null,
		weekStartsOn = 0
	} = $props();

	const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let orderedWeekDays = $derived([
		...weekDays.slice(weekStartsOn),
		...weekDays.slice(0, weekStartsOn)
	]);

	let monthStart = $derived(startOfMonth(month));
	let monthEnd = $derived(endOfMonth(month));
	let calendarStart = $derived(startOfWeek(monthStart, { weekStartsOn }));
	let calendarEnd = $derived(endOfWeek(monthEnd, { weekStartsOn }));
	let days = $derived(eachDayOfInterval({ start: calendarStart, end: calendarEnd }));

	function isDisabled(day) {
		if (minDate && isBefore(day, minDate)) return true;
		if (maxDate && isAfter(day, maxDate)) return true;
		return false;
	}

	function isSelected(day) {
		if (selectedRange.start && isSameDay(day, selectedRange.start)) return true;
		if (selectedRange.end && isSameDay(day, selectedRange.end)) return true;
		return false;
	}

	function isRangeStart(day) {
		return selectedRange.start && isSameDay(day, selectedRange.start);
	}

	function isRangeEnd(day) {
		return selectedRange.end && isSameDay(day, selectedRange.end);
	}

	function isInRange(day) {
		if (!selectedRange.start || !selectedRange.end) return false;
		return isWithinInterval(day, {
			start: selectedRange.start,
			end: selectedRange.end
		});
	}

	function isInHoverRange(day) {
		if (!selectedRange.start || selectedRange.end || !hoverDate) return false;
		const start = isBefore(hoverDate, selectedRange.start) ? hoverDate : selectedRange.start;
		const end = isBefore(hoverDate, selectedRange.start) ? selectedRange.start : hoverDate;
		return isWithinInterval(day, { start, end });
	}

	function isOutsideMonth(day) {
		return !isSameMonth(day, month);
	}

	function handleClick(day) {
		if (isDisabled(day)) return;
		onDayClick(day);
	}

	function handleMouseEnter(day) {
		if (isDisabled(day)) return;
		onDayHover(day);
	}
</script>

<div class="p-3">
	<div class="mb-2 grid grid-cols-7 gap-1">
		{#each orderedWeekDays as dayName}
			<div
				class="flex h-8 items-center justify-center text-center text-xs font-medium text-muted-foreground"
			>
				{dayName}
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-7 gap-1">
		{#each days as day}
			{@const disabled = isDisabled(day)}
			{@const selected = isSelected(day)}
			{@const rangeStart = isRangeStart(day)}
			{@const rangeEnd = isRangeEnd(day)}
			{@const inRange = isInRange(day)}
			{@const inHoverRange = isInHoverRange(day)}
			{@const outsideMonth = isOutsideMonth(day)}
			<button
				type="button"
				class={cn(
					'h-8 w-8 rounded-md text-sm transition-colors',
					'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
					'disabled:pointer-events-none disabled:opacity-50',
					outsideMonth && 'text-muted-foreground/50',
					!outsideMonth && !selected && !inRange && !inHoverRange && 'hover:bg-accent',
					(inRange || inHoverRange) && !selected && 'bg-accent',
					selected && 'bg-primary text-primary-foreground hover:bg-primary/90',
					rangeStart && 'rounded-r-none',
					rangeEnd && 'rounded-l-none',
					inRange && !selected && 'rounded-none'
				)}
				{disabled}
				onclick={() => handleClick(day)}
				onmouseenter={() => handleMouseEnter(day)}
			>
				{format(day, 'd')}
			</button>
		{/each}
	</div>
</div>
