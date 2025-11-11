<script>
	let { session, onclick } = $props();

	function formatDate(timestamp) {
		return new Date(timestamp).toLocaleString();
	}

	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	}
</script>

<button
	{onclick}
	class="w-full p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-left"
>
	<div class="flex justify-between items-start mb-2">
		<h3 class="font-semibold text-lg text-gray-900 truncate">{session.url}</h3>
		<span class="text-sm text-gray-500">{formatDuration(session.duration)}</span>
	</div>

	<div class="space-y-1">
		<p class="text-sm text-gray-600">
			<span class="font-medium">Date:</span>
			{formatDate(session.timestamp)}
		</p>
		<p class="text-sm text-gray-600">
			<span class="font-medium">Events:</span>
			{session.eventCount}
		</p>
		<p class="text-sm text-gray-500 text-xs">
			<span class="font-medium">ID:</span>
			{session.sessionId}
		</p>
	</div>
</button>
