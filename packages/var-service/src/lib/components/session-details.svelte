<script>
	let { session, class: className, ...rest } = $props();

	function formatDate(timestamp) {
		const date = new Date(timestamp);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		}).format(date);
	}

	function formatDuration(ms) {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		if (minutes === 0) return `${remainingSeconds}s`;
		return `${minutes}m ${remainingSeconds}s`;
	}

	function formatSize(eventCount) {
		const estimatedKb = eventCount * 0.5;
		if (estimatedKb < 1024) return `${Math.round(estimatedKb)} KB`;
		return `${(estimatedKb / 1024).toFixed(1)} MB`;
	}

	function getStatusColor(status) {
		const colors = {
			recording: 'bg-blue-500',
			buffered: 'bg-yellow-500',
			merging: 'bg-orange-500',
			completed: 'bg-green-500'
		};
		return colors[status] || 'bg-gray-500';
	}
</script>

<div class={['text-muted flex items-center gap-1.5 text-xs', className]} {...rest}>
	{#if session.status}
		<span class="flex items-center gap-1">
			<span class={`inline-block h-1.5 w-1.5 rounded-full ${getStatusColor(session.status)}`}></span>
			<span class="capitalize">{session.status}</span>
		</span>
		<span>·</span>
	{/if}
	<span
		>{session.eventCount} events · {formatSize(session.eventCount)} · {formatDuration(
			session.duration
		)} · {formatDate(session.timestamp)}</span
	>
</div>
