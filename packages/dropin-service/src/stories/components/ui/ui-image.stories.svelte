<script module>
	import UiImage from '$lib/components/ui/ui-image.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import cart from '../assets/cart.json';

	const { Story } = defineMeta({
		title: 'Components/UI/Image',
		component: UiImage,
		parameters: {
			layout: 'centered'
		},
		args: {
			src: cart.line_items[0].image.url,
			alt: cart.line_items[0].title,
			title: cart.line_items[0].title
		}
	});
</script>

<Story name="Default" />
<Story name="Not Found" args={{ src: 'https://via.placeholder.com/150' }} />
<Story name="Custom Size" args={{ src: cart.line_items[0].image.url, width: 128, height: 128 }} />
