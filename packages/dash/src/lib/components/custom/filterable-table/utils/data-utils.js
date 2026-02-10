/**
 * Get nested property value from an object using dot notation
 * @param {object} item - The object to get value from
 * @param {string} columnId - The property path (e.g., 'user.name')
 * @returns {any} The value at the path
 */
export function get(item, columnId) {
	const path = columnId.split('.');
	let value = item;
	for (const p of path) {
		value = value?.[p];
	}
	return value;
}

/**
 * Detect the data type of a value
 * @param {any} value - The value to check
 * @returns {'boolean'|'number'|'date'|'string'|'unknown'} The detected type
 */
export function detectType(value) {
	if (value === null || value === undefined) return 'unknown';
	if (typeof value === 'boolean') return 'boolean';
	if (typeof value === 'number') return 'number';
	if (typeof value === 'string') {
		// Check if it's a date string
		const dateRegex = /^\d{4}-\d{2}-\d{2}/;
		if (dateRegex.test(value)) {
			const date = new Date(value);
			if (!isNaN(date.getTime())) return 'date';
		}
		return 'string';
	}
	if (value instanceof Date) return 'date';
	return 'unknown';
}

/**
 * Get the column type from column definition or by detecting from data
 * @param {string} columnId - The column identifier
 * @param {Array} columns - Array of column definitions
 * @param {Array} data - The table data
 * @returns {string} The column type
 */
export function getColumnType(columnId, columns, data) {
	const column = columns.find((c) => c.id === columnId);
	if (column?.filterType) return column.filterType;

	if (!data || data.length === 0) return 'unknown';

	// Find first non-null value to determine type
	for (const row of data) {
		const value = get(row, columnId);
		if (value !== null && value !== undefined && value !== '') {
			return detectType(value);
		}
	}
	return 'unknown';
}

/**
 * Get list of columns that can be filtered
 * @param {Array} columns - Array of column definitions
 * @param {Array} data - The table data
 * @returns {Array} Filterable columns
 */
export function getFilterableColumns(columns, data) {
	if (!data || data.length === 0) return [];
	return columns.filter((col) => {
		// Explicit filterType always makes it filterable
		if (col.filterType) return true;

		// Find first non-null value to determine type
		for (const row of data) {
			const value = get(row, col.id);
			if (value !== null && value !== undefined && value !== '') {
				const type = detectType(value);
				return type === 'string' || type === 'number' || type === 'boolean';
			}
		}
		return false;
	});
}

/**
 * Get filter options for a column
 * @param {string} columnId - The column identifier
 * @param {Array} columns - Array of column definitions
 * @param {Array} data - The table data
 * @param {Object} externalFilterOptions - External options for select filters: { columnId: [{value, label}] }
 * @returns {Array} Array of {value, label} objects sorted alphabetically
 */
export function getColumnFilterOptions(columnId, columns, data, externalFilterOptions = {}) {
	// Check external options first (for server-side mode)
	if (externalFilterOptions[columnId]) {
		const options = externalFilterOptions[columnId].map((opt) =>
			typeof opt === 'string' ? { value: opt, label: opt } : opt
		);
		// Sort alphabetically by label
		return options.sort((a, b) => String(a.label).localeCompare(String(b.label)));
	}

	const column = columns.find((c) => c.id === columnId);

	// Explicit options provided in column definition
	if (column?.filterOptions) {
		const options = column.filterOptions.map((opt) =>
			typeof opt === 'string' ? { value: opt, label: opt } : opt
		);
		// Sort alphabetically by label
		return options.sort((a, b) => String(a.label).localeCompare(String(b.label)));
	}

	// Auto-detect unique values from data for select type
	if (column?.filterType === 'select' && data) {
		const uniqueValues = [
			...new Set(
				data
					.map((item) => get(item, columnId))
					.filter((val) => val !== null && val !== undefined && val !== '')
			)
		];
		// Sort alphabetically
		return uniqueValues
			.sort((a, b) => String(a).localeCompare(String(b)))
			.map((val) => ({ value: val, label: String(val) }));
	}

	// Boolean type: provide true/false options (no need to sort these)
	const columnType = getColumnType(columnId, columns, data);
	if (columnType === 'boolean') {
		return [
			{ value: true, label: 'True' },
			{ value: false, label: 'False' }
		];
	}

	return [];
}

/**
 * Get display value for a filter
 * @param {object} filter - The filter object
 * @returns {string} Display value
 */
export function getFilterDisplayValue(filter) {
	if (filter.condition === 'in' && filter.values) {
		return filter.values.length === 1 ? filter.values[0] : `${filter.values.length} selected`;
	}
	if (filter.condition === 'between' && filter.value2) {
		return `${filter.value} - ${filter.value2}`;
	}
	return filter.value;
}
