<script>
	// @ts-nocheck

	import CardStack from './card-stack.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
	import { http } from 'msw';
</script>

<Meta
	title="Checkout V4/Header/Card Stack"
	component={CardStack}
	tags={['autodocs']}
	argTypes={{
		horizontalOffsetPx: {
			name: 'Horizontal Offset',
			control: {
				type: 'range',
				min: 1,
				max: 100,
				step: 1
			}
		},
		verticalOffsetPx: {
			name: 'Vertical Offset',
			control: {
				type: 'range',
				min: 1,
				max: 100,
				step: 1
			}
		}
	}}
/>

<Template let:args>
	<CardStack {...args} />
</Template>

<Story
	name="Single Product"
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Multiple Products"
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Many Products"
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrqxs2_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Single Product (Square)"
	args={{
		images: ['https://picsum.photos/id/96/600/600']
	}}
/>
<Story
	name="Multiple Products (Square)"
	args={{
		images: ['https://picsum.photos/id/96/600/600', 'https://picsum.photos/id/111/600/600']
	}}
/>
<Story
	name="Many Products (Square)"
	args={{
		images: [
			'https://picsum.photos/id/96/600/600',
			'https://picsum.photos/id/111/600/600',
			'https://picsum.photos/id/237/600/600'
		]
	}}
/>
<Story
	name="Multiple Products (Mix)"
	args={{
		images: [
			'https://picsum.photos/id/96/600/600',
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story
	name="Multiple Products (alt)"
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'https://picsum.photos/id/96/600/600'
		]
	}}
/>
<Story
	name="Single Product Loading"
	parameters={{
		msw: {
			handlers: [
				http.get('*.jpeg', async (req, res, ctx) => {
					return res(ctx.delay(1000 * 60 * 60 * 60), ctx.status(404));
				})
			]
		}
	}}
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg'
		]
	}}
/>
<Story
	name="Multiple Product Loading"
	parameters={{
		msw: {
			handlers: [
				http.get('*.jpeg', async (req, res, ctx) => {
					return res(ctx.delay(1000 * 60 * 60 * 60), ctx.status(404));
				})
			]
		}
	}}
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full2.jpeg',
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg'
		]
	}}
/>
<Story
	name="Single Product Error"
	args={{
		images: ['invalid-url']
	}}
/>
<Story
	name="Multiple Product Error"
	args={{
		images: ['invalid-url', 'invalid-url2']
	}}
/>
<Story
	name="Partial Error"
	args={{
		images: [
			'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
			'invalid-url',
			'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrqxs2_cinthia-black/full.jpeg?format=webp'
		]
	}}
/>
<Story name="Skeleton" />
