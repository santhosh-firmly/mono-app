<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { NEW_SHIPPING_ADDRESS } from '$lib/constants.js';
	import Group from './group.svelte';

	/**
	 * Header display
	 */
	export let headerDisplay = '';

	/**
	 * Subheader Name
	 */
	export let subheaderName = '';

	/**
	 * User's saved addresses
	 */
	export let savedAddresses = null;

	/**
	 * Currently selected shipping address
	 */
	export let selectedShippingAddress;

	export let disabled;

	const dispatch = createEventDispatcher();

	function getShippingAddress(address) {
		if (address) {
			return `${getInfoDisplay(subheaderName, address)}, ${address.address1} ${
				address.address2 || ''
			}, ${address.city}, ${address.state_or_province} ${address.postal_code}`;
		} else {
			return '';
		}
	}

	function getInfoDisplay(headerDisplay, address) {
		if (headerDisplay === 'name') {
			return `${address?.first_name} ${address?.last_name}` || '';
		} else {
			return `${address.email}`;
		}
	}

	function handleRadioClick() {
		if (selectedShippingAddress) {
			dispatch('set-shipping-info', { selectedShippingAddress });
		}
	}

	function isLast(Addresses, index) {
		return index === Addresses.length - 1;
	}
</script>

<Group>
	{#if savedAddresses}
		<div class="flex flex-col rounded-lg col-span-2">
			{#each savedAddresses as address, index (index)}
				<div class="border-0 border-b-2 px-3 py-3">
					<label>
						<span class="font-semibold text-sm text-fy-on-surface">
							<span>
								<input
									name="address"
									class="text-fy-action disabled:text-fy-on-primary-subtle"
									data-testid="address-radio-{index}"
									type="radio"
									value={address}
									bind:group={selectedShippingAddress}
									on:change={handleRadioClick}
									{disabled}
								/>
							</span>
							<span class="pl-1">
								{getInfoDisplay(headerDisplay, address)}
							</span>
						</span>
						<div class="flex">
							<span class="font-normal text-sm text-fy-on-primary-subtle pl-6">
								{getShippingAddress(address)}
								{#if address?.phone}
									<span class="text-sm font-bold text-fy-on-primary-subtle"> · </span>
									<span class="whitespace-nowrap text-sm font-normal text-fy-on-primary-subtle">
										{address.phone}
									</span>
								{/if}
							</span>
						</div>
					</label>
				</div>
			{/each}
			<label class="flex px-3 py-3 items-center">
				<input
					name="address"
					class="text-fy-action disabled:text-fy-on-primary-subtle mr-2"
					type="radio"
					value={NEW_SHIPPING_ADDRESS}
					bind:group={selectedShippingAddress}
					on:change={handleRadioClick}
					{disabled}
				/>
				<div class="w-full flex gap-2 items-center">
					<span class="text-fy-on-surface text-sm font-bold">Add New Address</span>
				</div>
			</label>
		</div>
	{:else}
		{@const mockEntries = [0, 1]}
		<div class="flex flex-col rounded-lg col-span-2">
			{#each mockEntries as index}
				<div class="border-0 border-b-2 px-5 py-4" class:border-none={isLast(mockEntries, index)}>
					<label>
						<span class="block font-bold">
							<div class="h-3 w-1/2 my-2 bg-fy-on-primary-subtle animate-pulse rounded"></div>
						</span>

						<div class="grow">
							<span class="block text-sm">
								<div class="flex items-center">
									<input
										name="addresses"
										disabled={true}
										class="text-fy-on-primary-subtle bg-fy-on-primary-subtle border-0 animate-pulse mr-2"
										type="radio"
										checked={false}
									/>
									<div class="h-3 w-full my-2 bg-fy-on-primary-subtle animate-pulse rounded"></div>
								</div>
							</span>
						</div>
					</label>
				</div>
			{/each}
		</div>
	{/if}
</Group>
