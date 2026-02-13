<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantQuickAccess from './merchant-quick-access.svelte';

	const { Story } = defineMeta({
		title: 'Admin/MerchantQuickAccess',
		component: MerchantQuickAccess,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			merchants: {
				control: 'object',
				description: 'Array of merchant objects with domain property'
			}
		}
	});

	const fewMerchants = [
		{ domain: 'acme-store.com' },
		{ domain: 'widgets-inc.com' },
		{ domain: 'gadgets-world.com' }
	];

	const manyMerchants = [
		{ domain: 'acme-store.com' },
		{ domain: 'widgets-inc.com' },
		{ domain: 'gadgets-world.com' },
		{ domain: 'tech-emporium.com' },
		{ domain: 'fashion-hub.com' },
		{ domain: 'home-goods.com' },
		{ domain: 'outdoor-gear.com' },
		{ domain: 'pet-supplies.com' },
		{ domain: 'beauty-zone.com' },
		{ domain: 'sports-central.com' },
		{ domain: 'electronics-plus.com' },
		{ domain: 'kitchen-world.com' },
		{ domain: 'office-depot.com' },
		{ domain: 'toy-land.com' },
		{ domain: 'book-haven.com' }
	];
</script>

{#snippet template(args)}
	<div class="p-4">
		<MerchantQuickAccess {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ merchants: fewMerchants }} {template} />

<Story name="Empty" args={{ merchants: [] }} {template} />

<Story name="Many Merchants" args={{ merchants: manyMerchants }} {template} />

<Story name="Single Merchant" args={{ merchants: [{ domain: 'single-store.com' }] }} {template} />
