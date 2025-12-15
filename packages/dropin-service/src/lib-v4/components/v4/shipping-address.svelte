<script>
	// @ts-nocheck
	import { createEventDispatcher } from 'svelte';
	import { NEW_SHIPPING_ADDRESS } from '$lib-v4/constants.js';
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
		<div class="col-span-2 flex flex-col rounded-lg">
			{#each savedAddresses as address, index (index)}
				<div class="border-0 border-b-2 border-[#e5e7eb] px-3 py-3">
					<label>
						<span class="text-fy-on-surface text-sm font-semibold">
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
							<span class="sensitive-data pl-1">
								{getInfoDisplay(headerDisplay, address)}
							</span>
						</span>
						<div class="flex">
							<span
								class="sensitive-data text-fy-on-primary-subtle pl-6 text-sm font-normal"
							>
								{getShippingAddress(address)}
								{#if address?.phone}
									<span class="text-fy-on-primary-subtle text-sm font-bold">
										·
									</span>
									<span
										class="text-fy-on-primary-subtle text-sm font-normal whitespace-nowrap"
									>
										{address.phone}
									</span>
								{/if}
							</span>
						</div>
					</label>
				</div>
			{/each}
			<label class="flex items-center px-3 py-3">
				<input
					name="address"
					class="text-fy-action disabled:text-fy-on-primary-subtle mr-2"
					type="radio"
					value={NEW_SHIPPING_ADDRESS}
					bind:group={selectedShippingAddress}
					on:change={handleRadioClick}
					{disabled}
				/>
				<div class="flex w-full items-center gap-2">
					<span class="text-fy-on-surface text-sm font-bold">Add New Address</span>
				</div>
			</label>
		</div>
	{:else}
		{@const mockEntries = [0, 1]}
		<div class="col-span-2 flex flex-col rounded-lg">
			{#each mockEntries as index}
				<div
					class="border-0 border-b-2 border-[#e5e7eb] px-5 py-4"
					class:border-none={isLast(mockEntries, index)}
				>
					<label>
						<span class="block font-bold">
							<div
								class="bg-fy-on-primary-subtle my-2 h-3 w-1/2 animate-pulse rounded"
							></div>
						</span>

						<div class="grow">
							<span class="block text-sm">
								<div class="flex items-center">
									<input
										name="addresses"
										disabled={true}
										class="text-fy-on-primary-subtle bg-fy-on-primary-subtle mr-2 animate-pulse border-0"
										type="radio"
										checked={false}
									/>
									<div
										class="bg-fy-on-primary-subtle my-2 h-3 w-full animate-pulse rounded"
									></div>
								</div>
							</span>
						</div>
					</label>
				</div>
			{/each}
		</div>
	{/if}
</Group>
