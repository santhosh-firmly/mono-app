import { get, getColumnType } from './data-utils.js';

/**
 * Parse search text into individual terms (handling quoted phrases)
 * @param {string} searchText - The search text
 * @returns {Array<string>} Array of search terms
 */
export function parseSearchTerms(searchText) {
	const terms = [];
	// Match quoted strings or individual words
	const regex = /"([^"]*)"|(\S+)/g;
	let match;

	while ((match = regex.exec(searchText)) !== null) {
		// match[1] is quoted string content, match[2] is unquoted word
		const term = (match[1] || match[2]).trim();
		if (term) {
			terms.push(term.toLowerCase());
		}
	}

	return terms;
}

/**
 * Apply global search filter
 * @param {Array} dataToFilter - Data to filter
 * @param {string} globalSearchText - Search text
 * @param {Array} columns - Array of column definitions
 * @param {Array} data - Original data (for type detection)
 * @returns {Array} Filtered data
 */
export function applyGlobalSearch(dataToFilter, globalSearchText, columns, data) {
	if (!globalSearchText || globalSearchText.trim() === '') return dataToFilter;

	const searchTerms = parseSearchTerms(globalSearchText);
	if (searchTerms.length === 0) return dataToFilter;

	return dataToFilter.filter((item) => {
		// Check if any search term matches any column (OR logic)
		return searchTerms.some((searchTerm) => {
			return columns.some((column) => {
				const columnType = getColumnType(column.id, columns, data);
				// Include both string and select types in global search
				if (columnType !== 'string' && columnType !== 'select') return false;

				const value = get(item, column.id);
				const stringValue = String(value || '').toLowerCase();
				return stringValue.includes(searchTerm);
			});
		});
	});
}

/**
 * Apply column-specific filters
 * @param {Array} dataToFilter - Data to filter
 * @param {Array} activeFilters - Active filters
 * @param {Array} columns - Array of column definitions
 * @param {Array} data - Original data (for type detection)
 * @returns {Array} Filtered data
 */
export function applyFilters(dataToFilter, activeFilters, columns, data) {
	if (!activeFilters || activeFilters.length === 0) return dataToFilter;

	return dataToFilter.filter((item) => {
		return activeFilters.every((filter) => {
			const value = get(item, filter.columnId);
			const columnType = getColumnType(filter.columnId, columns, data);

			// Multi-select filter
			if (filter.condition === 'in' && filter.values) {
				return filter.values.includes(value);
			}

			if (columnType === 'date') {
				const dateValue = value ? new Date(value).getTime() : null;
				const filterDate = filter.value ? new Date(filter.value).getTime() : null;
				const filterDate2 = filter.value2 ? new Date(filter.value2).getTime() : null;

				if (dateValue === null) return false;

				switch (filter.condition) {
					case 'equals':
						// Compare dates by day (ignore time)
						return (
							filterDate &&
							new Date(value).toDateString() === new Date(filter.value).toDateString()
						);
					case 'not_equals':
						return (
							!filterDate ||
							new Date(value).toDateString() !== new Date(filter.value).toDateString()
						);
					case 'after':
					case 'greater_than':
						return filterDate && dateValue > filterDate;
					case 'before':
					case 'less_than':
						return filterDate && dateValue < filterDate;
					case 'between':
						return (
							filterDate &&
							filterDate2 &&
							dateValue >= filterDate &&
							dateValue <= filterDate2
						);
					default:
						return true;
				}
			} else if (columnType === 'number') {
				const numValue = Number(value);
				const filterNum = Number(filter.value);
				const filterNum2 = filter.value2 ? Number(filter.value2) : null;

				switch (filter.condition) {
					case 'equals':
						return numValue === filterNum;
					case 'not_equals':
						return numValue !== filterNum;
					case 'greater_than':
						return numValue > filterNum;
					case 'less_than':
						return numValue < filterNum;
					case 'between':
						return (
							filterNum2 !== null && numValue >= filterNum && numValue <= filterNum2
						);
					default:
						return true;
				}
			} else if (columnType === 'boolean') {
				// Boolean filtering - use truthy/falsy comparison
				switch (filter.condition) {
					case 'equals':
						// If filtering for true, check if value is truthy; if filtering for false, check if value is falsy
						return filter.value ? !!value : !value;
					case 'not_equals':
						return filter.value ? !value : !!value;
					default:
						return true;
				}
			} else {
				// String filtering
				const filterVal = String(filter.value).toLowerCase();
				const itemVal = String(value || '').toLowerCase();

				switch (filter.condition) {
					case 'equals':
						return itemVal === filterVal;
					case 'contains':
						return itemVal.includes(filterVal);
					case 'starts_with':
						return itemVal.startsWith(filterVal);
					case 'ends_with':
						return itemVal.endsWith(filterVal);
					case 'not_equals':
						return itemVal !== filterVal;
					default:
						return true;
				}
			}
		});
	});
}
