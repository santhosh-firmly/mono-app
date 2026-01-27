import { describe, it, expect, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

vi.mock('$lib/paraglide/messages', () => ({
	validation_required: () => 'This field is required',
	validation_first_and_last_name: () => 'Please enter first and last name',
	validation_email_required: () => 'Email is required',
	validation_email_invalid: () => 'Please enter a valid email',
	validation_phone_required: () => 'Phone is required',
	validation_phone_invalid: () => 'Please enter a valid phone number',
	validation_zip_required: () => 'ZIP code is required',
	validation_zip_invalid: () => 'Please enter a valid ZIP code',
	validation_address_required: () => 'Address is required',
	validation_address_min_length: () => 'Address must be at least 3 characters'
}));

describe('useCheckoutForm', () => {
	describe('initialization', () => {
		it('creates form with empty validators when no data provided', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				expect(form.email.value).toBe('');
				expect(form.name.value).toBe('');
				expect(form.address.value).toBe('');
				expect(form.city.value).toBe('');
				expect(form.zipCode.value).toBe('');
				expect(form.phoneNumber.value).toBe('');
			});
			cleanup();
		});

		it('initializes with provided form data', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'test@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});

				expect(form.email.value).toBe('test@example.com');
				expect(form.name.value).toBe('John Doe');
				expect(form.address.value).toBe('123 Main St');
				expect(form.city.value).toBe('New York');
				expect(form.stateOrProvince.value).toBe('NY');
				expect(form.zipCode.value).toBe('10001');
				expect(form.phoneNumber.value).toBe('5551234567');
			});
			cleanup();
		});

		it('sets startedFullFilled when form data is provided', () => {
			const cleanup = $effect.root(() => {
				const emptyForm = useCheckoutForm();
				expect(emptyForm.startedFullFilled).toBe(false);

				const filledForm = useCheckoutForm({ email: 'test@test.com' });
				expect(filledForm.startedFullFilled).toBe(true);
			});
			cleanup();
		});
	});

	describe('isFullFilled', () => {
		it('returns false when form is incomplete', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();
				expect(form.isFullFilled).toBe(false);
			});
			cleanup();
		});

		it('returns true when all required fields are filled and valid', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'test@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});

				form.validate();
				flushSync();

				expect(form.isFullFilled).toBe(true);
			});
			cleanup();
		});
	});

	describe('isShippingAddressFilled', () => {
		it('returns true when shipping address fields are filled', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});

				form.validate();
				flushSync();

				expect(form.isShippingAddressFilled).toBe(true);
			});
			cleanup();
		});
	});

	describe('validate', () => {
		it('validates all fields', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.validate();
				flushSync();

				expect(form.email.error).toBeTruthy();
				expect(form.name.error).toBeTruthy();
				expect(form.address.error).toBeTruthy();
				expect(form.city.error).toBeTruthy();
				expect(form.zipCode.error).toBeTruthy();
				expect(form.phoneNumber.error).toBeTruthy();
			});
			cleanup();
		});
	});

	describe('errors', () => {
		it('returns first error from all validators', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.validate();
				flushSync();

				expect(form.errors).toBeTruthy();
			});
			cleanup();
		});

		it('returns undefined when no errors', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'test@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});

				form.validate();
				flushSync();

				expect(form.errors).toBeFalsy();
			});
			cleanup();
		});
	});

	describe('resetAddress', () => {
		it('clears address-related fields', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					address1: '123 Main St',
					address2: 'Apt 4',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001'
				});

				form.resetAddress();
				flushSync();

				expect(form.address.value).toBe('');
				expect(form.address2.value).toBe('');
				expect(form.city.value).toBe('');
				expect(form.stateOrProvince.value).toBe('');
				expect(form.zipCode.value).toBe('');
			});
			cleanup();
		});
	});

	describe('setValues', () => {
		it('sets all form values from provided data', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.setValues({
					email: 'new@example.com',
					first_name: 'Jane',
					last_name: 'Smith',
					address1: '456 Oak Ave',
					address2: 'Suite 10',
					city: 'Boston',
					state_or_province: 'MA',
					postal_code: '02101',
					phone: '5559876543'
				});

				flushSync();

				expect(form.email.value).toBe('new@example.com');
				expect(form.name.value).toBe('Jane Smith');
				expect(form.address.value).toBe('456 Oak Ave');
				expect(form.address2.value).toBe('Suite 10');
				expect(form.city.value).toBe('Boston');
				expect(form.stateOrProvince.value).toBe('MA');
				expect(form.zipCode.value).toBe('02101');
				expect(form.phoneNumber.value).toBe('5559876543');
			});
			cleanup();
		});

		it('sets startedFullFilled to true', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				expect(form.startedFullFilled).toBe(false);

				form.setValues({
					email: 'test@example.com'
				});

				flushSync();

				expect(form.startedFullFilled).toBe(true);
			});
			cleanup();
		});

		it('handles partial data updates', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'old@example.com',
					first_name: 'John',
					last_name: 'Doe'
				});

				form.setValues({
					email: 'new@example.com',
					city: 'Seattle'
				});

				flushSync();

				expect(form.email.value).toBe('new@example.com');
				expect(form.name.value).toBe('John Doe');
				expect(form.city.value).toBe('Seattle');
			});
			cleanup();
		});

		it('concatenates first and last name with space', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.setValues({
					first_name: 'Alice',
					last_name: 'Johnson'
				});

				flushSync();

				expect(form.name.value).toBe('Alice Johnson');
			});
			cleanup();
		});

		it('handles only first name provided', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.setValues({
					first_name: 'Bob'
				});

				flushSync();

				expect(form.name.value).toBe('Bob');
			});
			cleanup();
		});

		it('handles only last name provided', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm();

				form.setValues({
					last_name: 'Smith'
				});

				flushSync();

				expect(form.name.value).toBe('Smith');
			});
			cleanup();
		});

		it('handles null address2', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({ address2: 'old value' });

				form.setValues({
					address2: null
				});

				flushSync();

				expect(form.address2.value).toBe('');
			});
			cleanup();
		});

		it('does not update address2 when undefined', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({ address2: 'old value' });

				form.setValues({
					address2: undefined
				});

				flushSync();

				expect(form.address2.value).toBe('old value');
			});
			cleanup();
		});

		it('sets empty string for address2', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({ address2: 'old value' });

				form.setValues({
					address2: ''
				});

				flushSync();

				expect(form.address2.value).toBe('');
			});
			cleanup();
		});

		it('does not update fields not provided in data', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'keep@example.com',
					city: 'Seattle'
				});

				form.setValues({
					first_name: 'Jane'
				});

				flushSync();

				expect(form.email.value).toBe('keep@example.com');
				expect(form.city.value).toBe('Seattle');
				expect(form.name.value).toBe('Jane');
			});
			cleanup();
		});
	});

	describe('getShippingAddress', () => {
		it('returns formatted shipping address object', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					email: 'test@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					address2: 'Apt 4',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});

				const address = form.getShippingAddress();

				expect(address).toEqual({
					email: 'test@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					address2: 'Apt 4',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '+15551234567',
					country: 'US'
				});
			});
			cleanup();
		});

		it('handles phone number with +1 prefix', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					phone: '+15551234567'
				});

				const address = form.getShippingAddress();

				expect(address.phone).toBe('+15551234567');
			});
			cleanup();
		});

		it('handles phone number with leading 1', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					phone: '15551234567'
				});

				const address = form.getShippingAddress();

				expect(address.phone).toBe('+15551234567');
			});
			cleanup();
		});

		it('splits name into first and last name', () => {
			const cleanup = $effect.root(() => {
				const form = useCheckoutForm({
					first_name: 'John',
					last_name: 'Robert Doe'
				});

				const address = form.getShippingAddress();

				expect(address.first_name).toBe('John');
				expect(address.last_name).toBe('Robert Doe');
			});
			cleanup();
		});
	});
});
