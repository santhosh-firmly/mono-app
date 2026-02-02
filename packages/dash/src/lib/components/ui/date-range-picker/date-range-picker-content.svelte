<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import DateRangePickerCalendar from './date-range-picker-calendar.svelte';
	import DateRangePickerPresets from './date-range-picker-presets.svelte';
	import DateRangePickerInputs from './date-range-picker-inputs.svelte';
	import DateRangePickerTimezone from './date-range-picker-timezone.svelte';

	let {
		value = { start: null, end: null },
		presets = [],
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
		granularity = 'day',
		minDate = null,
		maxDate = null,
		weekStartsOn = 0,
		onSelect = () => {},
		onCancel = () => {},
		onTimezoneChange = () => {}
	} = $props();

	let workingValue = $state({ ...value });
	let workingTimezone = $state(timezone);

	$effect(() => {
		workingValue = { ...value };
	});

	$effect(() => {
		workingTimezone = timezone;
	});

	function handleCalendarSelect(range) {
		workingValue = range;
	}

	function handlePresetSelect(range) {
		workingValue = range;
	}

	function handleInputChange(range) {
		workingValue = range;
	}

	function handleTimezoneChange(tz) {
		workingTimezone = tz;
		onTimezoneChange(tz);
	}

	function handleCancel() {
		workingValue = { ...value };
		workingTimezone = timezone;
		onCancel();
	}

	function handleSelect() {
		onSelect(workingValue, workingTimezone);
	}
</script>

<div class="flex flex-col">
	<div class="flex items-center justify-between border-b px-4 py-3">
		<span class="text-sm font-medium">Select Date Range</span>
		<DateRangePickerTimezone value={workingTimezone} onChange={handleTimezoneChange} />
	</div>

	<div class="flex">
		{#if presets.length > 0}
			<div class="py-3 pl-3">
				<DateRangePickerPresets
					{presets}
					value={workingValue}
					onSelect={handlePresetSelect}
				/>
			</div>
		{/if}

		<div class="flex-1">
			<DateRangePickerCalendar
				value={workingValue}
				onSelect={handleCalendarSelect}
				{minDate}
				{maxDate}
				{weekStartsOn}
			/>
		</div>
	</div>

	{#if granularity !== 'day'}
		<DateRangePickerInputs
			value={workingValue}
			onChange={handleInputChange}
			{granularity}
		/>
	{/if}

	<div class="flex justify-end gap-2 border-t px-4 py-3">
		<Button variant="outline" size="sm" onclick={handleCancel}>
			Cancel
		</Button>
		<Button size="sm" onclick={handleSelect}>
			Select
		</Button>
	</div>
</div>
