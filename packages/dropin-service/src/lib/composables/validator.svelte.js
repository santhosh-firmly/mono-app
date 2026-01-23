/**
 * Creates a reactive form field with validation.
 * @param {string} [init=''] - Initial value
 * @param {Function} validationFn - Validation function that throws on error
 * @returns {{value: string, error: string, filled: boolean, validate: Function, reset: Function}} Reactive field state
 */
export function useValidator(init = '', validationFn) {
	let value = $state(init);
	let error = $state('');

	let filled = $derived(value && !error);

	function validate(newValue = value) {
		try {
			validationFn(newValue);
			error = '';
		} catch (e) {
			error = e.message;
		}

		value = newValue;
	}

	return {
		get filled() {
			return filled;
		},
		get value() {
			return value;
		},
		set value(newValue) {
			value = newValue;
		},
		get error() {
			return error;
		},
		reset() {
			value = '';
			error = '';
		},
		validate
	};
}
