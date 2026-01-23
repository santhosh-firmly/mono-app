<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import NoticeItem from './notice-item.svelte';

	const { Story } = defineMeta({
		title: 'Work in Progress/Notices/Item',
		component: NoticeItem,
		parameters: {
			layout: 'centered'
		},
		args: {
			id: 'notice-1',
			type: 'info',
			message: 'This is an informational message',
			actionLabel: '',
			onAction: fn(),
			onDismiss: fn(),
			duration: 0
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80">
		<NoticeItem {...args} />
	</div>
{/snippet}

<Story name="Info" {template} />

<Story
	name="Success"
	args={{ type: 'success', message: 'Item added to cart successfully!' }}
	{template}
/>

<Story name="Warning" args={{ type: 'warning', message: 'Stock is running low' }} {template} />

<Story name="Error" args={{ type: 'error', message: 'Failed to process payment' }} {template} />

<Story
	name="With Undo Action"
	args={{
		type: 'info',
		message: 'Item removed from cart',
		actionLabel: 'Undo'
	}}
	{template}
/>

<Story
	name="Success With Action"
	args={{
		type: 'success',
		message: 'Promo code applied',
		actionLabel: 'Remove'
	}}
	{template}
/>
