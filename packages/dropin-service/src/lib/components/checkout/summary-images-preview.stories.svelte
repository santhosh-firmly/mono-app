<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SummaryImagesPreview from './summary-images-preview.svelte';
	import SummaryPrice from './summary-price.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Images Preview',
		component: SummaryImagesPreview,
		parameters: {
			layout: 'centered'
		},
		args: {
			images: ['https://cdn.shopify.com/s/files/1/1338/1013/files/placeholder.jpg']
		},
		argTypes: {
			images: {
				control: 'object',
				description:
					'Array of image URLs to display (shows stacked view for multiple images)'
			},
			maxImages: {
				control: { type: 'number', min: 1, max: 5 },
				description: 'Maximum number of images to show in stack'
			},
			class: {
				control: 'text',
				description: 'Additional CSS classes'
			}
		}
	});
</script>

{#snippet template(args)}
	<SummaryImagesPreview {...args}>
		<SummaryPrice
			totalPrice={args.totalPrice || 29.99}
			itemsQuantity={args.itemsQuantity || 1}
		/>
	</SummaryImagesPreview>
{/snippet}

<!-- Single Image -->
<Story
	name="Single Image"
	args={{
		images: ['https://cdn.shopify.com/s/files/1/1338/1013/files/placeholder.jpg'],
		totalPrice: 29.99,
		itemsQuantity: 1
	}}
	{template}
/>

<!-- Two Images Stacked -->
<Story
	name="Two Images Stacked"
	args={{
		images: [
			'https://via.placeholder.com/128/FF6B6B/FFFFFF?text=1',
			'https://via.placeholder.com/128/4ECDC4/FFFFFF?text=2'
		],
		totalPrice: 59.98,
		itemsQuantity: 2
	}}
	{template}
/>

<!-- Three Images Stacked -->
<Story
	name="Three Images Stacked"
	args={{
		images: [
			'https://via.placeholder.com/128/FF6B6B/FFFFFF?text=1',
			'https://via.placeholder.com/128/4ECDC4/FFFFFF?text=2',
			'https://via.placeholder.com/128/45B7D1/FFFFFF?text=3'
		],
		totalPrice: 89.97,
		itemsQuantity: 3
	}}
	{template}
/>

<!-- Many Items (shows max 3) -->
<Story
	name="Many Items (77 items)"
	args={{
		images: [
			'https://via.placeholder.com/128/FF6B6B/FFFFFF?text=1',
			'https://via.placeholder.com/128/4ECDC4/FFFFFF?text=2',
			'https://via.placeholder.com/128/45B7D1/FFFFFF?text=3',
			'https://via.placeholder.com/128/96CEB4/FFFFFF?text=4',
			'https://via.placeholder.com/128/FFEAA7/FFFFFF?text=5'
		],
		totalPrice: 4765.9,
		itemsQuantity: 77
	}}
	{template}
/>
