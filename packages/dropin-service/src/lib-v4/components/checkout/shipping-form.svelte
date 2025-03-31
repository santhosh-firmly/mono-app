<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
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
		Zip
	} from '$lib-v4/browser/localization.js';
	import { getAddress, searchAddress } from '$lib-v4/browser/api-manager.js';
	import AutoComplete from '$lib-v4/components/vendor/auto-complete.svelte';
	import Helper from '../vendor/helper.svelte';
	import ValidatedFloatingLabelInput from '../common/validated-floating-label-input.svelte';
	import { ShippingInfoSchema } from '$lib-v4/browser/schema';
	import { createForm } from 'svelte-forms-lib';

	const dispatch = createEventDispatcher();

	export let shippingInfo = {
		country: 'United States'
	};

	export let cartsAndOrders;

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: shippingInfo,
		validationSchema: ShippingInfoSchema,
		onSubmit: async (shippingInfo) => {
			dispatch('submit', { shippingInfo });
		}
	});

	async function onAddressChange(item) {
		if (item) {
			const ret = await getAddress(item.id, cartsAndOrders[0]?.shop_id);
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

<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2" data-testid="shipping-form">
	<div class="mt-3 flex h-10 flex-row px-4 text-lg font-bold">Contact</div>
	<div class="flex flex-col gap-2 px-4 sm:flex-row">
		<div class="w-1/2">
			<ValidatedFloatingLabelInput
				id="email"
				style="outlined"
				label={Email}
				autocomplete="email"
				on:change={handleChange}
				bind:value={$form.email}
				errorMessage={$errors.email}
			/>
		</div>
		<div class="w-1/2">
			<ValidatedFloatingLabelInput
				style="outlined"
				label={Phone}
				id="phone"
				autocomplete="phone"
				on:change={handleChange}
				bind:value={$form.phone}
				errorMessage={$errors.phone}
			/>
		</div>
	</div>

	<div class="mt-3 flex h-10 flex-row px-4 text-lg font-bold">Shipping Address</div>

	<div class="flex flex-col gap-2 px-4 sm:flex-row">
		<div class="w-1/2">
			<ValidatedFloatingLabelInput
				style="outlined"
				label={FirstName}
				id="first_name"
				autocomplete="first_name"
				on:change={handleChange}
				bind:value={$form.first_name}
				errorMessage={$errors.first_name}
			/>
		</div>
		<div class="w-1/2">
			<ValidatedFloatingLabelInput
				style="outlined"
				label={LastName}
				id="last_name"
				autocomplete="family-name"
				on:change={handleChange}
				bind:value={$form.last_name}
				errorMessage={$errors.last_name}
			/>
		</div>
	</div>

	<div class="flex flex-col gap-2 px-4">
		<!-- TODO: Wrap this component -->
		<!--
			This component has an onChange, which is custom-built by AutoComplete to return the clicked result.
			However, we must also listen to the native on:change to perform schema validation using svelte-forms-lib
		-->
		<AutoComplete
			id="address1"
			name="address1"
			label={Address1}
			type="text"
			bind:text={$form.address1}
			searchFunction={() => searchAddress($form.address1, cartsAndOrders[0]?.shop_id)}
			labelFieldName="address"
			valueFieldName="address1"
			localFiltering={false}
			delay={250}
			minCharactersToSearch={3}
			placeholder={ShippingAddressSearch}
			onChange={onAddressChange}
			on:change={handleChange}
			data-testid="address1-input"
		/>
		{#if $errors.address1}
			<Helper
				color="red"
				helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-end pr-2"
				data-testid="address1-error">{$errors.address1}</Helper
			>
		{/if}

		<ValidatedFloatingLabelInput
			id="address2"
			style="outlined"
			label={Address2}
			autocomplete="shipping address-line2"
			on:change={handleChange}
			bind:value={$form.address2}
			errorMessage={$errors.address2}
			data-testid="address2-input"
		/>
	</div>
	<div class="flex flex-col gap-2 px-4 sm:flex-row">
		<div class="w-1/3">
			<ValidatedFloatingLabelInput
				id="postal_code"
				style="outlined"
				label={Zip}
				autocomplete="shipping postal-code"
				on:change={handleChange}
				bind:value={$form.postal_code}
				errorMessage={$errors.postal_code}
			/>
		</div>
		<div class="w-1/3">
			<ValidatedFloatingLabelInput
				id="city"
				style="outlined"
				label={City}
				autocomplete="shipping address-level2"
				on:change={handleChange}
				bind:value={$form.city}
				errorMessage={$errors.city}
			/>
		</div>

		<div class="w-1/3">
			<ValidatedFloatingLabelInput
				id="state_or_province"
				style="outlined"
				label={State}
				autocomplete="shipping address-level1"
				on:change={handleChange}
				bind:value={$form.state_or_province}
				errorMessage={$errors.state_or_province}
			/>
		</div>
	</div>

	<div class="m-3 flex items-end justify-end">
		<button
			type="submit"
			class="text-normal w-full items-center justify-center rounded-3xl bg-[#4c7cec] px-5 py-2 text-center font-semibold text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none lg:w-1/3"
			data-testid="save-continue-button"
		>
			Save & Continue
		</button>
	</div>
</form>
