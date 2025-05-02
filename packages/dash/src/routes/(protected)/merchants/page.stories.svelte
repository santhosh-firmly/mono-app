<script module>
	import data from '$lib/assets/merchants-data.json';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Merchants from './+page.svelte';

	const { Story } = defineMeta({
		title: 'Routes/Merchants',
		component: Merchants,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			data
		}
	});
</script>

{#snippet template(args)}
	<Merchants {...args} />
{/snippet}

<Story name="List" children={template} />
