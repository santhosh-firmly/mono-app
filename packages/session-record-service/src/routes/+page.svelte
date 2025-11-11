<script>
	import { goto } from '$app/navigation';
	import SessionList from '$lib/components/session-list.svelte';

	function handleSelectSession(sessionId) {
		goto(`/player/${sessionId}`);
	}
</script>

<SessionList onSelectSession={handleSelectSession} />
