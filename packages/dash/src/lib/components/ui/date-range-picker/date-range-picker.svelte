<script>
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { differenceInCalendarDays, addDays, subDays, startOfDay } from 'date-fns';
	import DateRangePickerTrigger from './date-range-picker-trigger.svelte';
	import DateRangePickerContent from './date-range-picker-content.svelte';
	import { createDefaultPresets } from './presets.js';

	let {
		value = { start: null, end: null },
		presets = createDefaultPresets(),
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
		granularity = 'day',
		placeholder = 'Select date range',
		disabled = false,
		minDate = null,
		maxDate = null,
		weekStartsOn = 0,
		showNavigation = false,
		onSelect = () => {},
		onCancel = () => {}
	} = $props();

	let open = $state(false);

	let canNavigate = $derived(value.start != null && value.end != null);

	let forwardDisabled = $derived(
		!canNavigate ||
			(maxDate != null && addDays(value.end, 1) > startOfDay(maxDate))
	);

	let backwardDisabled = $derived(
		!canNavigate ||
			(minDate != null &&
				subDays(value.start, differenceInCalendarDays(value.end, value.start) + 1) <
					startOfDay(minDate))
	);

	function shiftForward() {
		if (!value.start || !value.end) return;
		const days = differenceInCalendarDays(value.end, value.start) + 1;
		const newValue = { start: addDays(value.end, 1), end: addDays(value.end, days) };
		value = newValue;
		onSelect(newValue, timezone);
	}

	function shiftBackward() {
		if (!value.start || !value.end) return;
		const days = differenceInCalendarDays(value.end, value.start) + 1;
		const newValue = { start: subDays(value.start, days), end: subDays(value.start, 1) };
		value = newValue;
		onSelect(newValue, timezone);
	}

	function handleSelect(selectedValue, selectedTimezone) {
		value = selectedValue;
		timezone = selectedTimezone;
		open = false;
		onSelect(selectedValue, selectedTimezone);
	}

	function handleCancel() {
		open = false;
		onCancel();
	}

	function handleTimezoneChange(tz) {
		timezone = tz;
	}
</script>

{#snippet popover()}
	<PopoverPrimitive.Root bind:open>
		<DateRangePickerTrigger {value} {placeholder} {disabled} />
		<PopoverPrimitive.Content
			sideOffset={4}
			class={cn(
				'z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none'
			)}
		>
			<DateRangePickerContent
				{value}
				{presets}
				{timezone}
				{granularity}
				{minDate}
				{maxDate}
				{weekStartsOn}
				onSelect={handleSelect}
				onCancel={handleCancel}
				onTimezoneChange={handleTimezoneChange}
			/>
		</PopoverPrimitive.Content>
	</PopoverPrimitive.Root>
{/snippet}

{#if showNavigation}
	<div class="flex items-center gap-1">
		<Button
			variant="outline"
			size="icon"
			disabled={disabled || backwardDisabled}
			onclick={shiftBackward}
			class="h-10 w-10 shrink-0"
		>
			<ChevronLeft class="h-4 w-4" />
			<span class="sr-only">Previous period</span>
		</Button>
		{@render popover()}
		<Button
			variant="outline"
			size="icon"
			disabled={disabled || forwardDisabled}
			onclick={shiftForward}
			class="h-10 w-10 shrink-0"
		>
			<ChevronRight class="h-4 w-4" />
			<span class="sr-only">Next period</span>
		</Button>
	</div>
{:else}
	{@render popover()}
{/if}
