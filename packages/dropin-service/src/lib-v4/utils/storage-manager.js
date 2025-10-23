/**
 * Generic Storage Manager
 * Simple localStorage persistence manager
 */

/**
 * Saves data to localStorage
 * @param {string} key - The localStorage key
 * @param {*} data - Data to persist
 * @returns {boolean} - Success status
 */
export function saveToStorage(key, data) {
	if (typeof window === 'undefined' || !window.localStorage) {
		return false;
	}

	try {
		localStorage.setItem(key, JSON.stringify(data));
		return true;
	} catch (error) {
		console.warn(`Failed to save data for key "${key}":`, error);
		return false;
	}
}

/**
 * Loads data from localStorage
 * @param {string} key - The localStorage key
 * @returns {*} - Stored data or null if not found
 */
export function loadFromStorage(key) {
	if (typeof window === 'undefined' || !window.localStorage) {
		return null;
	}

	try {
		const stored = localStorage.getItem(key);
		if (!stored) {
			return null;
		}
		return JSON.parse(stored);
	} catch (error) {
		console.warn(`Failed to load data for key "${key}":`, error);
		return null;
	}
}

/**
 * Removes data from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} - Success status
 */
export function removeFromStorage(key) {
	if (typeof window === 'undefined' || !window.localStorage) {
		return false;
	}

	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.warn(`Failed to remove data for key "${key}":`, error);
		return false;
	}
}
