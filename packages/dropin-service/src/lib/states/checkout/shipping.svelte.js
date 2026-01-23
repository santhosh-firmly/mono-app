import { cartUpdateShippingInfo, cartUpdateDelivery } from '$lib/services/cart.js';
import {
	searchAddress as searchAddressService,
	getAddress
} from '$lib/services/address-autocomplete.js';
import { createAddressAutocomplete } from '$lib/composables/address-autocomplete.svelte.js';

/**
 * @typedef {Object} ShippingAddress
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} phone
 * @property {string} address1
 * @property {string} address2
 * @property {string} city
 * @property {string} state_or_province
 * @property {string} country
 * @property {string} postal_code
 */

/**
 * @typedef {Object} AddressAutocomplete
 * @property {boolean} loading
 * @property {Array} completions
 * @property {Object|null} selectedAddress
 * @property {function(): AbortSignal} createAbortSignal
 * @property {function(function): void} debounce
 * @property {function(boolean): void} setLoading
 * @property {function(Array): void} setCompletions
 * @property {function(Object|null): void} setSelectedAddress
 */

/**
 * @typedef {Object} ShippingErrors
 * @property {string} shipping
 * @property {string} shippingMethod
 */

/**
 * @typedef {Object} ShippingMixin
 * @property {ShippingErrors} errors - Shipping-related error messages
 * @property {AddressAutocomplete} shippingAutocomplete - Shipping address autocomplete state
 * @property {AddressAutocomplete} billingAutocomplete - Billing address autocomplete state
 * @property {function(string, string): void} setError - Set error message for a field
 * @property {function(): void} syncEmailToCart - Sync email from form to cart
 * @property {function(): Promise<void>} submitShippingIfReady - Auto-submit shipping when ready
 * @property {function(ShippingAddress): Promise<boolean>} updateShippingAddress - Update shipping address
 * @property {function(string): Promise<boolean>} selectShippingMethod - Select shipping method
 * @property {function(string, string): void} searchAddress - Search for addresses
 * @property {function(string|Object, string): Promise<void>} selectAddress - Select address from results
 */

/**
 * Creates shipping operations mixin with address management and autocomplete
 * @returns {ShippingMixin}
 */
export function createShippingMixin() {
	let errors = $state({ shipping: '', shippingMethod: '' });
	let hasSubmittedShipping = false;

	const shippingAutocomplete = createAddressAutocomplete();
	const billingAutocomplete = createAddressAutocomplete();

	function getAutocomplete(type) {
		return type === 'billing' ? billingAutocomplete : shippingAutocomplete;
	}

	return {
		get errors() {
			return errors;
		},
		get shippingAutocomplete() {
			return shippingAutocomplete;
		},
		get billingAutocomplete() {
			return billingAutocomplete;
		},

		setError(field, message) {
			errors = { ...errors, [field]: message };
		},

		syncEmailToCart() {
			const emailValue = this.shippingForm?.email?.value;
			const isFilled = this.shippingForm?.email?.filled;
			const hasError = this.shippingForm?.email?.error;

			if (isFilled && !hasError && emailValue && this.cart?.email !== emailValue) {
				this.setCart({ ...this.cart, email: emailValue });
			}
		},

		async submitShippingIfReady() {
			const shippingAddressFilled = this.shippingForm?.isShippingAddressFilled;
			const emailValue = this.cart?.email;
			const hasShippingMethods = this.cart?.shipping_method_options?.length > 0;
			const isPending = this.pending?.SET_SHIPPING_ADDRESS;

			if (
				shippingAddressFilled &&
				emailValue &&
				!hasShippingMethods &&
				!isPending &&
				!hasSubmittedShipping
			) {
				hasSubmittedShipping = true;
				const address = this.shippingForm.getShippingAddress();
				if (address) {
					const email = this.cart?.email || this.cart?.shipping_info?.email || '';
					await this.updateShippingAddress({ ...address, email });
				}
			}

			if (!shippingAddressFilled || !emailValue) {
				hasSubmittedShipping = false;
			}
		},

		async updateShippingAddress(address) {
			if (!address) return false;
			errors = { ...errors, shipping: '' };

			this.setPending('SET_SHIPPING_ADDRESS', true);
			try {
				const result = await cartUpdateShippingInfo(address, this.domain);
				if (result?.status === 200) {
					this.setCart(result.data);
					return true;
				}
				errors = {
					...errors,
					shipping: result?.data?.description || 'Failed to update shipping address'
				};
				return false;
			} finally {
				this.setPending('SET_SHIPPING_ADDRESS', false);
			}
		},

		async selectShippingMethod(sku) {
			if (!sku) return false;
			errors = { ...errors, shippingMethod: '' };

			this.setPending('UPDATE_SHIPPING_METHOD', true);
			try {
				const result = await cartUpdateDelivery(sku, this.domain);
				if (result?.status === 200) {
					this.setCart(result.data);
					return true;
				}
				errors = {
					...errors,
					shippingMethod: result?.data?.description || 'Failed to update shipping method'
				};
				return false;
			} finally {
				this.setPending('UPDATE_SHIPPING_METHOD', false);
			}
		},

		searchAddress(query, type = 'shipping') {
			const autocomplete = getAutocomplete(type);
			const signal = autocomplete.createAbortSignal();

			autocomplete.debounce(async () => {
				autocomplete.setLoading(true);
				try {
					const result = await searchAddressService(query, this.domain, { signal });
					autocomplete.setCompletions(
						result?.status === 200 ? result.data.predictions : []
					);
				} catch (error) {
					if (error.name !== 'AbortError') {
						console.error('Error searching address:', error);
					}
					autocomplete.setCompletions([]);
				} finally {
					autocomplete.setLoading(false);
				}
			});
		},

		async selectAddress(option, type = 'shipping') {
			const autocomplete = getAutocomplete(type);
			autocomplete.setLoading(true);
			try {
				const addressId = typeof option === 'string' ? option : option?.id;
				const result = await getAddress(addressId, this.domain, {});
				autocomplete.setSelectedAddress(result?.status === 200 ? result.data : null);
			} catch (error) {
				console.error('Error getting address:', error);
				autocomplete.setSelectedAddress(null);
			} finally {
				autocomplete.setLoading(false);
			}
		}
	};
}
