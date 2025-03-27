import { useValidator } from '$lib/utils/validator.svelte';
import {
	isValidName,
	isAddress,
	isRequired,
	isValidZipCode,
	isValidPhone,
	isValidEmail
} from '$lib/utils/validations';

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

	let startedFullFilled = $state(Object.keys(form).length > 0);

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
		get errors() {
			return errors;
		},
		get startedFullFilled() {
			return startedFullFilled;
		},
		resetAddress,
		validate
	};
}
