/**
 * Address Autocomplete Composable
 *
 * Manages address autocomplete state with debouncing and abort handling.
 */

const DEBOUNCE_MS = 300;

/**
 * Creates reactive address autocomplete state.
 * @returns {Object} Autocomplete state with completions, loading, and control methods
 */
export function createAddressAutocomplete() {
	let completions = $state([]);
	let selectedAddress = $state(null);
	let isLoading = $state(false);

	let timeout = null;
	let abortController = null;

	function createAbortSignal() {
		if (timeout) clearTimeout(timeout);
		if (abortController) abortController.abort();
		abortController = new AbortController();
		return abortController.signal;
	}

	function setLoading(value) {
		isLoading = value;
	}

	function setCompletions(value) {
		completions = value;
	}

	function setSelectedAddress(value) {
		selectedAddress = value;
	}

	function debounce(fn) {
		timeout = setTimeout(fn, DEBOUNCE_MS);
	}

	function reset() {
		if (timeout) clearTimeout(timeout);
		if (abortController) abortController.abort();
		completions = [];
		selectedAddress = null;
		isLoading = false;
	}

	return {
		get completions() {
			return completions;
		},
		get selectedAddress() {
			return selectedAddress;
		},
		set selectedAddress(value) {
			selectedAddress = value;
		},
		get isLoading() {
			return isLoading;
		},
		createAbortSignal,
		setLoading,
		setCompletions,
		setSelectedAddress,
		debounce,
		reset
	};
}
