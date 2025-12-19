<script>
	// @ts-nocheck
	import Countries from '$lib-v4/components/common/countries.json';
	import { createEventDispatcher } from 'svelte';
	import Group from './group.svelte';
	import {
		ShippingAddressSchema,
		BillingInfoSchema,
		ShippingAddressWithoutPhoneSchema
	} from '$lib-v4/browser/schema.js';
	import AddressAutocomplete from './address-autocomplete.svelte';
	import { restoreCursorPosition } from '$lib-v4/utils/cursor-position.js';
	import { onFieldFocus, onFieldBlur, onFieldCompleted } from '$lib-v4/browser/field-interaction-tracker.js';
	let currentCountry = Countries[0];

	/**
	 * Helper to get prefixed field name based on address type
	 * @param {string} field - The base field name
	 * @returns {string} The prefixed field name (e.g., 'shipping_full_name' or 'billing_full_name')
	 */
	function getFieldName(field) {
		return `${addressType}_${field}`;
	}

	/**
	 * Track field focus for abandonment analysis
	 * @param {string} field - The base field name
	 */
	function handleFieldFocus(field) {
		onFieldFocus(getFieldName(field));
	}

	/**
	 * Track field blur for abandonment analysis
	 * @param {string} field - The base field name
	 * @param {string} value - The current field value
	 * @param {boolean} hasError - Whether the field has a validation error
	 */
	function handleFieldBlur(field, value, hasError) {
		onFieldBlur(getFieldName(field), value, hasError);
	}

	/**
	 * First Name
	 */
	export let first_name;

	let first_name_error = false;

	/**
	 * Last Name
	 */
	export let last_name;

	let last_name_error = false;

	/**
	 * Address 1
	 */
	export let address1;

	let address1_error = false;

	/**
	 * Address 2
	 */
	export let address2;

	let address2_error = false;

	/**
	 * City
	 */
	export let city;

	let city_error = false;

	/**
	 * State or Province
	 */
	export let state_or_province;

	let state_error = false;

	/**
	 * Postal Code
	 */
	export let postal_code;

	let postal_code_error = false;

	/**
	 * Phone
	 */
	export let phone;

	/**
	 * Disabled
	 */
	export let disabled = false;

	/**
	 * Controls whether the view is collapsed or expanded for manual entry/visualization
	 */
	export let expanded = false;

	/**
	 * Name place holder
	 */
	export let namePlaceHolder = '';

	/**
	 * If this is a shipping address or billing address
	 * The values can be: 'shipping' or 'billing'
	 */
	export let addressType = 'shipping';

	export let country = 'United States';

	/**
	 * This variable tells the parent if the form is already complete, if
	 * false it means some fields are still missing
	 */
	export let isFormComplete = false;

	/**
	 * This variable controls whether or not we should try changing the focus, if
	 * false it means the user needed to type manually the address
	 */
	export let shouldChangeTheFocus = true;

	// Optional fields
	export let optionalFields = {};

	// Automatically expand when certain fields are filled
	$: {
		if (address2 || city || state_or_province || postal_code) {
			expanded = true;
			showAutocomplete = false;
		}
	}

	// Indicates if the phone should be present in the forms
	let hasPhone = true;
	$: {
		if (addressType === 'shipping' && optionalFields.shipping_phone) {
			hasPhone = false;
		}
	}

	// Expand the form when autofill is pre filling
	function expandForAutoFill(e) {
		if (e.animationName.includes('autofill-in')) {
			expanded = true;
		}
	}

	// Sets if the form is complete
	$: {
		if (
			first_name &&
			last_name &&
			address1 &&
			city &&
			state_or_province &&
			postal_code &&
			(phone || !hasPhone)
		) {
			const addressInfo = {
				first_name,
				last_name,
				address1,
				address2,
				city,
				state_or_province,
				postal_code
			};

			let schema = ShippingAddressSchema;

			if (hasPhone) {
				addressInfo.phone = phone;
			} else {
				schema = ShippingAddressWithoutPhoneSchema;
			}

			try {
				schema.validateSync(addressInfo);
				isFormComplete = true;
			} catch (e) {
				isFormComplete = false;
			}
		}
	}

	let phoneInputElement;

	let allowBrowserAutoFill = true;
	let showAutocomplete = false;
	let autoCompleteNext;
	let autoCompletePrevious;
	let selectCurrentAddress;
	let autoCompleteContainer;
	let address1El;

	async function onAddress1Input(ev) {
		if (typeof ev.data === 'undefined') {
			// When using the browser autofill, an "input" event is generated, however,
			// in such case, we don't want to evaluate and perform an address autocomplete search
			return;
		}

		if (address1?.length > 3) {
			allowBrowserAutoFill = false;
			showAutocomplete = true;
		} else {
			allowBrowserAutoFill = true;
			showAutocomplete = false;
		}
	}

	async function onAddressSelected(event) {
		if (event.detail.manual) {
			expanded = true;
			showAutocomplete = false;
		} else {
			shouldChangeTheFocus = false;
			const addr = event.detail;

			address1 = addr.address1;
			city = addr.city;
			state_or_province = addr.state_or_province;
			postal_code = addr.postal_code;

			expanded = true;
			showAutocomplete = false;

			if (hasPhone) {
				phoneInputElement.focus();
			}
		}
	}

	function onAddressKeyDown(event) {
		if (showAutocomplete) {
			if (event.key === 'ArrowDown') {
				autoCompleteNext();
				event.preventDefault();
			} else if (event.key === 'ArrowUp') {
				autoCompletePrevious();
				event.preventDefault();
			} else if (event.key === 'Enter') {
				selectCurrentAddress();
				event.preventDefault();
			} else if (event.key === 'Escape') {
				showAutocomplete = false;
				event.preventDefault();
			}
		}
	}

	export let address_info_error;

	let phone_error = false;

	export let fullName;

	const dispatch = createEventDispatcher();

	function onFullNameInput() {
		if (fullName !== '' && !fullName) {
			fullName = '';
			if (first_name) {
				fullName = first_name;
			}
			if (last_name) {
				fullName += ' ' + last_name;
			}
		}

		[first_name, last_name] = fullName.split(/\s(.*)/s);
	}

	// Format phone number
	$: {
		const cursorPosition = phoneInputElement?.selectionStart;
		const oldValue = phone;

		formatPhone(phone);

		restoreCursorPosition(phoneInputElement, oldValue, phone, cursorPosition);
	}

	// Format postal code
	$: {
		if (postal_code) {
			let zip = postal_code.replace(/\D/g, '');
			if (zip.length > 5) {
				zip = `${zip.slice(0, 5)}-${zip.slice(5, 9)}`;
			}

			postal_code = zip;
		}
	}

	function clearAddress() {
		address1 = '';
		address2 = '';
		city = '';
		state_or_province = '';
		postal_code = '';
	}

	function findCountry(phoneString, charsToInclude = 2) {
		const strToCompare = phoneString.slice(0, charsToInclude);
		const country = Countries.find((c) => c.dial_code === strToCompare);
		if (!country && phoneString.length > charsToInclude) {
			return findCountry(phoneString, charsToInclude + 1);
		}
		return { country, charsToInclude };
	}

	function formatPhone(phoneNumberString) {
		var clean = ('' + phoneNumberString).replace(/[^+\d]/g, '');

		let result = '';
		if (clean.startsWith('+')) {
			const { country, charsToInclude } = findCountry(clean);
			currentCountry = country;
			result = clean.slice(0, charsToInclude);
			clean = clean.slice(charsToInclude);
		} else if (clean.startsWith('1')) {
			// Workaround for auto complete with phones starting with 1
			result += '+1';
			clean = clean.slice(1);
		} else if (clean.length === 0) {
			currentCountry = Countries[0];
		}

		if (!currentCountry) {
			currentCountry = Countries[0];
		}

		if (currentCountry.phone_format) {
			const phoneFormat = currentCountry.phone_format;

			// First group uses parenthesis
			if (clean.length > 0) {
				result += ' (';
				result += clean.slice(0, Math.min(clean.length, phoneFormat[0]));
				clean = clean.slice(Math.min(clean.length, phoneFormat[0]));
			}

			// After second group, the separator should be a dash
			if (clean.length > 0) {
				result += ') ';
				result += clean.slice(0, Math.min(clean.length, phoneFormat[1]));
				clean = clean.slice(Math.min(clean.length, phoneFormat[1]));
			}

			if (clean.length > 0) {
				result += '-';
				result += clean;
			}
		} else {
			result += ` ${clean}`;
		}

		phone = result.trim();
	}

	export const validateAndSubmit = async (showSchemaErrors, submit = true) => {
		try {
			const addressInfo = {
				first_name,
				last_name,
				address1,
				address2,
				city,
				state_or_province,
				postal_code
			};

			let schemaToBeUsed =
				addressType === 'shipping' ? ShippingAddressSchema : BillingInfoSchema;

			if (hasPhone) {
				addressInfo.phone = phone;
			} else {
				schemaToBeUsed = ShippingAddressWithoutPhoneSchema;
			}

			const result = await schemaToBeUsed.validate(addressInfo, {
				abortEarly: false
			});

			// TODO: Refactor to remove hacky attribute
			delete result.isC2P;

			first_name_error = false;
			last_name_error = false;
			address1_error = false;
			address2_error = false;
			city_error = false;
			state_error = false;
			postal_code_error = false;
			address_info_error = false;

			if (hasPhone) {
				phone_error = false;
			}

			// Track field completions for abandonment analysis
			onFieldCompleted(getFieldName('full_name'), `${first_name} ${last_name}`);
			onFieldCompleted(getFieldName('address1'), address1);
			onFieldCompleted(getFieldName('address2'), address2);
			onFieldCompleted(getFieldName('city'), city);
			onFieldCompleted(getFieldName('state'), state_or_province);
			onFieldCompleted(getFieldName('postal_code'), postal_code);
			if (hasPhone) {
				onFieldCompleted(getFieldName('phone'), phone);
			}

			if (submit) {
				dispatch('focusremoved', result);
			}

			return true;
		} catch (e) {
			// Error when validating the address info schema. Ignore for the focus out action
			// The showSchemaErrors is false during the on:focusout event
			if (showSchemaErrors) {
				first_name_error = e.inner.find((err) => err.path === 'first_name');
				last_name_error = e.inner.find((err) => err.path === 'last_name');
				address1_error = e.inner.find((err) => err.path === 'address1');
				address2_error = e.inner.find((err) => err.path === 'address2');
				city_error = e.inner.find((err) => err.path === 'city');
				state_error = e.inner.find((err) => err.path === 'state_or_province');
				postal_code_error = e.inner.find((err) => err.path === 'postal_code');
				phone_error = e.inner.find((err) => err.path === 'phone');
				address_info_error =
					first_name_error?.message ||
					last_name_error?.message ||
					address1_error?.message ||
					address2_error?.message ||
					city_error?.message ||
					postal_code_error?.message ||
					state_error?.message ||
					phone_error?.message;
			}
			return false;
		}
	};

	async function onFocusOut(event) {
		if (!fieldset.contains(event.relatedTarget) && event.target.id !== 'extend') {
			validateAndSubmit(true);
		}
	}

	export function getAddressInfo() {
		let addressInfo = {
			first_name,
			last_name,
			address1,
			address2,
			city,
			state_or_province,
			postal_code,
			country
		};

		if (hasPhone) {
			addressInfo.phone = phone?.replace?.(/\D/g, '');
		}

		return addressInfo;
	}

	export function focusOnPhone() {
		phoneInputElement?.focus();
	}

	export function setAddressInfo(addr) {
		first_name = addr.first_name;
		last_name = addr.last_name;
		fullName = `${first_name} ${last_name}`.trim();
		address1 = addr.address1;
		address2 = addr.address2;
		city = addr.city;
		state_or_province = addr.state_or_province;
		postal_code = addr.postal_code;
		country = addr.country;
		if (hasPhone) {
			phone = addr.phone;
		}
	}

	let fieldset;

	const bottomFieldFormClass =
		'w-full col-span-2 relative flex flex-col justify-center rounded-b-lg';
