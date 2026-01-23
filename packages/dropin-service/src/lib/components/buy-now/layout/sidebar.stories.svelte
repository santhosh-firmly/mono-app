<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import SidebarLayout from './sidebar.svelte';

	const { Story } = defineMeta({
		title: 'BuyNow/Sidebar Layout',
		component: SidebarLayout,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			onClose: fn()
		}
	});
</script>

{#snippet template(args)}
	<SidebarLayout {...args}>
		<div class="flex flex-col gap-4 p-6">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">Your Cart</h2>
				<button class="text-gray-500 hover:text-gray-700">Close</button>
			</div>
			<p class="text-sm text-gray-600">
				This content appears in a sidebar that slides in from the right.
			</p>
			<div class="flex flex-col gap-4">
				<div class="flex gap-4 rounded border p-3">
					<div class="size-16 rounded bg-gray-200"></div>
					<div class="flex flex-1 flex-col gap-1">
						<div class="h-4 w-32 rounded bg-gray-200"></div>
						<div class="h-3 w-20 rounded bg-gray-100"></div>
						<div class="h-4 w-16 rounded bg-gray-200"></div>
					</div>
				</div>
				<div class="flex gap-4 rounded border p-3">
					<div class="size-16 rounded bg-gray-200"></div>
					<div class="flex flex-1 flex-col gap-1">
						<div class="h-4 w-32 rounded bg-gray-200"></div>
						<div class="h-3 w-20 rounded bg-gray-100"></div>
						<div class="h-4 w-16 rounded bg-gray-200"></div>
					</div>
				</div>
			</div>
			<div class="mt-auto border-t pt-4">
				<button class="w-full rounded bg-blue-600 px-4 py-3 font-medium text-white">
					Checkout
				</button>
			</div>
		</div>
	</SidebarLayout>
{/snippet}

<Story name="Default" {template} />
