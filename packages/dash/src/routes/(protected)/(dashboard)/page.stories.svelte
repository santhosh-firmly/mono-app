<script module>
	import data from '$lib/assets/dashboard-data.json';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Dashboard from './+page.svelte';

	const { Story } = defineMeta({
		title: 'Routes/Dashboard',
		component: Dashboard,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			data
		}
	});
</script>

{#snippet template(args)}
	<Dashboard {...args} />
{/snippet}

<Story name="Default" children={template} />
