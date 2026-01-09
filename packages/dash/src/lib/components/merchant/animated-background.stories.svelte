<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AnimatedBackground from './animated-background.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Branding/Animated Background',
		component: AnimatedBackground,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			background: {
				control: 'select',
				options: [
					'starry-night',
					'sliding-diagonals',
					'rainbow-lines',
					'rainbow-gradient',
					'modern-gradient',
					'bokeh-dots'
				]
			},
			layout: {
				control: 'select',
				options: ['full', 'split', 'diagonal']
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="relative h-screen w-full">
		<AnimatedBackground {...args} />
		<div class="relative z-10 flex h-full items-center justify-center">
			<div class="rounded-lg bg-white/90 p-8 text-center shadow-xl backdrop-blur-sm">
				<h1 class="text-2xl font-bold text-gray-900">Content Over Background</h1>
				<p class="mt-2 text-gray-600">
					Background: {args.background}, Layout: {args.layout}
				</p>
			</div>
		</div>
	</div>
{/snippet}

<Story
	name="Starry Night"
	args={{
		background: 'starry-night',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Modern Gradient"
	args={{
		background: 'modern-gradient',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Bokeh Dots"
	args={{
		background: 'bokeh-dots',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Rainbow Lines"
	args={{
		background: 'rainbow-lines',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Rainbow Gradient"
	args={{
		background: 'rainbow-gradient',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Sliding Diagonals"
	args={{
		background: 'sliding-diagonals',
		layout: 'full'
	}}
	{template}
/>

<Story
	name="Split Layout"
	args={{
		background: 'modern-gradient',
		layout: 'split'
	}}
	{template}
/>

<Story
	name="Diagonal Layout"
	args={{
		background: 'starry-night',
		layout: 'diagonal'
	}}
	{template}
/>
