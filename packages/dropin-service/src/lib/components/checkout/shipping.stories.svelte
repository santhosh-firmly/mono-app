<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import Shipping from './shipping.svelte';
	import ShippingEmail from './shipping-email.svelte';
	import ShippingAddress from './shipping-address.svelte';
	import ShippingMethods from './shipping-methods.svelte';
	import ShippingAddressCollapsed from './shipping-address-collapsed.svelte';
	import CollapsedSection from './collapsed-section.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';
	import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

	const { Story } = defineMeta({
		title: 'Checkout/Shipping',
		component: Shipping,
		parameters: {
			layout: 'centered'
		}
	});

	// Mock data
	const mockFilledAddress = {
		first_name: 'John',
		last_name: 'Smith',
		address1: '123 Main Street',
		address2: 'Apt 4B',
		city: 'Seattle',
		state_or_province: 'WA',
		postal_code: '98101',
		phone: '2065550123',
		email: 'john.smith@example.com'
	};

	const mockSavedAddresses = [
		{
			id: 1,
			first_name: 'John',
			last_name: 'Smith',
			phone: '2065550123',
			address1: '123 Main Street',
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98101',
			email: 'john.smith@example.com'
		},
		{
			id: 2,
			first_name: 'Sarah',
			last_name: 'Johnson',
			phone: '5035551234',
			address1: '456 Park Avenue',
			city: 'Portland',
			state_or_province: 'OR',
			postal_code: '97201',
			email: 'sarah.j@example.com'
		}
	];

	const mockShippingMethods = [
		{ sku: 'standard', description: 'Standard Shipping (5-7 days)', price: { value: 5.99 } },
		{ sku: 'express', description: 'Express Shipping (2-3 days)', price: { value: 12.99 } },
		{ sku: 'overnight', description: 'Overnight Shipping', price: { value: 24.99 } }
	];
</script>

<script>
	function createEmptyForm() {
		return useCheckoutForm({});
	}

	function createFilledForm() {
		return useCheckoutForm({ ...mockFilledAddress, email: 'john.smith@example.com' });
	}
</script>

<!-- Empty Form - Autocomplete mode (closed fields) -->
{#snippet emptyTemplate(args)}
	{@const form = createEmptyForm()}
	<div class="w-96 p-4">
		<Shipping {...args}>
			{#snippet email()}
				<ShippingEmail {form} />
			{/snippet}
			{#snippet address()}
				<ShippingAddress mode="form" {form} />
			{/snippet}
			{#snippet methods()}
				<ShippingMethods shippingMethods={[]} />
			{/snippet}
		</Shipping>
	</div>
{/snippet}

<Story name="Empty Form" template={emptyTemplate} />

<!-- Filled - Methods Loading -->
{#snippet filledLoadingTemplate(args)}
	{@const form = createFilledForm()}
	<div class="w-96 p-4">
		<Shipping {...args}>
			{#snippet email()}
				<ShippingEmail {form} />
			{/snippet}
			{#snippet address()}
				<ShippingAddress mode="form" {form} forceManualMode={true} />
			{/snippet}
			{#snippet methods()}
				<ShippingMethods shippingMethods={[]} isLoading={true} />
			{/snippet}
		</Shipping>
	</div>
{/snippet}

<Story name="Filled - Methods Loading" template={filledLoadingTemplate} />

<!-- Filled - With Methods -->
{#snippet filledWithMethodsTemplate(args)}
	{@const form = createFilledForm()}
	<div class="w-96 p-4">
		<Shipping {...args}>
			{#snippet email()}
				<ShippingEmail {form} />
			{/snippet}
			{#snippet address()}
				<ShippingAddress mode="form" {form} forceManualMode={true} />
			{/snippet}
			{#snippet methods()}
				<ShippingMethods
					shippingMethods={mockShippingMethods}
					selectedShippingMethod="standard"
					onSelect={fn()}
				/>
			{/snippet}
		</Shipping>
	</div>
{/snippet}

<Story name="Filled - With Methods" template={filledWithMethodsTemplate} />

<!-- List Mode (email is in the list, no email form) -->
{#snippet listModeTemplate(args)}
	<div class="w-96 p-4">
		<Shipping {...args}>
			{#snippet address()}
				<ShippingAddress
					mode="list"
					savedAddresses={mockSavedAddresses}
					selectedAddress={mockSavedAddresses[0]}
					onSelectSavedAddress={fn()}
					onAddNewAddress={fn()}
				/>
			{/snippet}
			{#snippet methods()}
				<ShippingMethods
					shippingMethods={mockShippingMethods}
					selectedShippingMethod="express"
					onSelect={fn()}
				/>
			{/snippet}
		</Shipping>
	</div>
{/snippet}

<Story name="List Mode" template={listModeTemplate} />

<!-- Collapsed Mode (no email form, address already filled) -->
{#snippet collapsedTemplate(args)}
	<div class="w-96 p-4">
		<Shipping {...args}>
			{#snippet address()}
				<ShippingAddress
					mode="collapsed"
					selectedAddress={mockFilledAddress}
					showEmail={true}
					onExpand={fn()}
				/>
			{/snippet}
			{#snippet methods()}
				<ShippingMethods
					shippingMethods={mockShippingMethods}
					selectedShippingMethod="standard"
					onSelect={fn()}
				/>
			{/snippet}
		</Shipping>
	</div>
{/snippet}

<Story name="Collapsed" template={collapsedTemplate} />

<!-- Full Collapsed (grouped: address with email + method in one group) -->
{#snippet fullCollapsedTemplate()}
	<div class="w-96 p-4">
		<UiGroup>
			<!-- Address Section with Email -->
			<CollapsedSection onchange={fn()} grouped>
				<ShippingAddressCollapsed address={mockFilledAddress} showEmail={true} />
			</CollapsedSection>
			<!-- Method Section -->
			<CollapsedSection onchange={fn()} grouped>
				<div class="flex w-full items-center justify-between text-sm">
					<span class="font-bold">{mockShippingMethods[0].description}</span>
					<span class="font-bold">${mockShippingMethods[0].price.value}</span>
				</div>
			</CollapsedSection>
		</UiGroup>
	</div>
{/snippet}

<Story name="Full Collapsed (Grouped)" template={fullCollapsedTemplate} />
