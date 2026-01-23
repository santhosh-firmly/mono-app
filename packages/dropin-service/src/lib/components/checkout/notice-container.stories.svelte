<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import NoticeContainer from './notice-container.svelte';

	const mockNotices = [
		{
			id: '1',
			type: 'info',
			message: 'Item removed from cart',
			actionLabel: 'Undo',
			onAction: fn(),
			duration: 0
		},
		{
			id: '2',
			type: 'success',
			message: 'Promo code applied!',
			duration: 0
		}
	];

	const { Story } = defineMeta({
		title: 'Work in Progress/Notices/Container',
		component: NoticeContainer,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			notices: [],
			onDismiss: fn(),
			position: 'top-right'
		}
	});
</script>

{#snippet template(args)}
	<div class="relative h-96 w-full bg-gray-100">
		<NoticeContainer {...args} />
	</div>
{/snippet}

<Story name="Empty" {template} />

<Story name="Single Notice" args={{ notices: [mockNotices[0]] }} {template} />

<Story name="Multiple Notices" args={{ notices: mockNotices }} {template} />

<Story name="Top Left" args={{ notices: mockNotices, position: 'top-left' }} {template} />

<Story name="Bottom Right" args={{ notices: mockNotices, position: 'bottom-right' }} {template} />

<Story name="Top Center" args={{ notices: mockNotices, position: 'top-center' }} {template} />

<Story
	name="Mixed Types"
	args={{
		notices: [
			{ id: '1', type: 'success', message: 'Order placed!', duration: 0 },
			{ id: '2', type: 'warning', message: 'Shipping delayed', duration: 0 },
			{ id: '3', type: 'error', message: 'Payment failed', actionLabel: 'Retry', duration: 0 }
		]
	}}
	{template}
/>
