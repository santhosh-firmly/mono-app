<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Skeleton from './skeleton.svelte';

	const { Story } = defineMeta({
		title: 'UI/Skeleton',
		component: Skeleton,
		parameters: {
			layout: 'centered'
		},
		args: {
			variant: 'text',
			width: '',
			height: '',
			animate: true
		}
	});
</script>

{#snippet template(args)}
	<div class="w-64">
		<Skeleton {...args} />
	</div>
{/snippet}

<Story name="Text" {template} />

<Story name="Text Multiple Lines">
	{#snippet template()}
		<div class="flex w-64 flex-col gap-2">
			<Skeleton variant="text" width="100%" />
			<Skeleton variant="text" width="80%" />
			<Skeleton variant="text" width="60%" />
		</div>
	{/snippet}
</Story>

<Story name="Circle" args={{ variant: 'circle', width: '48px' }} {template} />

<Story name="Rectangle" args={{ variant: 'rect', width: '200px', height: '120px' }} {template} />

<Story name="Button" args={{ variant: 'button', width: '120px' }} {template} />

<Story name="Input" args={{ variant: 'input', width: '100%' }} {template} />

<Story name="Card Loading">
	{#snippet template()}
		<div class="w-72 rounded-lg border border-gray-200 bg-white p-4">
			<div class="flex items-center gap-3">
				<Skeleton variant="circle" width="48px" />
				<div class="flex flex-1 flex-col gap-2">
					<Skeleton variant="text" width="70%" />
					<Skeleton variant="text" width="50%" />
				</div>
			</div>
			<div class="mt-4 flex flex-col gap-2">
				<Skeleton variant="text" width="100%" />
				<Skeleton variant="text" width="100%" />
				<Skeleton variant="text" width="80%" />
			</div>
			<div class="mt-4">
				<Skeleton variant="button" width="100%" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Product Card Loading">
	{#snippet template()}
		<div class="w-48 overflow-hidden rounded-lg border border-gray-200 bg-white">
			<Skeleton variant="rect" width="100%" height="192px" class="rounded-none" />
			<div class="flex flex-col gap-2 p-3">
				<Skeleton variant="text" width="80%" />
				<Skeleton variant="text" width="40%" />
				<Skeleton variant="button" width="100%" />
			</div>
		</div>
	{/snippet}
</Story>

<Story name="No Animation" args={{ animate: false }} {template} />
