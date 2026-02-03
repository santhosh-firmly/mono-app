<script>
	import UiLabel from '$lib/components/ui/label.svelte';
	import UiInput from '$lib/components/ui/input.svelte';
	import UiSpinner from '$lib/components/ui/spinner.svelte';
	import ShippingEmailMessage from './shipping-email-message.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} ShippingEmailFormProps
	 * @property {Object} form - Form object with email validator
	 * @property {boolean} isValidating - Whether C2P lookup is in progress
	 * @property {boolean} c2pInitialized - Whether C2P SDK is loaded
	 * @property {() => void} onBlur - Callback when email input loses focus
	 */

	/**
	 * @type {ShippingEmailFormProps}
	 */
	let { form = {}, onBlur = () => {}, isValidating = false, c2pInitialized = false } = $props();
</script>

<div class="flex flex-col gap-1.5">
	<UiLabel label={m.email()} errorMessage={form.email?.error}>
		<div class="relative">
			<UiInput
				value={form.email?.value}
				onChange={form.email?.validate}
				{onBlur}
				errorMessage={form.email?.error}
				disabled={isValidating}
				autocomplete="shipping email"
				class="shadow-sm"
			/>
			{#if isValidating}
				<div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
					<UiSpinner class="size-4  text-gray-400" />
				</div>
			{/if}
		</div>
	</UiLabel>

	{#if c2pInitialized}
		<ShippingEmailMessage />
	{/if}
</div>
