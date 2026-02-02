<script>
	import { untrack } from 'svelte';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import { AdminDashboard } from '$lib/components/admin/dashboard/index.js';
	import { adminFetch } from '$lib/utils/fetch.js';
	import { createDefaultPresets } from '$lib/components/ui/date-range-picker/presets.js';
	import {
		startOfMonth,
		startOfWeek,
		endOfWeek,
		endOfMonth,
		subMonths,
		subDays,
		startOfQuarter,
		endOfQuarter,
		subQuarters,
		startOfYear,
		endOfYear,
		subYears,
		differenceInMilliseconds,
		isSameDay
	} from 'date-fns';

	const presets = createDefaultPresets();

	let dashboardData = $state(null);
	let loading = $state(true);
	let error = $state('');
	let selectedMerchants = $state([]);
	let selectedDestinations = $state([]);
	let dateRange = $state({ start: startOfMonth(new Date()), end: new Date() });
	let selectedPresetLabel = $state('This month');
	let comparisonLabel = $state('vs last month');

	/**
	 * Find the preset matching a given date range by comparing start/end days.
	 * Returns the preset object or null for custom ranges.
	 */
	function findMatchingPreset(range) {
		for (const preset of presets) {
			const presetRange = preset.getValue();
			if (presetRange.start === null && presetRange.end === null) {
				if (range.start === null && range.end === null) return preset;
				continue;
			}
			if (!range.start || !range.end || !presetRange.start || !presetRange.end) continue;
			if (isSameDay(range.start, presetRange.start) && isSameDay(range.end, presetRange.end)) {
				return preset;
			}
		}
		return null;
	}

	/**
	 * Compute the comparison date range for the given period and preset label.
	 * Returns { start, end } or null (for All time / no comparison).
	 */
	function computeComparisonRange(range, presetLabel) {
		const now = new Date();
		switch (presetLabel) {
			case 'Today':
				return { start: subDays(now, 1), end: subDays(now, 1) };
			case 'This week':
				return {
					start: startOfWeek(subDays(now, 7)),
					end: endOfWeek(subDays(now, 7))
				};
			case 'This month':
				return {
					start: startOfMonth(subMonths(now, 1)),
					end: endOfMonth(subMonths(now, 1))
				};
			case 'This quarter':
				return {
					start: startOfQuarter(subQuarters(now, 1)),
					end: endOfQuarter(subQuarters(now, 1))
				};
			case 'This year':
				return {
					start: startOfYear(subYears(now, 1)),
					end: endOfYear(subYears(now, 1))
				};
			case 'Last week': {
				const ref = subDays(now, 14);
				return { start: startOfWeek(ref), end: endOfWeek(ref) };
			}
			case 'Last month': {
				const ref = subMonths(now, 2);
				return { start: startOfMonth(ref), end: endOfMonth(ref) };
			}
			case 'Last quarter': {
				const ref = subQuarters(now, 2);
				return { start: startOfQuarter(ref), end: endOfQuarter(ref) };
			}
			case 'Last year': {
				const ref = subYears(now, 2);
				return { start: startOfYear(ref), end: endOfYear(ref) };
			}
			case 'Last 30 days':
				return { start: subDays(range.start, 30), end: subDays(range.end, 30) };
			case 'Last 90 days':
				return { start: subDays(range.start, 90), end: subDays(range.end, 90) };
			case 'Last 365 days':
				return { start: subDays(range.start, 365), end: subDays(range.end, 365) };
			case 'All time':
				return null;
			default: {
				// Custom range — shift back by the same duration
				if (!range.start || !range.end) return null;
				const durationMs = differenceInMilliseconds(range.end, range.start);
				const compareEnd = subDays(range.start, 1);
				return {
					start: new Date(compareEnd.getTime() - durationMs),
					end: compareEnd
				};
			}
		}
	}

	function handleDateRangeSelect(range) {
		dateRange = range;
		const matched = findMatchingPreset(range);
		if (matched) {
			selectedPresetLabel = matched.label;
			comparisonLabel = matched.comparisonLabel;
		} else {
			selectedPresetLabel = 'Custom';
			comparisonLabel = 'vs previous period';
		}
	}

	$effect(() => {
		// Track filter and date-range selections — re-fetch when they change
		const merchantNames = [...selectedMerchants];
		const destNames = [...selectedDestinations];
		const _start = dateRange.start;
		const _end = dateRange.end;

		// Use untrack so that reading dashboardData (for name→key mapping)
		// does NOT make this effect re-run when new data arrives.
		untrack(() => {
			fetchDashboardData(merchantNames, destNames);
		});
	});

	/**
	 * Fetch dashboard data, mapping selected display-name filters to
	 * domain / appId keys the API expects.
	 */
	async function fetchDashboardData(merchantNames = [], destNames = []) {
		loading = true;
		error = '';

		try {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- URLSearchParams used for fetch URL building, not reactive state
			const params = new URLSearchParams();

			// Date range params
			if (dateRange.start && dateRange.end) {
				params.append('startDate', dateRange.start.toISOString());
				params.append('endDate', dateRange.end.toISOString());

				const compRange = computeComparisonRange(dateRange, selectedPresetLabel);
				if (compRange) {
					params.append('compareStartDate', compRange.start.toISOString());
					params.append('compareEndDate', compRange.end.toISOString());
				}
			}

			params.append('periodLabel', selectedPresetLabel);
			const comparePeriodLabel = comparisonLabel
				? comparisonLabel
						.replace(/^vs /, '')
						.replace(/^./, (c) => c.toUpperCase())
				: '';
			params.append('comparePeriodLabel', comparePeriodLabel);

			// Map display names → domain keys using the last-fetched merchant list
			if (dashboardData?.merchants && merchantNames.length > 0) {
				const merchantMap = new Map(
					dashboardData.merchants.map((m) => [m.displayName, m.domain])
				);
				for (const name of merchantNames) {
					const key = merchantMap.get(name);
					if (key) params.append('merchant', key);
				}
			}

			// Map display names → appId keys using the last-fetched destination list
			if (dashboardData?.destinations && destNames.length > 0) {
				const destMap = new Map(
					dashboardData.destinations.map((d) => [d.displayName, d.appId])
				);
				for (const name of destNames) {
					const key = destMap.get(name);
					if (key) params.append('destination', key);
				}
			}

			const queryString = params.toString();
			const url = `/admin/api/dashboard${queryString ? `?${queryString}` : ''}`;

			const response = await adminFetch(url);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch dashboard data');
			}

			dashboardData = result;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function handleRefresh() {
		fetchDashboardData([...selectedMerchants], [...selectedDestinations]);
	}
</script>

<main class="flex flex-col gap-4 bg-background p-4 sm:px-6 sm:py-4 md:gap-8">
	<PageHeader title="Dashboard" />
	<AdminDashboard
		{dashboardData}
		{loading}
		{error}
		{dateRange}
		{comparisonLabel}
		{selectedPresetLabel}
		bind:selectedMerchants
		bind:selectedDestinations
		onRefresh={handleRefresh}
		onDateRangeSelect={handleDateRangeSelect}
	/>
</main>
