<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} ExpressLoginButtonProps
	 * @property {boolean} disabled - Whether the button is disabled
	 * @property {boolean} loading - Whether the button is loading
	 * @property {string} email - Optional email to show (for returning users)
	 * @property {Function} onclick - Called when button is clicked
	 */

	/**
	 * @type {ExpressLoginButtonProps}
	 */
	let { disabled = false, loading = false, email = '', onclick = () => {} } = $props();
</script>

<button
	type="button"
	{disabled}
	{onclick}
	class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:bg-gray-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
>
	{#if loading}
		<Icon icon="svg-spinners:ring-resize" class="text-lg" />
		<span>Signing in...</span>
	{:else}
		<Icon icon="mdi:account-circle-outline" class="text-lg" />
		{#if email}
			<span>Continue as <strong>{email}</strong></span>
		{:else}
			<span>Sign in for faster checkout</span>
		{/if}
	{/if}
</button>