</script>

<svelte:window
	on:click={({ target }) => {
		if (!autoCompleteContainer?.contains?.(target) && !address1El?.contains?.(target)) {
			showAutocomplete = false;
		}
	}}
/>

<fieldset data-testid="address-form" bind:this={fieldset} on:focusout={onFocusOut}>
	<Group>
		<div class="relative col-span-2 flex w-full flex-col justify-center rounded-t-lg">
			<input
				{disabled}
				bind:value={fullName}
				on:input={onFullNameInput}
				on:focus={() => handleFieldFocus('full_name')}
				on:blur={() => handleFieldBlur('full_name', fullName, first_name_error || last_name_error)}
				class="placeholder:text-fy-on-primary-subtle w-full rounded-t-lg border-0 disabled:bg-gray-100"
				class:error={first_name_error || last_name_error}
				data-testid="name"
				data-sensitive
				placeholder={namePlaceHolder || 'Name'}
				autocomplete="{addressType} name"
				type="text"
			/>
		</div>
		<div
			class={!expanded && !hasPhone
				? bottomFieldFormClass
				: 'relative col-span-2 flex w-full flex-col justify-center overflow-visible'}
		>
			<input
				{disabled}
				class={!expanded && !hasPhone
					? 'placeholder:text-fy-on-primary-subtle w-full rounded-b-lg border-0 disabled:bg-gray-100'
					: 'placeholder:text-fy-on-primary-subtle w-full border-0 disabled:bg-gray-100'}
				class:error={address1_error ||
					address2_error ||
					city_error ||
					state_error ||
					postal_code_error}
				data-testid="address1"
				data-sensitive
				bind:this={address1El}
				bind:value={address1}
				on:input={onAddress1Input}
				on:keydown={onAddressKeyDown}
				on:focus={() => handleFieldFocus('address1')}
				on:blur={() => handleFieldBlur('address1', address1, !!address1_error)}
				placeholder="Address"
				autocomplete={allowBrowserAutoFill ? `${addressType} address-line1` : 'disabled'}
				type="text"
				on:animationstart={expandForAutoFill}
			/>
			<div class="text-fy-on-primary-subtle absolute right-0 z-[2] text-xs font-semibold">
				{#if !expanded}
					<button
						type="button"
						data-testid="extend"
						id="extend"
						{disabled}
						class="m-2 rounded-full px-2 py-1 shadow"
						on:click={() => {
							expanded = true;
							shouldChangeTheFocus = false;
						}}>Enter manually</button
					>
				{/if}
				{#if address1 || address2 || city || state_or_province || postal_code}
					<button
						data-testid="clear-address"
						{disabled}
						class="m-2 rounded-full px-2 py-1 shadow"
						on:click={clearAddress}
					>
						Clear
					</button>
				{/if}
			</div>
			{#if showAutocomplete}
				<div data-testid="address-autocomplete-container" bind:this={autoCompleteContainer}>
					<AddressAutocomplete
						address={address1}
						bind:autoCompleteNext
						bind:autoCompletePrevious
						bind:selectCurrentAddress
						on:on-address-selected={onAddressSelected}
					/>
				</div>
			{/if}
		</div>
		<div
			class="relative col-span-2 flex w-full flex-col justify-center"
			class:not-expanded={!expanded}
		>
			<input
				{disabled}
				class="placeholder:text-fy-on-primary-subtle w-full border-0 disabled:bg-gray-100"
				class:error={address2_error}
				bind:value={address2}
				on:focus={() => handleFieldFocus('address2')}
				on:blur={() => handleFieldBlur('address2', address2, !!address2_error)}
				data-testid="address2"
				data-sensitive
				placeholder="Address line 2"
				autocomplete="{addressType} address-line2"
				type="text"
			/>
		</div>
		<div class="relative flex w-full flex-col justify-center" class:not-expanded={!expanded}>
			<input
				{disabled}
				class="placeholder:text-fy-on-primary-subtle w-full border-0 disabled:bg-gray-100"
				bind:value={city}
				on:focus={() => handleFieldFocus('city')}
				on:blur={() => handleFieldBlur('city', city, !!city_error)}
				class:error={city_error}
				data-testid="city"
				data-sensitive
				placeholder="City"
				autocomplete="{addressType} address-level2"
				type="text"
			/>
		</div>
		<div class="relative flex w-full flex-col justify-center" class:not-expanded={!expanded}>
			<input
				{disabled}
				class="border-fy-on-primary-subtle placeholder:text-fy-on-primary-subtle w-full border-0 disabled:bg-gray-100"
				bind:value={postal_code}
				on:focus={() => handleFieldFocus('postal_code')}
				on:blur={() => handleFieldBlur('postal_code', postal_code, !!postal_code_error)}
				class:error={postal_code_error}
				data-testid="postalCode"
				data-sensitive
				placeholder="ZIP"
				autocomplete="{addressType} postal-code"
				type="text"
			/>
		</div>
		<div
			class={expanded && !hasPhone
				? bottomFieldFormClass
				: 'relative col-span-2 flex w-full flex-col justify-center'}
			class:not-expanded={!expanded}
		>
			<input
				{disabled}
				class={expanded && !hasPhone
					? 'placeholder:text-fy-on-primary-subtle col-span-2 w-full rounded-b-lg border-0 disabled:bg-gray-100'
					: 'placeholder:text-fy-on-primary-subtle col-span-2 w-full border-0 disabled:bg-gray-100'}
				bind:value={state_or_province}
				on:focus={() => handleFieldFocus('state')}
				on:blur={() => handleFieldBlur('state', state_or_province, !!state_error)}
				class:error={state_error}
				data-testid="state"
				data-sensitive
				placeholder="State"
				autocomplete="{addressType} address-level1"
				type="text"
			/>
		</div>
		{#if hasPhone}
			<div class="relative col-span-2 flex w-full flex-col justify-center rounded-b-lg">
				<input
					bind:this={phoneInputElement}
					{disabled}
					class="placeholder:text-fy-on-primary-subtle w-full rounded-b-lg border-0 pl-10 disabled:bg-gray-100"
					data-testid="phone"
					data-sensitive
					class:error={phone_error}
					bind:value={phone}
					on:focus={() => handleFieldFocus('phone')}
					on:blur={() => handleFieldBlur('phone', phone, !!phone_error)}
					autocomplete="{addressType} tel"
					placeholder="(555) 555-0123"
					type="text"
				/>
				<span data-testid="flag" class="absolute left-0 z-[2] p-3">
					{currentCountry?.flag || ''}
				</span>
			</div>
		{/if}
	</Group>
	{#if address_info_error}
		<span class="text-fy-alert text-xs">
			{address_info_error}
		</span>
	{/if}
</fieldset>

<style>
	input.error {
		color: var(--color-fy-alert);
		box-shadow: var(--color-fy-form-element-input-error);
		z-index: 1;
	}

	input:focus,
	button:focus {
		border: 0 !important;
		outline: 0 !important;
		z-index: 2;

		box-shadow: var(--color-fy-form-element-input-focus);
		transition-property: box-shadow, color, filter;
	}

	@-webkit-keyframes autofill-in {
		0% {
			opacity: 1;
		}

		to {
			opacity: 1;
		}
	}

	@keyframes autofill-in {
		0% {
			opacity: 1;
		}

		to {
			opacity: 1;
		}
	}

	input:-webkit-autofill {
		-webkit-animation: autofill-in 1ms;
	}

	/*
	** In order for browser auto-fill work, the fields need to be already rendered.
	** So when the form is not expanded, we simply rendered them without showing.
	*/
	.not-expanded {
		position: absolute;
		opacity: 0;
		left: 0;
		top: 0;
		z-index: -1;
		height: 1px;
		width: 1px;
	}
</style>
