<script>
	/**
	 * Shipping Address - Wrapper Component
	 *
	 * Handles the display mode for shipping address:
	 * - 'form': Show address form with autocomplete
	 * - 'list': Show saved addresses for selection
	 * - 'collapsed': Show compact view of filled address
	 */
	import ShippingAddressForm from './shipping-address-form.svelte';
	import ShippingAddressList from './shipping-address-list.svelte';
	import ShippingAddressCollapsed from './shipping-address-collapsed.svelte';
	import CollapsedSection from './collapsed-section.svelte';

	/**
	 * @typedef {'form' | 'list' | 'collapsed'} AddressMode
	 */

	/**
	 * @typedef {Object} ShippingAddressProps
	 * @property {AddressMode} mode - Display mode
	 * @property {Object} form - Form object (required for 'form' mode)
	 * @property {Array} savedAddresses - Saved addresses (for 'list' mode)
	 * @property {Object} selectedAddress - Currently selected/filled address
	 * @property {Array} addressCompletions - Autocomplete suggestions
	 * @property {Object} selectedCompletionAddress - Selected autocomplete address
	 * @property {boolean} isAutocompleteLoading - Whether autocomplete is loading
	 * @property {boolean} forceManualMode - Force manual entry mode
	 * @property {boolean} disabled - Whether the component is disabled
	 * @property {boolean} showEmail - Show email in collapsed view
	 * @property {string} externalError - External error message
	 * @property {Function} onInputAddressCompletion - Callback when user types in address
	 * @property {Function} onSelectAddressCompletion - Callback when autocomplete is selected
	 * @property {Function} onSelectSavedAddress - Callback when saved address is selected
	 * @property {Function} onAddNewAddress - Callback when "add new address" is clicked
	 * @property {Function} onExpand - Callback when "Change" is clicked in collapsed mode
	 */

	/**
	 * @type {ShippingAddressProps}
	 */
	let {
		mode = 'form',
		form = null,
		savedAddresses = [],
		selectedAddress = null,
		addressCompletions = [],
		selectedCompletionAddress = null,
		isAutocompleteLoading = false,
		forceManualMode = false,
		disabled = false,
		showEmail = false,
		externalError = '',
		onInputAddressCompletion = () => {},
		onSelectAddressCompletion = () => {},
		onSelectSavedAddress = () => {},
		onAddNewAddress = () => {},
		onExpand = () => {}
	} = $props();
</script>

{#if mode === 'collapsed' && selectedAddress}
	<CollapsedSection onchange={onExpand}>
		<ShippingAddressCollapsed address={selectedAddress} {showEmail} />
	</CollapsedSection>
{:else if mode === 'list' && savedAddresses.length > 0}
	<ShippingAddressList
		addresses={savedAddresses}
		{selectedAddress}
		{disabled}
		onSelect={onSelectSavedAddress}
		{onAddNewAddress}
	/>
{:else if form}
	<ShippingAddressForm
		{form}
		{selectedCompletionAddress}
		{onInputAddressCompletion}
		{onSelectAddressCompletion}
		{isAutocompleteLoading}
		{addressCompletions}
		{forceManualMode}
		{externalError}
	/>
{/if}
