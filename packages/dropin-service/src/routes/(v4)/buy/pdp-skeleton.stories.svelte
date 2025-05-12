<script>
	// @ts-nocheck
	import PDPSkeleton from './pdp-skeleton.svelte';
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import '$lib-v4/components/v4/theme.css';
</script>

<Meta
	title="Checkout V4/Common/PDP Skeleton"
	component={PDPSkeleton}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Story
	name="Default"
	parameters={{
		viewport: {
			defaultViewport: 'full'
		}
	}}
>
	<div class="@container">
		<PDPSkeleton />
	</div>
</Story>

<Story
	name="Mobile view"
	parameters={{
		viewport: {
			defaultViewport: 'mobile2'
		}
	}}
>
	<div class="@container">
		<PDPSkeleton />
	</div>
</Story>
