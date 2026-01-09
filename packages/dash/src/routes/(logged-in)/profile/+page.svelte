<script>
	import { onMount } from 'svelte';
	import ProfilePage from '$lib/components/pages/profile/profile-page.svelte';

	let { data } = $props();

	// Sessions state
	let sessions = $state([]);
	let isLoadingSessions = $state(true);
	let sessionsError = $state('');

	onMount(() => {
		loadSessions();
	});

	async function loadSessions() {
		isLoadingSessions = true;
		sessionsError = '';

		try {
			const response = await fetch('/api/sessions');
			if (!response.ok) {
				throw new Error('Failed to load sessions');
			}
			sessions = await response.json();
		} catch (error) {
			sessionsError = error.message;
		} finally {
			isLoadingSessions = false;
		}
	}

	async function handleSaveProfile(formData) {
		const response = await fetch('/api/profile', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData)
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Failed to update profile');
		}

		// Update the page data with new values
		data.user = {
			...data.user,
			...formData
		};
	}

	async function handleTerminateSession(sessionId) {
		const response = await fetch('/api/sessions', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ sessionId })
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || 'Failed to terminate session');
		}

		// Remove from list
		sessions = sessions.filter((s) => s.id !== sessionId);
	}

	async function handleTerminateAllSessions() {
		const response = await fetch('/api/sessions', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ all: true })
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.error || 'Failed to terminate sessions');
		}

		// Keep only current session
		sessions = sessions.filter((s) => s.isCurrent);
	}
</script>

<ProfilePage
	user={data.user}
	{sessions}
	{isLoadingSessions}
	{sessionsError}
	backUrl="/"
	logoutUrl="/api/auth/logout"
	onSaveProfile={handleSaveProfile}
	onTerminateSession={handleTerminateSession}
	onTerminateAllSessions={handleTerminateAllSessions}
	onRetryLoadSessions={loadSessions}
/>
