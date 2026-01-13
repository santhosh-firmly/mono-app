<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Dashboard from './dashboard.svelte';

	const mockSessions = [
		{
			sessionId: 'session-001',
			url: 'https://example.com/checkout',
			timestamp: new Date('2024-01-15T14:30:00').toISOString(),
			duration: 125000,
			eventCount: 245
		},
		{
			sessionId: 'session-002',
			url: 'https://example.com/product/123',
			timestamp: new Date('2024-01-15T13:15:00').toISOString(),
			duration: 89000,
			eventCount: 180
		},
		{
			sessionId: 'session-003',
			url: 'https://example.com/dashboard',
			timestamp: new Date('2024-01-15T10:45:00').toISOString(),
			duration: 245000,
			eventCount: 512
		}
	];

	const mockAuth = {
		name: 'John Doe',
		email: 'john.doe@example.com'
	};

	const { Story } = defineMeta({
		title: 'Views/Dashboard',
		component: Dashboard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Loading">
	{#snippet template()}
		<Dashboard sessions={[]} loading={true} error={null} auth={mockAuth} />
	{/snippet}
</Story>

<Story name="With Sessions">
	{#snippet template()}
		<Dashboard sessions={mockSessions} loading={false} error={null} auth={mockAuth} />
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<Dashboard sessions={[]} loading={false} error={null} auth={mockAuth} />
	{/snippet}
</Story>

<Story name="Error State">
	{#snippet template()}
		<Dashboard sessions={[]} loading={false} error="Failed to load sessions" auth={mockAuth} />
	{/snippet}
</Story>

<Story name="Without Auth">
	{#snippet template()}
		<Dashboard sessions={mockSessions} loading={false} error={null} auth={null} />
	{/snippet}
</Story>
