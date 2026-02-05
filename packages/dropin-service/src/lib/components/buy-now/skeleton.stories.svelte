<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Skeleton from './skeleton.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Skeleton',
		component: Skeleton,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="@container">
		<Skeleton {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Mobile View" parameters={{ viewport: { defaultViewport: 'mobile2' } }} {template} />
