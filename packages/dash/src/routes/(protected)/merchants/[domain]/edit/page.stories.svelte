<script module>
	import data from '$lib/assets/merchants-data.json';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import MerchantEdit from './+page.svelte';

	const { Story } = defineMeta({
		title: 'Routes/Merchants/Edit',
		component: MerchantEdit,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			data: {
				merchant: {
					...data.merchants[Math.floor(Math.random() * data.merchants.length)],
					presentation: {}
				},
				platformOptions: data.columns.platform_id.map((value) => ({ label: value, value })),
				pspOptions: data.columns.psp.map((value) => ({ label: value, value }))
			}
		}
	});
</script>

{#snippet template(args)}
	<MerchantEdit {...args} />
{/snippet}

<Story name="Edit" children={template} />
