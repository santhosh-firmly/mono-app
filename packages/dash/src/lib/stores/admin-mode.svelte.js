/**
 * Admin mode store for tab-isolated admin/user session switching.
 *
 * Uses sessionStorage (tab-specific) + URL parameter propagation to enable
 * different tabs to operate independently - one tab in admin mode, another
 * in regular user mode.
 *
 * Security: The URL param alone does nothing - the server validates that
 * the user has a valid Azure AD token before honoring admin mode.
 */

const STORAGE_KEY = 'firmly_admin_mode';

/**
 * Get the admin mode value from sessionStorage.
 * @returns {boolean}
 */
function getStoredValue() {
	if (typeof sessionStorage === 'undefined') return false;
	return sessionStorage.getItem(STORAGE_KEY) === 'true';
}

/**
 * Set or clear the admin mode value in sessionStorage.
 * @param {boolean} value - Whether admin mode is enabled
 */
function setStoredValue(value) {
	if (typeof sessionStorage === 'undefined') return;
	if (value) {
		sessionStorage.setItem(STORAGE_KEY, 'true');
	} else {
		sessionStorage.removeItem(STORAGE_KEY);
	}
}

/**
 * Initialize admin mode from URL param.
 * Call this on page load to detect if we arrived via ?admin_mode=true
 * and store the state in sessionStorage for this tab.
 */
function initializeFromUrl() {
	if (typeof window === 'undefined') return;
	const urlParams = new URLSearchParams(window.location.search);
	if (urlParams.get('admin_mode') === 'true') {
		setStoredValue(true);
	}
}

/**
 * Check if admin mode is active for this tab.
 * Checks both sessionStorage (for persisted state) and URL (for initial load).
 * @returns {boolean}
 */
function isAdminMode() {
	// First check sessionStorage (already initialized state)
	if (getStoredValue()) return true;

	// Fallback: check URL directly for initial page load before onMount runs
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('admin_mode') === 'true') {
			// Also store it so subsequent checks are faster
			setStoredValue(true);
			return true;
		}
	}

	return false;
}

/**
 * Toggle admin mode and navigate with updated URL.
 * @param {boolean} enableAdminMode - Whether to enable admin mode
 */
function setAdminMode(enableAdminMode) {
	setStoredValue(enableAdminMode);

	if (typeof window === 'undefined') return;

	const url = new URL(window.location.href);
	if (enableAdminMode) {
		url.searchParams.set('admin_mode', 'true');
	} else {
		url.searchParams.delete('admin_mode');
	}
	window.location.href = url.toString();
}

/**
 * Build a URL with admin_mode param if admin mode is active.
 * Use this for fetch() calls to ensure the server knows about admin mode.
 * @param {string} url - The URL to potentially modify
 * @returns {string} - The URL with admin_mode param if in admin mode
 */
function buildUrl(url) {
	if (!isAdminMode()) return url;

	try {
		// Handle both absolute and relative URLs
		const urlObj = new URL(
			url,
			typeof window !== 'undefined' ? window.location.origin : undefined
		);
		if (!urlObj.searchParams.has('admin_mode')) {
			urlObj.searchParams.set('admin_mode', 'true');
		}
		// Return pathname + search for relative URLs
		return urlObj.pathname + urlObj.search;
	} catch {
		// If URL parsing fails, append manually
		const separator = url.includes('?') ? '&' : '?';
		return `${url}${separator}admin_mode=true`;
	}
}

export const adminMode = {
	initializeFromUrl,
	isAdminMode,
	setAdminMode,
	buildUrl,
	/**
	 * Convenience method to toggle from current state.
	 * @param {boolean} currentlyAdmin - Current admin mode state
	 */
	toggle: (currentlyAdmin) => setAdminMode(!currentlyAdmin)
};
