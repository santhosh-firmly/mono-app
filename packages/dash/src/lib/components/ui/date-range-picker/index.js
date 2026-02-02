import Root from './date-range-picker.svelte';
import Trigger from './date-range-picker-trigger.svelte';
import Content from './date-range-picker-content.svelte';
import Calendar from './date-range-picker-calendar.svelte';
import Month from './date-range-picker-month.svelte';
import Presets from './date-range-picker-presets.svelte';
import Inputs from './date-range-picker-inputs.svelte';
import Timezone from './date-range-picker-timezone.svelte';
import { createDefaultPresets } from './presets.js';

export {
	Root,
	Trigger,
	Content,
	Calendar,
	Month,
	Presets,
	Inputs,
	Timezone,
	createDefaultPresets,
	//
	Root as DateRangePicker,
	Trigger as DateRangePickerTrigger,
	Content as DateRangePickerContent,
	Calendar as DateRangePickerCalendar,
	Month as DateRangePickerMonth,
	Presets as DateRangePickerPresets,
	Inputs as DateRangePickerInputs,
	Timezone as DateRangePickerTimezone
};
