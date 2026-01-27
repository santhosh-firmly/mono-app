<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiImage from '$lib/components/ui/image.svelte';

	const { Story } = defineMeta({
		title: 'UI/Image',
		component: UiImage,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			src: 'https://via.placeholder.com/150',
			alt: 'Product image',
			title: 'Product',
			width: 80,
			height: 80
		},
		argTypes: {
			src: {
				control: 'text',
				description: 'Image source URL'
			},
			alt: {
				control: 'text',
				description: 'Alternative text for the image'
			},
			title: {
				control: 'text',
				description: 'Image title'
			},
			width: {
				control: 'number',
				description: 'Image width in pixels'
			},
			height: {
				control: 'number',
				description: 'Image height in pixels'
			}
		}
	});
</script>

<!-- Default Image -->
<Story name="Default" />

<!-- Large Image -->
<Story
	name="Large"
	args={{
		width: 150,
		height: 150,
		src: 'https://via.placeholder.com/300'
	}}
/>

<!-- Broken Image (Fallback) -->
<Story
	name="Broken Image"
	args={{
		src: 'https://invalid-url-that-will-fail.com/image.jpg',
		alt: 'Broken image'
	}}
/>
