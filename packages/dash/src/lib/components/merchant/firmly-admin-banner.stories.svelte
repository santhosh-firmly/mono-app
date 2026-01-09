<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FirmlyAdminBanner from './firmly-admin-banner.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/UI/Admin Banner',
		component: FirmlyAdminBanner,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<FirmlyAdminBanner {...args} />
{/snippet}

<Story name="Default" args={{}} {template} />

<Story name="With Page Content">
	{#snippet template()}
		<div>
			<FirmlyAdminBanner />
			<div class="p-8">
				<h1 class="text-2xl font-bold">Merchant Dashboard</h1>
				<p class="mt-2 text-muted-foreground">
					This is a preview of the merchant dashboard as seen by Firmly administrators.
				</p>
			</div>
		</div>
	{/snippet}
</Story>
