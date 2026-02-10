/**
 * Table State Storage Utility
 * Manages saving and loading table state (sorting, filtering, columns) to/from LocalStorage
 */

const STORAGE_KEY = 'table_state';

/**
 * Get all table states from LocalStorage
 * @returns {Object} Object containing all table states
 */
function getAllTableStates() {
	if (typeof window === 'undefined') return {};

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.warn('Failed to load table states from LocalStorage:', error);
		return {};
	}
}

/**
 * Save all table states to LocalStorage
 * @param {Object} states - Object containing all table states
 */
function saveAllTableStates(states) {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
	} catch (error) {
		console.warn('Failed to save table states to LocalStorage:', error);
	}
}

/**
 * Load table state from LocalStorage
 * @param {string} tableId - Unique identifier for the table
 * @returns {Object|null} Saved table state or null if not found
 */
export function loadTableState(tableId) {
	if (!tableId) {
		console.warn('loadTableState: tableId is required');
		return null;
	}

	const allStates = getAllTableStates();
	return allStates[tableId] || null;
}

/**
 * Save table state to LocalStorage
 * @param {string} tableId - Unique identifier for the table
 * @param {Object} state - Table state to save
 * @param {string} state.sortColumn - Currently sorted column
 * @param {string} state.sortDirection - Sort direction ('asc' or 'desc')
 * @param {Array} state.activeFilters - Active filter configurations
 * @param {string} state.globalSearchText - Global search text
 * @param {Array} state.visibleColumns - Array of visible column IDs
 */
export function saveTableState(tableId, state) {
	if (!tableId) {
		console.warn('saveTableState: tableId is required');
		return;
	}

	const allStates = getAllTableStates();
	allStates[tableId] = {
		sortColumn: state.sortColumn,
		sortDirection: state.sortDirection,
		activeFilters: state.activeFilters,
		globalSearchText: state.globalSearchText,
		visibleColumns: state.visibleColumns,
		timestamp: Date.now()
	};

	saveAllTableStates(allStates);
}

/**
 * Clear saved state for a specific table
 * @param {string} tableId - Unique identifier for the table
 */
export function clearTableState(tableId) {
	if (!tableId) {
		console.warn('clearTableState: tableId is required');
		return;
	}

	const allStates = getAllTableStates();
	delete allStates[tableId];
	saveAllTableStates(allStates);
}

/**
 * Clear all saved table states
 */
export function clearAllTableStates() {
	if (typeof window === 'undefined') return;

	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn('Failed to clear table states from LocalStorage:', error);
	}
}

/**
 * Get list of all saved table IDs
 * @returns {Array<string>} Array of table IDs
 */
export function getSavedTableIds() {
	const allStates = getAllTableStates();
	return Object.keys(allStates);
}
