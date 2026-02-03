/**
 * Checkout Form Composable
 *
 * Manages checkout form state with validation and address handling.
 */

import { useValidator } from './validator.svelte.js';
import {
	isValidName,
	isAddress,
	isRequired,
	isValidZipCode,
	isValidPhone,
	isValidEmail
} from '$lib/utils/validations';

/**
 * Creates a reactive checkout form with validation.
 * @param {Object} [form={}] - Initial form values
 * @returns {Object} Form state with fields, validation, and helpers
 */
export function useCheckoutForm(form = {}) {
	let email = useValidator(form.email, isValidEmail);
	let name = useValidator(
		form.first_name && form.last_name ? form.first_name + ' ' + form.last_name : '',
		isValidName
	);
	let address = useValidator(form.address1, isAddress);
	let address2 = useValidator(form.address2, (value) => isAddress(value, { isOptional: true }));
	let city = useValidator(form.city, isRequired);
	let stateOrProvince = useValidator(form.state_or_province, isRequired);
	let zipCode = useValidator(form.postal_code, isValidZipCode);
	let phoneNumber = useValidator(form.phone, isValidPhone);

	let isFullFilled = $derived(
		[
			email.filled,
			name.filled,
			address.filled,
			city.filled,
			stateOrProvince.filled,
			zipCode.filled,
			phoneNumber.filled
		].every(Boolean)
	);

	let isShippingAddressFilled = $derived(
		[
			name.filled,
			address.filled,
			city.filled,
			stateOrProvince.filled,
			zipCode.filled,
			phoneNumber.filled
		].every(Boolean)
	);

	let errors = $derived(
		[
			email.error,
			name.error,
			address.error,
			address2.error,
			city.error,
			stateOrProvince.error,
			zipCode.error,
			phoneNumber.error
		].filter(Boolean)[0]
	);

	function resetAddress() {
		address.reset();
		address2.reset();
		city.reset();
		stateOrProvince.reset();
		zipCode.reset();
	}

	function validate() {
		email.validate();
		name.validate();
		address.validate();
		address2.validate();
		city.validate();
		stateOrProvince.validate();
		zipCode.validate();
		phoneNumber.validate();
	}

	function getShippingAddress() {
		const [firstName, ...lastNameParts] = (name.value || '').split(' ');
		const lastName = lastNameParts.join(' ');

		return {
			email: email.value,
			first_name: firstName || '',
			last_name: lastName || '',
			address1: address.value,
			address2: address2.value || '',
			city: city.value,
			state_or_province: stateOrProvince.value,
			postal_code: zipCode.value,
			phone: phoneNumber.value.startsWith('+1')
				? phoneNumber.value
				: '+1' + phoneNumber.value.replace(/^1/, ''),
			country: 'US' // Default to US for now
		};
	}

	/**
	 * Sets form values from external data.
	 * @param {Object} data - The data to populate the form with
	 * @param {string} [data.email] - Email address
	 * @param {string} [data.first_name] - First name
	 * @param {string} [data.last_name] - Last name
	 * @param {string} [data.address1] - Street address
	 * @param {string} [data.address2] - Apartment, suite, etc.
	 * @param {string} [data.city] - City
	 * @param {string} [data.state_or_province] - State or province
	 * @param {string} [data.postal_code] - Postal/ZIP code
	 * @param {string} [data.phone] - Phone number
	 */
	function setValues(data) {
		if (data.email) email.value = data.email;
		if (data.first_name || data.last_name) {
			name.value = [data.first_name, data.last_name].filter(Boolean).join(' ');
		}
		if (data.address1) address.value = data.address1;
		if (data.address2 !== undefined) address2.value = data.address2 || '';
		if (data.city) city.value = data.city;
		if (data.state_or_province) stateOrProvince.value = data.state_or_province;
		if (data.postal_code) zipCode.value = data.postal_code;
		if (data.phone) phoneNumber.value = data.phone;
	}

	return {
		get email() {
			return email;
		},
		get name() {
			return name;
		},
		get address() {
			return address;
		},
		get address2() {
			return address2;
		},
		get city() {
			return city;
		},
		get stateOrProvince() {
			return stateOrProvince;
		},
		get zipCode() {
			return zipCode;
		},
		get phoneNumber() {
			return phoneNumber;
		},
		get isFullFilled() {
			return isFullFilled;
		},
		get isShippingAddressFilled() {
			return isShippingAddressFilled;
		},
		get errors() {
			return errors;
		},
		resetAddress,
		validate,
		getShippingAddress,
		setValues
	};
}
