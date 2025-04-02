<script>
	import CardImage from './card-image.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import { http } from 'msw';
	import './theme.css';
</script>

<Meta title="Checkout V4/Header/Card Image" component={CardImage} tags={['autodocs']} />

<Template let:args>
	<CardImage {...args} />
</Template>

<Story
	name="Portrait"
	args={{
		src: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'
	}}
/>
<Story
	name="Square"
	args={{
		src: 'https://picsum.photos/id/96/600/600'
	}}
/>
<Story
	name="Loading"
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
		src: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg'
	}}
/>
<Story
	name="Error"
	args={{
		src: 'invalid-url'
	}}
/>
