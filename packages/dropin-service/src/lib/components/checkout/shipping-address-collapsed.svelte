<script>
	/**
	 * Shipping Address Collapsed
	 * Displays a compact view of a shipping address with formatted display
	 */
	import { phoneMask } from '$lib/utils/masks';

	/**
	 * @typedef {Object} Address
	 * @property {string} first_name
	 * @property {string} last_name
	 * @property {string} address1
	 * @property {string} [address2]
	 * @property {string} city
	 * @property {string} state_or_province
	 * @property {string} postal_code
	 * @property {string} [phone]
	 * @property {string} [email]
	 */

	/**
	 * @type {{
	 *   address: Address,
	 *   showEmail?: boolean,
	 *   class?: string
	 * }}
	 */
	let { address, showEmail = false, class: className = '' } = $props();

	let fullName = $derived([address?.first_name, address?.last_name].filter(Boolean).join(' '));

	let addressLine = $derived(
		[
			address?.address1,
			address?.address2,
			address?.city,
			address?.state_or_province,
			address?.postal_code
		]
			.filter(Boolean)
			.join(' · ')
	);

	let phoneFormatted = $derived(address?.phone ? phoneMask(address.phone) : '');
</script>

<div class={['flex flex-col gap-1', className]}>
	{#if showEmail && address?.email}
		<p class="text-sm font-bold">{address.email}</p>
		<hr class="my-1" />
	{/if}
	<p class="text-sm font-medium">{fullName}</p>
	<p class="text-muted text-sm">{addressLine}</p>
	{#if phoneFormatted}
		<p class="text-muted text-sm">{phoneFormatted}</p>
	{/if}
</div>
