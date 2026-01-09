<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EmailSentCard from './email-sent-card.svelte';

	const { Story } = defineMeta({
		title: 'Authentication/Email Sent Card',
		component: EmailSentCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			email: { control: 'text', description: 'Email address the link/code was sent to' },
			method: {
				control: 'select',
				options: ['magic', 'otp'],
				description: 'The method used to send the verification'
			}
		}
	});
</script>

{#snippet template(args)}
	<EmailSentCard {...args} />
{/snippet}

<Story
	name="Magic Link"
	args={{
		email: 'john@example.com',
		method: 'magic'
	}}
	{template}
/>

<Story
	name="OTP Code"
	args={{
		email: 'john@example.com',
		method: 'otp'
	}}
	{template}
/>
