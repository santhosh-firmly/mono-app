<script>
	import UiLabel from '$lib/components/ui/ui-label.svelte';
	import UiInput from '$lib/components/ui/ui-input.svelte';
	import UiAlert from '$lib/components/ui/ui-alert.svelte';
	import UiCheckbox from '$lib/components/ui/ui-checkbox.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CheckoutShippingEmailFormProps
	 * @property {Object} form - The form object
	 * @property {string} termsUrl - The URL of the terms and conditions page
	 * @property {Function} onAcceptTerms - The function to call when the terms and conditions are accepted
	 */

	/**
	 * @type {CheckoutShippingEmailFormProps}
	 */
	let { form = {}, termsUrl = '', onAcceptTerms = () => {} } = $props();
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-1.5">
		<UiLabel label="Email" errorMessage={form.email.error}>
			<UiInput
				value={form.email.value}
				onChange={form.email.validate}
				errorMessage={form.email.error}
			/>
		</UiLabel>

		<UiAlert>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html m.c2p_consent()}
		</UiAlert>
	</div>

	{#if termsUrl}
		<UiCheckbox onChange={onAcceptTerms}>
			<p class="text-muted flex items-center gap-1 text-xs">
				{m.marketing_consent()}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve The next link is an external link and should not be calculated using `resolve`-->
				<a href={termsUrl} class="text-primary underline">{m.terms_and_conditions()}</a>
			</p>
		</UiCheckbox>
	{/if}
</div>
