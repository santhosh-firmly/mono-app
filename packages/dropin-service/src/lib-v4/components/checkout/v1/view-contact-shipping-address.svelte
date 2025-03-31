<script>
	// @ts-nocheck

	import { PasswordSchema, ShippingInfoSchema } from '$lib-v4/browser/schema.js';
	import FormField from '$lib-v4/components/common/form-field.svelte';
	import {
		Address1,
		Address2,
		City,
		Email,
		FirstName,
		InfoEmail,
		InfoMerchantOtpDetail,
		InfoMerchantOtpHeader,
		InfoPhone,
		InfoStoreLoginHeader,
		LastName,
		LinkResendOTP,
		Phone,
		ShippingAddressSearch,
		State,
		ViewTitleContact,
		ViewTitleShippingAddress,
		Zip
	} from '$lib-v4/browser/localization.js';
	import { createForm } from 'svelte-forms-lib';
	import {
		cViewContactShippingAddress,
		cViewPayment,
		sWizardLast,
		wizardBack,
		wizardNext
	} from '$lib-v4/browser/wizard.js';
	import SectionHeader from '$lib-v4/components/common/section-header.svelte';
	import {
		cLoginPassword,
		cLoginShipping,
		sLoginFlow,
		sNavBackHandler,
		sNavNextHandler,
		sLoginOtpDestinations
	} from '$lib-v4/browser/storage.js';
	import {
		cartUpdateShippingInfo,
		getAddress,
		sCart,
		sShippingInfo,
		searchAddress,
		sessionCreateOtp,
		sessionJoin,
		sessionValidateOtp,
		sSignedInOnThisSession
	} from '$lib-v4/browser/api-manager.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import AutoComplete from '$lib-v4/components/vendor/auto-complete.svelte';
	import { postSignIn } from '$lib-v4/browser/cross.js';
	import AdoremeLogoLarge from '$lib-v4/components/common/svg/adoreme-logo-large.svelte';
	import OtpField from '$lib-v4/components/common/otp-field.svelte';
	import Alert from '$lib-v4/components/common/alert.svelte';

	const {
		form: shippingForm,
		errors: shippingErrors,
		handleChange: shippingHandleChange,
		handleSubmit: shippingHandleSubmit
	} = createForm({
		initialValues: $sShippingInfo,
		validationSchema: ShippingInfoSchema,
		onSubmit: onShippingAddressSubmit
	});

	const shippingKey = Symbol('ContactShippingInfo');
	setContext(shippingKey, {
		form: shippingForm,
		errors: shippingErrors,
		handleChange: shippingHandleChange
	});

	const {
		form: passwordForm,
		errors: passwordErrors,
		handleChange: passwordHandleChange
		// handleSubmit: passwordHandleSubmit,
	} = createForm({
		initialValues: PasswordSchema.cast(),
		validationSchema: PasswordSchema,
		onSubmit: onPasswordSubmit
	});

	const passwordKey = Symbol('passwordInfo');
	setContext(passwordKey, {
		form: passwordForm,
		errors: passwordErrors,
		handleChange: passwordHandleChange
	});

	async function onShippingAddressSubmit(values) {
		// Save the intermediate state, so that, we can show the same address during on the mount.
		values.isC2P = false;
		sShippingInfo.set(values);

		const cartInfo = await cartUpdateShippingInfo(values);
		if (cartInfo && cartInfo.session) {
			if (cartInfo.session.is_email_registered && !cartInfo.is_logged_in) {
				sLoginFlow.set(cLoginPassword);
				await sendOTP($sShippingInfo.email);
			} else if (cartInfo.session.is_email_registered == false) {
				wizardNext();
			} else {
				// Other scenarios. Take to review screen.
				wizardNext();
			}
		}
	}

	async function onPasswordSubmit(values) {
		const cartInfo = await sessionJoin(values.password);
		if (cartInfo) {
			if (cartInfo.session?.is_logged_in) {
				if (cartInfo.session.cookies && cartInfo.session.cookies.length > 0) {
					postSignIn(cartInfo.session.cookies);
				}
			}
			wizardNext();
		}
	}

	function onNextHandler(event) {
		if ($sLoginFlow == cLoginShipping) {
			shippingHandleSubmit(event);
		} else {
			otpHandleSubmit(event);
			// passwordHandleSubmit(event);
		}
	}

	function onBackHandler(event) {
		if ($sLoginFlow == cLoginShipping) {
			wizardBack(event);
		} else {
			sLoginFlow.set(cLoginShipping);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);

		if ($sWizardLast == cViewPayment) {
			if ($sCart && $sCart.session && $sCart.session.is_logged_in) {
				wizardNext();
			}
		}
	});

	onDestroy(() => {
		sWizardLast.set(cViewContactShippingAddress);
		sNavBackHandler.set(null);
		sNavNextHandler.set(null);
	});

	async function onAddressChange(item) {
		if (item) {
			const ret = await getAddress(item.id);
			if (ret) {
				if (ret.address2) {
					$shippingForm.address2 = ret.address2;
				}
				$shippingForm.city = ret.city;
				$shippingForm.country = ret.country;
				$shippingForm.postal_code = ret.postal_code;
				$shippingForm.state_name = ret.state_name;
				$shippingForm.state_or_province = ret.state_or_province;
			}
		}
	}

	// OTP related variables and functions

	let otpEmailInfo;
	let otpPhoneInfo;

	$: {
		otpEmailInfo = otpPhoneInfo = null;
		if ($sLoginOtpDestinations?.otp_destination) {
			if ($sLoginOtpDestinations.otp_destination.emails) {
				otpEmailInfo = $sLoginOtpDestinations.otp_destination.emails.join(',');
			}
			if ($sLoginOtpDestinations.otp_destination.phones) {
				otpPhoneInfo = $sLoginOtpDestinations.otp_destination.phones.join(',');
			}
		}
	}

	let otpComponent;
	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function sendOTP(email) {
		const res = await sessionCreateOtp(email);
		if (res?.otp_destination) {
			sLoginOtpDestinations.set(res);
		}
	}

	async function onOtpComplete(otpValue) {
		const res = await sessionValidateOtp($sShippingInfo.email, otpValue);
		if (res) {
			sCart.set(res);
			if (res.session?.is_logged_in) {
				if (res.session.cookies && res.session.cookies.length > 0) {
					postSignIn(res.session.cookies);
					sSignedInOnThisSession.set(true);
				}
			}
			wizardNext();
		}
	}
