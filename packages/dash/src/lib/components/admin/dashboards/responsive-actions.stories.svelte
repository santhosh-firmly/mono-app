<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ResponsiveActions from './responsive-actions.svelte';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Mail from 'lucide-svelte/icons/mail';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Edit from 'lucide-svelte/icons/edit';
	import Copy from 'lucide-svelte/icons/copy';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Responsive Actions',
		component: ResponsiveActions,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="flex justify-end">
		<ResponsiveActions {...args} />
	</div>
{/snippet}

<Story
	name="Single Action"
	args={{
		actions: [
			{
				id: 'view',
				icon: ExternalLink,
				label: 'View',
				href: '#',
				target: '_blank'
			}
		]
	}}
	{template}
/>

<Story
	name="Two Actions"
	args={{
		actions: [
			{
				id: 'view',
				icon: ExternalLink,
				label: 'View Dashboard',
				href: '#'
			},
			{
				id: 'invite',
				icon: Mail,
				label: 'Invite User',
				onclick: () => alert('Invite clicked')
			}
		]
	}}
	{template}
/>

<Story
	name="Multiple Actions"
	args={{
		actions: [
			{
				id: 'view',
				icon: ExternalLink,
				label: 'View Dashboard',
				href: '#'
			},
			{
				id: 'edit',
				icon: Edit,
				label: 'Edit',
				onclick: () => alert('Edit clicked')
			},
			{
				id: 'copy',
				icon: Copy,
				label: 'Copy Link',
				onclick: () => alert('Copy clicked')
			},
			{
				id: 'resend',
				icon: RefreshCw,
				label: 'Resend Invite',
				onclick: () => alert('Resend clicked')
			},
			{
				id: 'delete',
				icon: Trash2,
				label: 'Delete',
				class: 'text-red-600',
				onclick: () => alert('Delete clicked')
			}
		]
	}}
	{template}
/>

<Story
	name="With Destructive Action"
	args={{
		actions: [
			{
				id: 'view',
				icon: ExternalLink,
				label: 'View',
				href: '#'
			},
			{
				id: 'invite',
				icon: Mail,
				label: 'Invite',
				onclick: () => {}
			},
			{
				id: 'reset',
				icon: Trash2,
				label: 'Reset Dashboard',
				class: 'text-red-600',
				onclick: () => alert('Reset clicked')
			}
		]
	}}
	{template}
/>

<Story name="Constrained Width">
	{#snippet template()}
		<div class="w-32">
			<ResponsiveActions
				actions={[
					{
						id: 'view',
						icon: ExternalLink,
						label: 'View Dashboard',
						href: '#'
					},
					{
						id: 'edit',
						icon: Edit,
						label: 'Edit',
						onclick: () => {}
					},
					{
						id: 'invite',
						icon: Mail,
						label: 'Invite User',
						onclick: () => {}
					},
					{
						id: 'delete',
						icon: Trash2,
						label: 'Delete',
						class: 'text-red-600',
						onclick: () => {}
					}
				]}
			/>
		</div>
	{/snippet}
</Story>

<Story name="All Widths Comparison">
	{#snippet template()}
		<div class="space-y-8">
			<div>
				<p class="mb-2 text-xs font-medium text-muted-foreground">
					Full width (all visible)
				</p>
				<div class="w-full">
					<ResponsiveActions
						actions={[
							{ id: 'view', icon: ExternalLink, label: 'View', href: '#' },
							{ id: 'edit', icon: Edit, label: 'Edit', onclick: () => {} },
							{ id: 'copy', icon: Copy, label: 'Copy', onclick: () => {} },
							{ id: 'delete', icon: Trash2, label: 'Delete', onclick: () => {} }
						]}
					/>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-medium text-muted-foreground">
					Medium width (some overflow)
				</p>
				<div class="w-40">
					<ResponsiveActions
						actions={[
							{ id: 'view', icon: ExternalLink, label: 'View', href: '#' },
							{ id: 'edit', icon: Edit, label: 'Edit', onclick: () => {} },
							{ id: 'copy', icon: Copy, label: 'Copy', onclick: () => {} },
							{ id: 'delete', icon: Trash2, label: 'Delete', onclick: () => {} }
						]}
					/>
				</div>
			</div>
			<div>
				<p class="mb-2 text-xs font-medium text-muted-foreground">
					Narrow width (most overflow)
				</p>
				<div class="w-20">
					<ResponsiveActions
						actions={[
							{ id: 'view', icon: ExternalLink, label: 'View', href: '#' },
							{ id: 'edit', icon: Edit, label: 'Edit', onclick: () => {} },
							{ id: 'copy', icon: Copy, label: 'Copy', onclick: () => {} },
							{ id: 'delete', icon: Trash2, label: 'Delete', onclick: () => {} }
						]}
					/>
				</div>
			</div>
		</div>
	{/snippet}
</Story>
