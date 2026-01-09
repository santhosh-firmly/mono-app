<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { InvalidInviteCard } from './index.js';

	const { Story } = defineMeta({
		title: 'Authentication/Invalid Invite Card',
		component: InvalidInviteCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			title: { control: 'text' },
			error: { control: 'text' },
			href: { control: 'text' },
			buttonText: { control: 'text' },
			buttonVariant: {
				control: 'select',
				options: ['default', 'outline', 'secondary', 'ghost', 'destructive']
			}
		}
	});
</script>

{#snippet template(args)}
	<InvalidInviteCard {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		title: 'Invalid Invitation',
		error: 'This invitation link is not valid.',
		href: '/',
		buttonText: 'Go to Home',
		buttonVariant: 'outline'
	}}
	{template}
/>

<Story
	name="Expired Invite"
	args={{
		title: 'Invitation Expired',
		error: 'This invitation has expired. Please request a new invitation from the team owner.',
		href: '/',
		buttonText: 'Go to Home',
		buttonVariant: 'outline'
	}}
	{template}
/>

<Story
	name="Already Used"
	args={{
		title: 'Invitation Already Used',
		error: 'This invitation has already been accepted.',
		href: '/login',
		buttonText: 'Go to Login',
		buttonVariant: 'default'
	}}
	{template}
/>

<Story
	name="Redirect To Invite"
	args={{
		title: 'Invalid Link',
		error: 'The invitation link format is incorrect.',
		href: '/invite?token=abc123',
		buttonText: 'Go to Invitation',
		buttonVariant: 'default'
	}}
	{template}
/>

<Story name="All Variants">
	<div class="space-y-6">
		<InvalidInviteCard
			title="Invalid Invitation"
			error="This invitation link is not valid."
			href="/"
			buttonText="Go to Home"
			buttonVariant="outline"
		/>
		<InvalidInviteCard
			title="Invitation Expired"
			error="This invitation has expired."
			href="/"
			buttonText="Request New Invite"
			buttonVariant="default"
		/>
		<InvalidInviteCard
			title="Already Accepted"
			error="This invitation has already been used."
			href="/login"
			buttonText="Sign In"
			buttonVariant="secondary"
		/>
	</div>
</Story>
