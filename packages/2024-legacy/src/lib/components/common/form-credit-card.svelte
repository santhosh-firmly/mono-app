<script>
	// @ts-nocheck
	import { CardName, CardNumber, CVC, ExpiryDate } from '$lib/browser/localization.js';

	import { getContext } from 'svelte';
	import {
		EmptyCardInfo,
		formatCardNumber,
		formatExpiry,
		getCardTypeByValue,
		validateCreditCard,
		validateCVC,
		validateExpiryDate
	} from '$lib/browser/credit-card-helper.js';
	import FloatingLabelInput from '$lib/components/vendor/floating-label-input.svelte';
	import Helper from '$lib/components/vendor/helper.svelte';

	export let key = Symbol();
	let context = getContext(key);
	const { handleChange, form, errors } = context;

	let cardComponent = EmptyCardInfo.component;

	$: {
		let t = getCardTypeByValue($form.cardNumber);
		if (cardComponent !== t.component) {
			cardComponent = t.component;
		}
	}

	function handleExpiryKeyup(evt) {
		let fe = formatExpiry(evt);
		evt.target.value = fe;
	}

	function handleCCNumberKeyup(evt) {
		let cc = formatCardNumber(evt);
		evt.target.value = cc.formatted;
	}
	let innerWidth;
</script>

<svelte:window bind:innerWidth />

<fieldset
	class="flex flex-row basis-full gap-1 sm:gap-3 rounded-md border py-0.5 px-1 justify-left"
>
	{#if innerWidth > 335}
		<span class="self-center sm:pl-1 pr-0.5"><svelte:component this={cardComponent} /></span>
	{/if}
	<input
		class="px-0.5 sm:px-3 min-w-[19ch] sm:min-w-[25ch] max-w-[19ch] sm:max-w-[25ch] border-0 text-sm rounded-md focus:rounded-md {$errors.cardNumber
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="tel"
		inputmode="numeric"
		autoComplete="billing cc-number"
		required
		id="cardNumber"
		bind:value={$form.cardNumber}
		on:change={handleChange}
		on:keydown={validateCreditCard}
		on:keyup={handleCCNumberKeyup}
		placeholder={CardNumber}
		maxlength="19"
	/>

	<input
		class="px-0.5 sm:px-3 min-w-[7ch] sm:min-w-[11ch] max-w-[7ch] sm:max-w-[11ch] border-0 text-sm rounded-md focus:rounded-md {$errors.expiryDate
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="tel"
		inputmode="numeric"
		autoComplete="billing cc-exp"
		required
		id="expiryDate"
		bind:value={$form.expiryDate}
		on:change={handleChange}
		on:keydown={validateExpiryDate}
		on:keyup={handleExpiryKeyup}
		placeholder={ExpiryDate}
		maxlength="6"
	/>
	<input
		class="px-0.5 sm:px-3 sm:min-w-[7ch] sm:max-w-[7ch] min-w-[5ch] max-w-[5ch] border-0 text-sm rounded-md focus:rounded-md {$errors.cvc
			? 'bg-red-200'
			: 'bg-slate-100'}"
		type="password"
		inputmode="numeric"
		autoComplete="billing cc-csc"
		required
		id="cvc"
		bind:value={$form.cvc}
		on:change={handleChange}
		on:keydown={validateCVC}
		placeholder={CVC}
		maxlength="4"
	/>
</fieldset>
<div class="flex flex-row">
	<Helper
		color="red"
		class="basis-3/4"
		helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 pr-2 self-center"
		>{$errors.cardNumber || $errors.expiryDate || $errors.cvc}</Helper
	>
	{#if innerWidth <= 335}
		<span class="flex basis-1/4 sm:pl-1 pr-0.5 justify-end"
			><svelte:component this={cardComponent} /></span
		>
	{/if}
</div>

<FloatingLabelInput
	style="outlined"
	id="cardName"
	name="cardName"
	label={CardName}
	autocomplete="name given-name"
	type="text"
	inputmode="text"
	on:change={handleChange}
	bind:value={$form.cardName}
/>
{#if $errors.cardName}
	<Helper color="red">{$errors.cardName}</Helper>
{/if}