</script>

{#if $sLoginFlow == cLoginShipping}
	<div id="viewContactShippingAddress" fobs>
		<form on:submit={shippingHandleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
			<SectionHeader header={ViewTitleContact} />
			<div class="flex flex-col gap-2 px-4 sm:flex-row">
				<FormField
					key={shippingKey}
					id="email"
					label={Email}
					autocomplete="email"
					type="email"
					required
				/>
				<FormField
					key={shippingKey}
					id="phone"
					label={Phone}
					autocomplete="tel"
					type="tel"
					required
				/>
			</div>

			<SectionHeader header={ViewTitleShippingAddress} />

			<div class="flex flex-col gap-2 px-4 sm:flex-row">
				<FormField
					key={shippingKey}
					id="first_name"
					label={FirstName}
					autocomplete="given-name"
					type="text"
					required
				/>
				<FormField
					key={shippingKey}
					id="last_name"
					label={LastName}
					autocomplete="family-name"
					type="text"
					required
				/>
			</div>
			<div class="flex flex-col gap-2 px-4 sm:flex-col">
				<AutoComplete
					id="address1"
					label={Address1}
					autocomplete="shipping address-line1"
					type="text"
					required
					bind:text={$shippingForm.address1}
					searchFunction={searchAddress}
					labelFieldName="address"
					valueFieldName="address1"
					localFiltering={false}
					delay={250}
					minCharactersToSearch={3}
					placeholder={ShippingAddressSearch}
					onChange={onAddressChange}
				/>
				<FormField
					key={shippingKey}
					id="address2"
					label={Address2}
					autocomplete="shipping address-line2"
					type="text"
				/>
			</div>
			<div class="flex flex-col gap-2 px-4 sm:flex-row">
				<FormField
					key={shippingKey}
					id="postal_code"
					label={Zip}
					autocomplete="shipping postal-code"
					type="tel"
					required
				/>

				<FormField
					key={shippingKey}
					id="city"
					label={City}
					autocomplete="shipping address-level2"
					type="text"
					required
				/>
				<FormField
					key={shippingKey}
					id="state_or_province"
					label={State}
					autocomplete="shipping address-level1"
					type="text"
					required
				/>
			</div>
		</form>
	</div>
{:else if $sLoginFlow == cLoginPassword}
	<div id="viewStorePasswordAndOTP" fobs>
		<Alert
			header={InfoMerchantOtpHeader.replaceAll('#MERCHANT#', $sCart.display_name || $sCart.shop_id)}
			detail={InfoMerchantOtpDetail}
		/>
		<SectionHeader header={InfoStoreLoginHeader($sCart.display_name || $sCart.shop_id)} />
		<div class="mt-2 flex flex-col gap-3 px-4">
			<div class="flex justify-center">
				<AdoremeLogoLarge class="mx-2 my-1" />
			</div>
			<div class="flex justify-center text-center text-xs">
				Enter the one-time code {$sCart.display_name || $sCart.shop_id} sent to
			</div>
			{#if otpEmailInfo}
				<div class="flex justify-center text-center text-xs">
					{InfoEmail}<span class="pl-2 font-semibold">{otpEmailInfo}</span>
				</div>
			{/if}
			{#if otpPhoneInfo}
				<div class="flex justify-center text-center text-xs">
					{InfoPhone}<span class="pl-2 font-semibold">{otpPhoneInfo}</span>
				</div>
			{/if}
			<OtpField onOTPComplete={onOtpComplete} bind:this={otpComponent} />
			<button
				class="flex cursor-pointer justify-center text-center text-xs underline"
				on:click={() => sendOTP($sShippingInfo.email)}
			>
				{LinkResendOTP}
			</button>
		</div>
		<!-- <SectionHeader header={InfoStoreLoginHeader($sCart.display_name || $sCart.shop_id)} />
		<div class="flex flex-col gap-3 mt-2 px-4">
			<div class="flex justify-center text-xs text-center">
				{InfoStoreLoginDetail($sShippingInfo.email)}
			</div>
			<form on:submit={passwordHandleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
				<FormField
					key={passwordKey}
					id="password"
					label={Password}
					autocomplete="password"
					type="password"
					required
				/>
			</form>
		</div> -->
	</div>
{/if}
