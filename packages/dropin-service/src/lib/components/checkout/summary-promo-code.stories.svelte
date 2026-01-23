<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import SummaryPromoCode from './summary-promo-code.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Promo Code',
		component: SummaryPromoCode,
		parameters: {
			layout: 'centered'
		},
		args: {
			promocodes: [],
			promocode: '',
			isSubmitting: false,
			isRemovingAll: false,
			onSubmit: fn(),
			onRemoveAll: fn()
		},
		argTypes: {
			promocodes: {
				control: 'object',
				description: 'Array of applied promo codes'
			},
			promocode: {
				control: 'text',
				description: 'Current promo code input'
			},
			isSubmitting: {
				control: 'boolean',
				description: 'Whether promo code is being submitted'
			},
			isRemovingAll: {
				control: 'boolean',
				description: 'Whether all promo codes are being removed'
			},
			onSubmit: {
				action: 'submitted',
				description: 'Callback when promo code is submitted'
			},
			onRemoveAll: {
				action: 'removed all',
				description: 'Callback when all promo codes are removed'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="w-72">
		<SummaryPromoCode {...args} />
	</div>
{/snippet}

<!-- Default (No Codes) -->
<Story name="Default" {template} />

<!-- With Applied Codes -->
<Story name="With Applied Codes" args={{ promocodes: ['SAVE10', 'FREESHIP'] }} {template} />

<!-- Submitting -->
<Story name="Submitting" args={{ promocode: 'NEWSALE', isSubmitting: true }} {template} />

<!-- Removing All -->
<Story
	name="Removing All"
	args={{ promocodes: ['SAVE10', 'FREESHIP'], isRemovingAll: true }}
	{template}
/>
