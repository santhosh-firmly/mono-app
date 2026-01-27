<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Layout from './layout.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Layout',
		component: Layout,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template()}
	<Layout>
		{#snippet asection()}
			<div class="flex flex-col gap-4 p-4">
				<div class="h-8 w-32 rounded bg-gray-200"></div>
				<div class="flex flex-col gap-2">
					<div class="h-4 w-20 rounded bg-gray-200"></div>
					<div class="h-6 w-24 rounded bg-gray-200"></div>
				</div>
				<div class="flex gap-4">
					<div class="size-20 rounded bg-gray-200"></div>
					<div class="flex flex-col gap-2">
						<div class="h-4 w-32 rounded bg-gray-200"></div>
						<div class="h-4 w-20 rounded bg-gray-200"></div>
					</div>
				</div>
			</div>
		{/snippet}
		{#snippet bsection()}
			<div class="flex flex-col gap-4 p-4">
				<h2 class="text-lg font-semibold">Checkout Form</h2>
				<div class="flex flex-col gap-3">
					<div class="h-10 w-full rounded bg-gray-200"></div>
					<div class="h-10 w-full rounded bg-gray-200"></div>
					<div class="h-10 w-full rounded bg-gray-200"></div>
				</div>
				<button class="h-12 w-full rounded bg-blue-600 text-white">Place Order</button>
			</div>
		{/snippet}
	</Layout>
{/snippet}

{#snippet loadingTemplate()}
	<Layout isLoading={true}>
		{#snippet asection()}
			<div></div>
		{/snippet}
		{#snippet bsection()}
			<div></div>
		{/snippet}
	</Layout>
{/snippet}

<Story name="Default" {template} />

<Story name="Loading" template={loadingTemplate} />
