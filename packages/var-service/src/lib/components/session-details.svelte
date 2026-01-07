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
</script>

<div class={['text-muted text-xs', className]} {...rest}>
	{session.eventCount} events · {formatSize(session.eventCount)} · {formatDuration(
		session.duration
	)} · {formatDate(session.timestamp)}
</div>
