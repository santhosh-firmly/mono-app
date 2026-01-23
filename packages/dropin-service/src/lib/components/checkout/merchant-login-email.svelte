<script>
	import UiInput from '$lib/components/ui/input.svelte';
	import UiButton from '$lib/components/ui/button.svelte';
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} MerchantLoginEmailProps
	 * @property {string} email - The email value
	 * @property {string} error - Error message to display
	 * @property {boolean} loading - Whether the form is submitting
	 * @property {Function} onEmailChange - Called when email changes
	 * @property {Function} onSubmit - Called when form is submitted
	 */

	/**
	 * @type {MerchantLoginEmailProps}
	 */
	let {
		email = '',
		error = '',
		loading = false,
		onEmailChange = () => {},
		onSubmit = () => {}
	} = $props();

	let emailValue = $derived.by(() => email);

	function handleChange(value) {
		emailValue = value;
		onEmailChange(value);
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (emailValue.trim()) {
			onSubmit(emailValue);
		}
	}

	let isValidEmail = $derived(emailValue.includes('@') && emailValue.includes('.'));
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<div class="text-center">
		<h3 class="text-lg font-semibold">Sign in to your account</h3>
		<p class="text-muted mt-1 text-sm">Enter your email to access your saved information</p>
	</div>

	<UiInput
		type="email"
		placeholder="Email address"
		value={emailValue}
		onChange={handleChange}
		errorMessage={error}
		disabled={loading}
		autocomplete="email"
	>
		{#snippet prefix()}
			<Icon icon="mdi:email-outline" class="text-muted text-xl" />
		{/snippet}
	</UiInput>

	<UiButton type="submit" disabled={loading || !isValidEmail} class="w-full">
		{#if loading}
			<Icon icon="svg-spinners:ring-resize" class="mr-2" />
			Sending code...
		{:else}
			Continue
		{/if}
	</UiButton>
</form>
