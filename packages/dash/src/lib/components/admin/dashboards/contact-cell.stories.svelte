<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ContactCell from './contact-cell.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Dashboards/Contact Cell',
		component: ContactCell,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

{#snippet template(args)}
	<ContactCell {...args} />
{/snippet}

<Story
	name="With Name and Email"
	args={{
		contact: {
			name: 'John Doe',
			email: 'john@example.com'
		}
	}}
	{template}
/>

<Story
	name="Name Only"
	args={{
		contact: {
			name: 'Jane Smith'
		}
	}}
	{template}
/>

<Story
	name="Email Only"
	args={{
		contact: {
			email: 'contact@company.com'
		}
	}}
	{template}
/>

<Story
	name="Pending Invite"
	args={{
		pendingInvite: {
			email: 'pending@example.com'
		}
	}}
	{template}
/>

<Story
	name="Not Set"
	args={{
		contact: null,
		pendingInvite: null
	}}
	{template}
/>

<Story name="All States">
	<div class="space-y-6">
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Full Contact</p>
			<ContactCell contact={{ name: 'John Doe', email: 'john@example.com' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Name Only</p>
			<ContactCell contact={{ name: 'Jane Smith' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Email Only</p>
			<ContactCell contact={{ email: 'contact@company.com' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Pending Invite</p>
			<ContactCell pendingInvite={{ email: 'pending@example.com' }} />
		</div>
		<div>
			<p class="mb-2 text-xs font-medium text-muted-foreground">Not Set</p>
			<ContactCell />
		</div>
	</div>
</Story>
