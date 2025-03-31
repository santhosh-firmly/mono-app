<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import Collapsible from '$lib-v4/components/common/collapsible.svelte';
	import { ShippingInfoSchema } from '$lib-v4/browser/schema.js';
	import FormField from '$lib-v4/components/common/form-field.svelte';
	import {
		Address1,
		Address2,
		City,
		Email,
		FirstName,
		InfoC2POTPDetail,
		InfoC2POTPHeader,
		InfoC2PPrivacy,
		InfoC2PRememberMe,
		InfoC2PRememberMeLong,
		InfoEmail,
		InfoOTP,
		InfoPhone,
		LastName,
		LinkResendOTP,
		Phone,
		ShippingAddressSearch,
		State,
		ViewTitleC2POtp,
		ViewTitleContact,
		ViewTitleShippingAddress,
		Zip
	} from '$lib-v4/browser/localization.js';
	import { createForm } from 'svelte-forms-lib';
	import {
		cViewContactShippingAddress,
		sWizardLast,
		wizardBack,
		wizardNext
	} from '$lib-v4/browser/wizard.js';
	import SectionHeader from '$lib-v4/components/common/section-header.svelte';
	import {
		cC2PaymentEmail,
		cC2PaymentOTP,
		cPaymentC2P,
		cPaymentCreditCard,
		sC2PaymentFlow,
		sNavBackHandler,
		sNavNextHandler,
		sPaymentFlow
	} from '$lib-v4/browser/storage.js';
	import {
		c2pWalletUnlockComplete,
		c2pWalletUnlockStart,
		cartUpdateShippingInfo,
		getAddress,
		sShippingInfo,
		sWallet,
		sWalletRememberMe,
		searchAddress
	} from '$lib-v4/browser/api-manager.js';
	import { onDestroy, onMount, setContext } from 'svelte';
	import OtpField from '$lib-v4/components/common/otp-field.svelte';
	import Alert from '$lib-v4/components/common/alert.svelte';
	import C2pLogo from '$lib-v4/components/common/c2p-logo.svelte';
	import AutoComplete from '$lib-v4/components/vendor/auto-complete.svelte';

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues: $sShippingInfo,
		validationSchema: ShippingInfoSchema,
		onSubmit: onSubmit
	});

	async function onSubmit(values) {
		// Save the intermediate state, so that, we can show the same address during on the mount.
		sShippingInfo.set(values);
		if (values.isC2P) {
			const res = await c2pWalletUnlockStart(values.email);
			if (res) {
				if (res.recognized) {
					const cartInfo = await cartUpdateShippingInfo($sShippingInfo);
					if (cartInfo) {
						sC2PaymentFlow.set(cC2PaymentEmail);
						sPaymentFlow.set(cPaymentC2P);
						wizardNext();
					}
				} else {
					sC2PaymentFlow.set(cC2PaymentOTP);
				}
			} else {
				values.isC2P = false;
				sShippingInfo.set(values);
			}
		}
		if (!values.isC2P) {
			const cartInfo = await cartUpdateShippingInfo(values);
			if (cartInfo) {
				sPaymentFlow.set(cPaymentCreditCard);
				wizardNext();
			}
		}
	}

	const key = Symbol('C2PContactShippingInfo');
	setContext(key, { form, errors, handleChange });

	function onNextHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentOTP) {
			otpHandleSubmit(event);
		} else {
			handleSubmit(event);
		}
	}

	function onOTPBackHandler() {
		sC2PaymentFlow.set(cC2PaymentEmail);
	}

	function onBackHandler(event) {
		if ($sC2PaymentFlow == cC2PaymentOTP) {
			onOTPBackHandler(event);
		} else {
			wizardBack(event);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);
		sNavBackHandler.set(onBackHandler);
	});

	onDestroy(() => {
		sWizardLast.set(cViewContactShippingAddress);
		sNavBackHandler.set(null);
		sNavNextHandler.set(null);
	});

	let otpComponent;
	function otpHandleSubmit() {
		otpComponent.handleSubmit();
	}

	async function onOtpComplete(otpValue) {
		const res = await c2pWalletUnlockComplete(otpValue);
		if (res) {
			const cartInfo = await cartUpdateShippingInfo($sShippingInfo);
			if (cartInfo) {
				sC2PaymentFlow.set(cC2PaymentEmail);
				sPaymentFlow.set(cPaymentC2P);
				wizardNext();
			}
		}
	}

	async function onOTPSend() {
		await c2pWalletUnlockStart($sShippingInfo.email);
	}

	let otpEmailInfo, otpPhoneInfo;
	$: {
		otpEmailInfo = otpPhoneInfo = null;
		if ($sWallet.otp_destination) {
			if ($sWallet.otp_destination.emails) {
				otpEmailInfo = $sWallet.otp_destination.emails.join(',');
			}
			if ($sWallet.otp_destination.phones) {
				otpPhoneInfo = $sWallet.otp_destination.phones.join(',');
			}
		}
	}

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

{#if $sC2PaymentFlow == cC2PaymentEmail}
	<div id="viewC2PLogin" fobs>
		<form on:submit={handleSubmit} class="flex flex-col gap-2 pt-2 pb-2">
			<SectionHeader header={ViewTitleContact} />
			<div class="flex flex-col gap-2 px-4 sm:flex-row">
				<FormField {key} id="email" label={Email} autocomplete="email" type="email" required />
				<FormField {key} id="phone" label={Phone} autocomplete="tel" type="tel" required />
			</div>
			<div class="flex flex-col gap-2 px-4 sm:flex-row">
				<div class="text-secondary flex flex-row items-center justify-start gap-2 text-xs">
					<input type="checkbox" bind:checked={$form.isC2P} />
					<span>{@html InfoC2PPrivacy}</span>
				</div>
			</div>

			<SectionHeader header={ViewTitleShippingAddress} />

			<div class="flex flex-col gap-2 px-4 sm:flex-row">
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
			<div class="flex flex-col gap-2 px-4 sm:flex-col">
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
			<div class="flex flex-col gap-2 px-4 sm:flex-row">
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
{:else if $sC2PaymentFlow == cC2PaymentOTP}
	<div id="viewC2POTP" fobs>
		<Alert header={InfoC2POTPHeader} detail={InfoC2POTPDetail} />
		<SectionHeader header={ViewTitleC2POtp} />
		<div class="mt-2 flex flex-col gap-3 px-4">
			<div class="flex justify-center">
				<C2pLogo />
			</div>
			<div class="flex justify-center text-center text-xs">
				{InfoOTP}
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
			<Collapsible
				shortText={InfoC2PRememberMe}
				longText={InfoC2PRememberMeLong}
				checked={$sWalletRememberMe}
				on:change={(ev) => {
					sWalletRememberMe.set(ev.detail.target.checked);
				}}
			/>
			<button
				class="flex cursor-pointer justify-center text-center text-xs underline"
				on:click={onOTPSend}
			>
				{LinkResendOTP}
			</button>
		</div>
	</div>
{/if}
