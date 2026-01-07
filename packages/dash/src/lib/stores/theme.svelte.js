/**
 * Theme store using Svelte 5 runes.
 *
 * Manages theme preference (light, dark, system) and applies
 * the appropriate class to the document element.
 *
 * Uses localStorage for instant theme application (no flash),
 * with server-side persistence as backup.
 */

const STORAGE_KEY = 'firmly-theme-preference';

/** @type {'light' | 'dark' | 'system'} */
let preference = $state('system');

/** @type {boolean} */
let initialized = $state(false);

/** @type {MediaQueryList | null} */
let mediaQuery = null;

/**
 * Get the theme preference from localStorage.
 * @returns {'light' | 'dark' | 'system' | null}
 */
function getLocalPreference() {
	if (typeof localStorage === 'undefined') return null;
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === 'light' || stored === 'dark' || stored === 'system') {
		return stored;
	}
	return null;
}

/**
 * Save the theme preference to localStorage.
 * @param {'light' | 'dark' | 'system'} value
 */
function setLocalPreference(value) {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, value);
}

/**
 * The resolved theme based on preference.
 * If 'system', resolves to the OS preference.
 */
const resolved = $derived.by(() => {
	if (preference === 'system') {
		// Check system preference
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return 'light';
	}
	return preference;
});

/**
 * Apply the theme class to the document element.
 */
function applyTheme() {
	if (typeof document === 'undefined') return;

	const isDark = resolved === 'dark';
	document.documentElement.classList.toggle('dark', isDark);
}

/**
 * Handle system preference changes.
 * @param {MediaQueryListEvent} e
 */
function handleSystemChange() {
	if (preference === 'system') {
		applyTheme();
	}
}

/**
 * Initialize the theme store with a saved preference.
 * localStorage is the source of truth for the current browser (for instant loading).
 * Server preference is only used when localStorage is empty (new user/device).
 * @param {string} serverPreference - The server-saved theme preference ('light', 'dark', 'system')
 */
function initialize(serverPreference) {
	if (initialized) return;

	// Check localStorage first - it's the source of truth for this browser
	const localPref = getLocalPreference();

	if (localPref) {
		// Use localStorage preference (user already set it on this device)
		preference = localPref;
	} else if (serverPreference && serverPreference !== 'system') {
		// No local preference, but server has a non-default preference
		// This means user set it on another device - sync it locally
		preference = serverPreference;
		setLocalPreference(serverPreference);
	} else {
		// No local preference and server has default 'system' - use system
		preference = 'system';
	}

	initialized = true;

	// Apply theme immediately
	applyTheme();

	// Listen for system preference changes
	if (typeof window !== 'undefined') {
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', handleSystemChange);
	}
}

/**
 * Set the theme preference.
 * Saves to localStorage immediately for instant feedback,
 * then persists to server in background.
 * @param {'light' | 'dark' | 'system'} value - The new theme preference
 * @param {boolean} persist - Whether to persist to server (default: true)
 */
async function setTheme(value, persist = true) {
	const validValues = ['light', 'dark', 'system'];
	if (!validValues.includes(value)) {
		console.warn(`Invalid theme value: ${value}. Must be one of: ${validValues.join(', ')}`);
		return;
	}

	// Update state and apply immediately
	preference = value;
	applyTheme();

	// Save to localStorage immediately (synchronous, no flash on reload)
	setLocalPreference(value);

	// Persist to server in background
	if (persist) {
		try {
			await fetch('/api/preferences', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme: value })
			});
		} catch (e) {
			console.error('Failed to persist theme preference:', e);
		}
	}
}

/**
 * Clean up event listeners.
 * Call this when the component unmounts.
 */
function destroy() {
	if (mediaQuery) {
		mediaQuery.removeEventListener('change', handleSystemChange);
		mediaQuery = null;
	}
	initialized = false;
}

export const theme = {
	get preference() {
		return preference;
	},
	get resolved() {
		return resolved;
	},
	get initialized() {
		return initialized;
	},
	initialize,
	setTheme,
	destroy
};
