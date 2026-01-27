<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import ShippingAddressCollapsed from './shipping-address-collapsed.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Shipping/Address/Collapsed',
		component: ShippingAddressCollapsed,
		parameters: {
			layout: 'centered'
		}
	});

	const mockAddress = {
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

	const mockAddressMinimal = {
		first_name: 'Jane',
		last_name: 'Doe',
		address1: '456 Oak Avenue',
		city: 'Portland',
		state_or_province: 'OR',
		postal_code: '97201'
	};
</script>

{#snippet template(args)}
	<div class="w-80 rounded-lg border p-4">
		<ShippingAddressCollapsed {...args} />
	</div>
{/snippet}

<!-- Default with full address -->
<Story name="Default" args={{ address: mockAddress }} {template} />

<!-- With Email shown -->
<Story name="With Email" args={{ address: mockAddress, showEmail: true }} {template} />

<!-- Minimal address (no phone, no address2) -->
<Story name="Minimal" args={{ address: mockAddressMinimal }} {template} />
