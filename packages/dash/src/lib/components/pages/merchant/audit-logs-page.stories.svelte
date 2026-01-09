<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AuditLogsPage from './audit-logs-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/Merchant/Audit Logs',
		component: AuditLogsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const mockLogs = [
		{
			id: 'log-001',
			event_type: 'team_member_invited',
			actor_email: 'admin@example.com',
			target_email: 'newuser@example.com',
			details: JSON.stringify({ role: 'member' }),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
		},
		{
			id: 'log-002',
			event_type: 'invite_accepted',
			actor_email: 'newuser@example.com',
			target_email: 'newuser@example.com',
			details: JSON.stringify({ role: 'member' }),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
		},
		{
			id: 'log-003',
			event_type: 'destination_enabled',
			actor_email: 'admin@example.com',
			target_email: null,
			details: JSON.stringify({ destinationName: 'Amazon' }),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
		},
		{
			id: 'log-004',
			event_type: 'settings_updated',
			actor_email: 'support@firmly.com',
			target_email: null,
			details: JSON.stringify({}),
			is_firmly_admin: true,
			created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
		},
		{
			id: 'log-005',
			event_type: 'role_changed',
			actor_email: 'admin@example.com',
			target_email: 'member@example.com',
			details: JSON.stringify({ newRole: 'admin' }),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
		},
		{
			id: 'log-006',
			event_type: 'member_removed',
			actor_email: 'admin@example.com',
			target_email: 'olduser@example.com',
			details: JSON.stringify({}),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
		},
		{
			id: 'log-007',
			event_type: 'integration_completed',
			actor_email: 'admin@example.com',
			target_email: null,
			details: JSON.stringify({}),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
		},
		{
			id: 'log-008',
			event_type: 'catalog_configured',
			actor_email: 'admin@example.com',
			target_email: null,
			details: JSON.stringify({ catalogType: 'full' }),
			is_firmly_admin: false,
			created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
		}
	];

	const noop = () => {};
</script>

<Story name="Default">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={mockLogs}
			isFirmlyAdmin={false}
			currentPage={1}
			totalPages={1}
			total={8}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>

<Story name="As Firmly Admin">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={mockLogs}
			isFirmlyAdmin={true}
			currentPage={1}
			totalPages={1}
			total={8}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={[]}
			isFirmlyAdmin={false}
			currentPage={1}
			totalPages={1}
			total={0}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>

<Story name="With Pagination">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={mockLogs}
			isFirmlyAdmin={false}
			currentPage={1}
			totalPages={5}
			total={120}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>

<Story name="Middle Page">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={mockLogs}
			isFirmlyAdmin={false}
			currentPage={3}
			totalPages={5}
			total={120}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>

<Story name="Last Page">
	{#snippet template()}
		<AuditLogsPage
			domain="example-store.com"
			logs={mockLogs.slice(0, 4)}
			isFirmlyAdmin={false}
			currentPage={5}
			totalPages={5}
			total={120}
			limit={25}
			onPageChange={noop}
		/>
	{/snippet}
</Story>
