<script>
	// @ts-nocheck

	import { ShippingInfoSchema } from '$lib-v4/browser/schema.js';
	import FormField from '$lib-v4/components/common/form-field.svelte';
	import {
		Address1,
		Address2,
		City,
		Email,
		FirstName,
		LastName,
		Phone,
		ShippingAddressSearch,
		State,
		ViewTitleShippingAddress,
		Zip
	} from '$lib-v4/browser/localization.js';
	import { createForm } from 'svelte-forms-lib';
	import {
		cViewShippingAddress,
		sWizardLast,
		sWizardShipping,
		wizardBack,
		wizardNext
	} from '$lib-v4/browser/wizard.js';
	import SectionHeader from '$lib-v4/components/common/section-header.svelte';
	import { sNavBackHandler, sNavNextHandler } from '$lib-v4/browser/storage.js';
	import {
		cartUpdateShippingInfo,
		getAddress,
		sShippingInfo,
		searchAddress
	} from '$lib-v4/browser/api-manager.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import AutoComplete from '$lib-v4/components/vendor/auto-complete.svelte';

	async function onSubmit(values) {
		// Save the intermediate state, so that, we can show the same address during on the mount.
		sShippingInfo.set(values);
		let cartInfo = await cartUpdateShippingInfo(values);
		if (cartInfo) {
			if ($sWizardShipping) {
				sWizardShipping.set(false);
			} else {
				wizardNext();
			}
		}
	}

	function onBackHandler() {
		if ($sWizardShipping) {
			sWizardShipping.set(false);
		} else {
			wizardBack();
		}
	}

	export let email, phone;

	export const { form, errors, handleChange, handleSubmit, updateInitialValues } = createForm({
		initialValues: $sShippingInfo,
		validationSchema: ShippingInfoSchema,
		onSubmit: onSubmit
	});

	const key = Symbol('ShippingInfo');
	setContext(key, { form, errors, handleChange });

	onMount(() => {
		sNavNextHandler.set(handleSubmit);
		sNavBackHandler.set(onBackHandler);
	});

	onDestroy(() => {
		sWizardLast.set(cViewShippingAddress);
		sNavNextHandler.set(null);
		sNavBackHandler.set(null);
	});

	async function onAddressChange(item) {
		if (item) {
			const ret = await getAddress(item.id);
			if (ret) {
				if (ret.address2) {
					$form.address2 = ret.address2;
				}
				$form.city = ret.city;
				$form.country = ret.country;
				$form.postal_code = ret.postal_code;
				$form.state_name = ret.state_name;
				$form.state_or_province = ret.state_or_province;
			}
		}
	}
</script>

<div {...$$restProps} fobs>
	<SectionHeader header={ViewTitleShippingAddress} />

	<form on:submit={handleSubmit} class="flex flex-col gap-2 px-4 pt-2 pb-2">
		<div class="flex flex-col gap-2 sm:flex-row">
			<FormField
				{key}
				id="email"
				label={Email}
				autocomplete="email"
				type="email"
				required
				bind:input={email}
			/>
			<FormField
				{key}
				id="phone"
				label={Phone}
				autocomplete="tel"
				type="tel"
				required
				bind:input={phone}
			/>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row">
			<FormField
				{key}
				id="first_name"
				label={FirstName}
				autocomplete="given-name"
				type="text"
				required
			/>
			<FormField
				{key}
				id="last_name"
				label={LastName}
				autocomplete="family-name"
				type="text"
				required
			/>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row">
			<AutoComplete
				id="address1"
				label={Address1}
				autocomplete="shipping address-line1"
				type="text"
				required
				bind:text={$form.address1}
				searchFunction={searchAddress}
				labelFieldName="address"
				valueFieldName="address1"
				autocompleteOffValue="no"
				localFiltering={false}
				delay={250}
				minCharactersToSearch={3}
				placeholder={ShippingAddressSearch}
				onChange={onAddressChange}
			/>
			<FormField
				{key}
				id="address2"
				label={Address2}
				autocomplete="shipping address-line2"
				type="text"
			/>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row">
			<FormField
				{key}
				id="postal_code"
				label={Zip}
				autocomplete="shipping postal-code"
				type="tel"
				required
			/>

			<FormField
				{key}
				id="city"
				label={City}
				autocomplete="shipping address-level2"
				type="text"
				required
			/>
			<FormField
				{key}
				id="state_or_province"
				label={State}
				autocomplete="shipping address-level1"
				type="text"
				required
			/>
		</div>
	</form>
</div>
