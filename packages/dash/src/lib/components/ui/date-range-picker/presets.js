import {
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	subDays,
	subMonths,
	startOfQuarter,
	endOfQuarter,
	subQuarters,
	startOfYear,
	endOfYear,
	subYears
} from "date-fns";

/**
 * Creates an array of default date range presets.
 * Each preset has a label and a getValue function that returns { start, end } dates.
 * @param {Object} options - Configuration options
 * @param {number} options.weekStartsOn - Day of the week (0 = Sunday, 1 = Monday, etc.)
 * @returns {Array<{ label: string, getValue: () => { start: Date, end: Date } }>}
 */
export function createDefaultPresets(options = {}) {
	const { weekStartsOn = 0 } = options;
	const weekOptions = { weekStartsOn };

	return [
		{
			label: "Today",
			comparisonLabel: "vs yesterday",
			getValue: () => {
				const today = new Date();
				return { start: today, end: today };
			}
		},
		{
			label: "This week",
			comparisonLabel: "vs last week",
			getValue: () => {
				const today = new Date();
				return {
					start: startOfWeek(today, weekOptions),
					end: endOfWeek(today, weekOptions)
				};
			}
		},
		{
			label: "This month",
			comparisonLabel: "vs last month",
			getValue: () => {
				const today = new Date();
				return {
					start: startOfMonth(today),
					end: endOfMonth(today)
				};
			}
		},
		{
			label: "This quarter",
			comparisonLabel: "vs last quarter",
			getValue: () => {
				const today = new Date();
				return {
					start: startOfQuarter(today),
					end: endOfQuarter(today)
				};
			}
		},
		{
			label: "This year",
			comparisonLabel: "vs last year",
			getValue: () => {
				const today = new Date();
				return {
					start: startOfYear(today),
					end: endOfYear(today)
				};
			}
		},
		{
			label: "Last week",
			comparisonLabel: "vs week before",
			getValue: () => {
				const lastWeek = subDays(new Date(), 7);
				return {
					start: startOfWeek(lastWeek, weekOptions),
					end: endOfWeek(lastWeek, weekOptions)
				};
			}
		},
		{
			label: "Last month",
			comparisonLabel: "vs month before",
			getValue: () => {
				const lastMonth = subMonths(new Date(), 1);
				return {
					start: startOfMonth(lastMonth),
					end: endOfMonth(lastMonth)
				};
			}
		},
		{
			label: "Last quarter",
			comparisonLabel: "vs quarter before",
			getValue: () => {
				const lastQuarter = subQuarters(new Date(), 1);
				return {
					start: startOfQuarter(lastQuarter),
					end: endOfQuarter(lastQuarter)
				};
			}
		},
		{
			label: "Last year",
			comparisonLabel: "vs year before",
			getValue: () => {
				const lastYear = subYears(new Date(), 1);
				return {
					start: startOfYear(lastYear),
					end: endOfYear(lastYear)
				};
			}
		},
		{
			label: "Last 30 days",
			comparisonLabel: "vs previous 30 days",
			getValue: () => {
				const today = new Date();
				return {
					start: subDays(today, 29),
					end: today
				};
			}
		},
		{
			label: "Last 90 days",
			comparisonLabel: "vs previous 90 days",
			getValue: () => {
				const today = new Date();
				return {
					start: subDays(today, 89),
					end: today
				};
			}
		},
		{
			label: "Last 365 days",
			comparisonLabel: "vs previous 365 days",
			getValue: () => {
				const today = new Date();
				return {
					start: subDays(today, 364),
					end: today
				};
			}
		},
		{
			label: "All time",
			comparisonLabel: "",
			getValue: () => {
				return { start: null, end: null };
			}
		}
	];
}
