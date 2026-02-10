import { get, detectType } from './data-utils.js';

/**
 * Check if a column is sortable
 * @param {string} columnId - The column identifier
 * @param {Array} data - The table data
 * @returns {boolean} Whether the column is sortable
 */
export function isSortable(columnId, data) {
	if (!data || data.length === 0) return false;

	// Find first non-null value to determine type
	for (const row of data) {
		const value = get(row, columnId);
		if (value !== null && value !== undefined && value !== '') {
			const type = detectType(value);
			return type === 'string' || type === 'number' || type === 'date' || type === 'boolean';
		}
	}
	return false;
}

/**
 * Compare two values for sorting
 * @param {any} a - First item
 * @param {any} b - Second item
 * @param {string} columnId - The column to compare
 * @param {'asc'|'desc'} direction - Sort direction
 * @returns {number} Comparison result
 */
export function compareValues(a, b, columnId, direction) {
	const aVal = get(a, columnId);
	const bVal = get(b, columnId);

	// Handle null/undefined
	if (aVal === null || aVal === undefined) return direction === 'asc' ? 1 : -1;
	if (bVal === null || bVal === undefined) return direction === 'asc' ? -1 : 1;

	const type = detectType(aVal);

	let comparison = 0;
	if (type === 'number') {
		comparison = aVal - bVal;
	} else if (type === 'date') {
		const dateA = new Date(aVal);
		const dateB = new Date(bVal);
		comparison = dateA.getTime() - dateB.getTime();
	} else if (type === 'boolean') {
		// Convert to number: false=0, true=1 (false comes before true in ascending order)
		comparison = Number(aVal) - Number(bVal);
	} else if (type === 'string') {
		comparison = aVal.localeCompare(bVal);
	}

	return direction === 'asc' ? comparison : -comparison;
}
