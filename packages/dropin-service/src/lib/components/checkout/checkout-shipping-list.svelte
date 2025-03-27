<script>
	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiRadio from '$lib/components/ui/ui-radio.svelte';
	import { phoneMask } from '$lib/utils/masks';
	import Icon from '@iconify/svelte';

	/**
	 * @typedef {Object} Address
	 * @property {string} email - The email address of the address
	 * @property {string} first_name - The first name of the address
	 * @property {string} last_name - The last name of the address
	 * @property {string} address1 - The first line of the address
	 * @property {string} address2 - The second line of the address
	 * @property {string} city - The city of the address
	 * @property {string} state_or_province - The state or province of the address
	 * @property {string} postal_code - The postal code of the address
	 * @property {string} phone - The phone number of the address
	 */

	/**
	 * @typedef {Object} CheckoutShippingListProps
	 * @property {Array<Address>} addresses - The list of addresses
	 * @property {boolean} disabled - Whether the shipping list is disabled
	 * @property {Function} onAddNewAddress - The function to call when a new address is added
	 * @property {Function} onSelect - The function to call when an address is selected
	 * @property {Object} selectedAddress - The selected address
	 */

	/**
	 * @type {CheckoutShippingListProps}
	 */
	let { addresses = [], disabled, onAddNewAddress, onSelect, selectedAddress } = $props();

	function isSelected(address) {
		return JSON.stringify(selectedAddress) === JSON.stringify(address);
	}
</script>

<UiGroup>
	{#each addresses as address, index (index)}
		<div class="p-4">
			<UiRadio
				id={index}
				name="shipping-address"
				{disabled}
				onSelect={() => onSelect(address)}
				isSelected={isSelected(address)}
			>
				<div class="ml-2 flex flex-col">
					<p class="font-bold">{address.email}</p>
					<p class="text-muted text-sm">
						{address.first_name}
						{address.last_name} · {address.address1}
						{address.address2 ? ' ' + address.address2 : ''} · {address.city}
						· {address.state_or_province}
						· {address.postal_code}
						· {phoneMask(address.phone)}
					</p>
				</div>
			</UiRadio>
		</div>
	{/each}

	<button
		{disabled}
		onclick={onAddNewAddress}
		class="flex cursor-pointer items-center justify-center gap-2 p-4 text-sm font-bold {disabled
			? 'text-muted cursor-not-allowed'
			: ''}"
	>
		<Icon icon="mdi:plus" />
		Add new address
	</button>
</UiGroup>
