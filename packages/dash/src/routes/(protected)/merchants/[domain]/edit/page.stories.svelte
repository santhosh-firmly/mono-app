<script module>
	import data from '$lib/assets/merchants-data.json';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import MerchantEdit from './+page.svelte';

	const { Story } = defineMeta({
		title: 'Routes/Merchants/Edit',
		component: MerchantEdit,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default">
	<MerchantEdit
		data={{
			merchant: data.merchants[Math.floor(Math.random() * data.merchants.length)],
			platformOptions: data.columns.platform_id.map((value) => ({ label: value, value })),
			pspOptions: data.columns.psp.map((value) => ({ label: value, value }))
		}}
	/>
</Story>
