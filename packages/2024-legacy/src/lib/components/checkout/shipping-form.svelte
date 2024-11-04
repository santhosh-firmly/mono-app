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
	} from '$lib/browser/localization.js';
	import { getAddress, searchAddress } from '$lib/browser/api-manager.js';
	import AutoComplete from '$lib/components/vendor/auto-complete.svelte';
	import Helper from '../vendor/helper.svelte';
	import ValidatedFloatingLabelInput from '../common/validated-floating-label-input.svelte';
	import { ShippingInfoSchema } from '$lib/browser/schema';
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

<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
	<div class="flex text-lg flex-row h-10 mt-3 px-4 font-bold">Contact</div>
	<div class="flex sm:flex-row flex-col gap-2 px-4">
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

	<div class="flex text-lg flex-row h-10 mt-3 px-4 font-bold">Shipping Address</div>

	<div class="flex sm:flex-row flex-col gap-2 px-4">
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
		/>
		{#if $errors.address1}
			<Helper
				color="red"
				helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-end pr-2"
				>{$errors.address1}</Helper
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
		/>
	</div>
	<div class="flex sm:flex-row flex-col gap-2 px-4">
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

	<div class="flex items-end justify-end m-3">
		<button
			type="submit"
			class="w-full lg:w-1/3 text-center focus:ring-4 focus:outline-none items-center justify-center px-5 py-2 text-white focus:ring-blue-300 rounded-3xl hover:bg-blue-800 font-semibold text-normal bg-[#4c7cec]"
		>
			Save & Continue
		</button>
	</div>
</form>
