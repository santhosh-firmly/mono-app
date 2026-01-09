<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DebugPopover from './debug-popover.svelte';

	const { Story } = defineMeta({
		title: 'Dev Tools/Debug Popover',
		component: DebugPopover,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<DebugPopover {...args} />
{/snippet}

<Story
	name="Simple Object"
	args={{
		objToDebug: {
			id: '12345',
			status: 'active',
			count: 42
		}
	}}
	{template}
/>

<Story
	name="User Object"
	args={{
		objToDebug: {
			userId: 'usr_abc123',
			email: 'test@example.com',
			role: 'admin',
			verified: true,
			loginCount: 15
		}
	}}
	{template}
/>

<Story
	name="Order Object"
	args={{
		objToDebug: {
			orderId: 'ord_xyz789',
			total: '$125.00',
			items: 3,
			status: 'shipped',
			createdAt: '2024-01-15'
		}
	}}
	{template}
/>

<Story name="Inline Example">
	{#snippet template()}
		<div class="flex items-center gap-2">
			<span class="text-sm">Order #12345</span>
			<DebugPopover
				objToDebug={{
					orderId: '12345',
					status: 'completed',
					amount: '$99.99',
					customer: 'john@example.com'
				}}
			/>
		</div>
	{/snippet}
</Story>
