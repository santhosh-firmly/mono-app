<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import PromoCode from './promo-code.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Promo Code',
		component: PromoCode,
		parameters: {
			layout: 'centered'
		},
		args: {
			appliedCodes: [],
			onApply: fn(),
			onRemove: fn(),
			isLoading: false,
			error: ''
		},
		argTypes: {
			appliedCodes: {
				control: 'object',
				description: 'List of applied promo codes'
			},
			onApply: {
				action: 'applied',
				description: 'Apply callback'
			},
			onRemove: {
				action: 'removed',
				description: 'Remove callback'
			},
			isLoading: {
				control: 'boolean',
				description: 'Loading state'
			},
			error: {
				control: 'text',
				description: 'Error message'
			}
		}
	});
</script>

<!-- Default (No Codes) -->
<Story name="Default" />

<!-- With Applied Codes -->
<Story
	name="With Applied Codes"
	args={{
		appliedCodes: ['SAVE10', 'FREESHIP']
	}}
/>

<!-- Loading -->
<Story
	name="Loading"
	args={{
		isLoading: true
	}}
/>

<!-- With Error -->
<Story
	name="With Invalid Code Error"
	args={{
		error: 'Invalid promo code. Please check and try again.'
	}}
/>

<Story
	name="With Expired Code Error"
	args={{
		error: 'This promo code has expired.'
	}}
/>

<Story
	name="With Minimum Purchase Error"
	args={{
		error: 'Minimum purchase of $50 required for this code.'
	}}
/>

<Story
	name="With Already Used Error"
	args={{
		error: 'This promo code has already been used.'
	}}
/>
