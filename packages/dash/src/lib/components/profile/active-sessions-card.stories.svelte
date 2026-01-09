<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ActiveSessionsCard from './active-sessions-card.svelte';
	import sessionsData from '$lib/assets/sessions-data.json';

	const { Story } = defineMeta({
		title: 'Profile/Active Sessions Card',
		component: ActiveSessionsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			isLoading: { control: 'boolean' },
			terminatingSessionId: { control: 'text' },
			isTerminatingAll: { control: 'boolean' },
			error: { control: 'text' }
		}
	});

	// Extract sessions array from the JSON
	const sessions = sessionsData.sessions;
</script>

{#snippet template(args)}
	<div class="w-[500px]">
		<ActiveSessionsCard {...args} />
	</div>
{/snippet}

<Story name="Default" args={{ sessions }} {template} />

<Story name="Loading" args={{ sessions: [], isLoading: true }} {template} />

<Story name="Empty" args={{ sessions: [] }} {template} />

<Story
	name="Terminating Session"
	args={{
		sessions,
		terminatingSessionId: sessions[1]?.id
	}}
	{template}
/>

<Story
	name="Terminating All"
	args={{
		sessions,
		isTerminatingAll: true
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		sessions,
		error: 'Failed to load sessions'
	}}
	{template}
/>

<Story
	name="Single Session (Current Only)"
	args={{
		sessions: [sessions[0]]
	}}
	{template}
/>
