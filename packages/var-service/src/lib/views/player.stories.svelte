<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Player from './player.svelte';

	const mockSessionData = {
		metadata: {
			sessionId: 'session-123-abc-456',
			url: 'https://example.com/todo-app',
			timestamp: new Date('2024-01-15T10:30:00').toISOString(),
			userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
			duration: 125000
		},
		events: [
			{ type: 'DomContentLoaded', timestamp: 0 },
			{ type: 'FullSnapshot', timestamp: 100 },
			{ type: 'IncrementalSnapshot', timestamp: 500 }
		]
	};

	const { Story } = defineMeta({
		title: 'Views/Player',
		component: Player,
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Loading">
	{#snippet template()}
		<Player sessionData={null} isLoading={true} error={null} />
	{/snippet}
</Story>

<Story name="With Session Data">
	{#snippet template()}
		<Player sessionData={mockSessionData} isLoading={false} error={null} />
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<Player sessionData={null} isLoading={false} error="Failed to load session" />
	{/snippet}
</Story>

<Story name="Session Not Found">
	{#snippet template()}
		<Player sessionData={null} isLoading={false} error={null} />
	{/snippet}
</Story>
