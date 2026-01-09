<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BrandedProgress from './branded-progress.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/UI/Branded Progress',
		component: BrandedProgress,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<div class="w-64">
		<BrandedProgress value={args.value} color={args.color} />
	</div>
{/snippet}

<Story
	name="Purple - Empty"
	args={{
		value: 0,
		color: 'purple'
	}}
	{template}
/>

<Story
	name="Purple - 25%"
	args={{
		value: 25,
		color: 'purple'
	}}
	{template}
/>

<Story
	name="Purple - 50%"
	args={{
		value: 50,
		color: 'purple'
	}}
	{template}
/>

<Story
	name="Purple - 75%"
	args={{
		value: 75,
		color: 'purple'
	}}
	{template}
/>

<Story
	name="Purple - Full"
	args={{
		value: 100,
		color: 'purple'
	}}
	{template}
/>

<Story
	name="Green - 50%"
	args={{
		value: 50,
		color: 'green'
	}}
	{template}
/>

<Story
	name="Green - Full"
	args={{
		value: 100,
		color: 'green'
	}}
	{template}
/>
