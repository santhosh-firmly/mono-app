<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProfilePage from './profile-page.svelte';

	const { Story } = defineMeta({
		title: 'Pages/User/Profile',
		component: ProfilePage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<script>
	const mockUser = {
		email: 'john.smith@example.com',
		name: 'John Smith',
		title: 'Senior Developer',
		avatar_url: null
	};

	const mockSessions = [
		{
			id: 'session_001',
			device: 'MacBook Pro',
			browser: 'Chrome 120',
			location: 'San Francisco, CA',
			lastActive: '2 minutes ago',
			isCurrent: true
		},
		{
			id: 'session_002',
			device: 'iPhone 15',
			browser: 'Safari',
			location: 'San Francisco, CA',
			lastActive: '1 hour ago',
			isCurrent: false
		},
		{
			id: 'session_003',
			device: 'Windows PC',
			browser: 'Firefox 121',
			location: 'New York, NY',
			lastActive: '3 days ago',
			isCurrent: false
		}
	];

	const noopAsync = async () => {};
</script>

<Story name="Default">
	{#snippet template()}
		<ProfilePage
			user={mockUser}
			sessions={mockSessions}
			isLoadingSessions={false}
			sessionsError=""
			backUrl="#"
			logoutUrl="#"
			onSaveProfile={noopAsync}
			onTerminateSession={noopAsync}
			onTerminateAllSessions={noopAsync}
			onRetryLoadSessions={() => {}}
		/>
	{/snippet}
</Story>

<Story name="Loading Sessions">
	{#snippet template()}
		<ProfilePage
			user={mockUser}
			sessions={[]}
			isLoadingSessions={true}
			sessionsError=""
			backUrl="#"
			logoutUrl="#"
			onSaveProfile={noopAsync}
			onTerminateSession={noopAsync}
			onTerminateAllSessions={noopAsync}
			onRetryLoadSessions={() => {}}
		/>
	{/snippet}
</Story>

<Story name="Sessions Error">
	{#snippet template()}
		<ProfilePage
			user={mockUser}
			sessions={[]}
			isLoadingSessions={false}
			sessionsError="Failed to load sessions. Please try again."
			backUrl="#"
			logoutUrl="#"
			onSaveProfile={noopAsync}
			onTerminateSession={noopAsync}
			onTerminateAllSessions={noopAsync}
			onRetryLoadSessions={() => console.log('Retry clicked')}
		/>
	{/snippet}
</Story>

<Story name="Single Session (Current Only)">
	{#snippet template()}
		<ProfilePage
			user={mockUser}
			sessions={[mockSessions[0]]}
			isLoadingSessions={false}
			sessionsError=""
			backUrl="#"
			logoutUrl="#"
			onSaveProfile={noopAsync}
			onTerminateSession={noopAsync}
			onTerminateAllSessions={noopAsync}
			onRetryLoadSessions={() => {}}
		/>
	{/snippet}
</Story>

<Story name="New User (Minimal Profile)">
	{#snippet template()}
		<ProfilePage
			user={{ email: 'newuser@example.com', name: '', title: '' }}
			sessions={[mockSessions[0]]}
			isLoadingSessions={false}
			sessionsError=""
			backUrl="#"
			logoutUrl="#"
			onSaveProfile={noopAsync}
			onTerminateSession={noopAsync}
			onTerminateAllSessions={noopAsync}
			onRetryLoadSessions={() => {}}
		/>
	{/snippet}
</Story>
