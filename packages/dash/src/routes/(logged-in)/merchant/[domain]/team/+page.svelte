<script>
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import TeamPage from '$lib/components/pages/merchant/team-page.svelte';
	import { adminFetch } from '$lib/utils/fetch.js';

	let { data } = $props();
	let domain = $derived($page.params.domain);

	// Local team state for updates
	let team = $state(data.team || []);
	let pendingInvites = $state(data.pendingInvites || []);

	async function handleInvite(form) {
		const response = await adminFetch(`/merchant/${domain}/api/team/invite`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Failed to send invite');
		}

		// Refresh data to show new pending invite
		await invalidateAll();
		pendingInvites = data.pendingInvites || [];
	}

	async function handleChangeRole(userId, newRole) {
		const response = await adminFetch(`/merchant/${domain}/api/team/${userId}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: newRole })
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Failed to update role');
		}

		// Update local state
		team = team.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m));
	}

	async function handleRemove(userId) {
		const response = await adminFetch(`/merchant/${domain}/api/team/${userId}`, {
			method: 'DELETE'
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Failed to remove team member');
		}

		// Update local state
		team = team.filter((m) => m.user_id !== userId);
	}

	async function handleCancelInvite(token) {
		const response = await adminFetch(`/merchant/${domain}/api/team/invite/cancel`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token })
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.error || 'Failed to cancel invite');
		}

		// Update local state
		pendingInvites = pendingInvites.filter((i) => i.token !== token);
	}
</script>

<TeamPage
	{team}
	{pendingInvites}
	currentUserId={data.currentUserId}
	isOwner={data.isOwner}
	error={data.error || ''}
	onInvite={handleInvite}
	onChangeRole={handleChangeRole}
	onRemove={handleRemove}
	onCancelInvite={handleCancelInvite}
/>
