<script>
	import Overview from './overview.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.scss';

	const smallLogo =
		'data:image/png;base64,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';
</script>

<Meta
	title="Checkout V4/Header/Overview"
	component={Overview}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Template let:args>
	<div class="adoreme-light">
		<div
			class="absolute w-full top-0 left-0 h-[2000px] bg-gray-300 text-center flex flex-col justify-center"
		>
			Space to scroll
		</div>
		<Overview
			{...args}
			merchantInfo={{ displayName: 'Long Merchant Name', smallLogo }}
			on:back-click
		/>
	</div>
</Template>

<Story
	name="Single Product"
	args={{
		total: {
			currency: 'USD',
			value: 1385.9
		},
		quantity: 1,
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Multiple Products"
	args={{
		total: {
			currency: 'USD',
			value: 1385.9
		},
		quantity: 2,
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Zero dollar cart"
	args={{
		total: {
			currency: 'USD',
			value: 0
		},
		quantity: 1,
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story name="Skeleton">
	<Overview on:back-click />
</Story>
