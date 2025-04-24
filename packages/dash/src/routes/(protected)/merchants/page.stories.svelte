<script module>
	import data from '$lib/assets/merchants-data.json';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Merchants from './+page.svelte';

	const { Story } = defineMeta({
		title: 'Routes/Merchants',
		component: Merchants,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default">
	<Merchants {data} />
</Story>
