<script>
	let { status = 'idle', lastRunDate = null, animated = true } = $props();

	const statusConfig = {
		idle: {
			label: 'Never Run',
			dotClass: 'bg-gray-400',
			badgeClass: 'bg-gray-100 text-gray-600'
		},
		pending: {
			label: 'Queued',
			dotClass: 'bg-blue-500',
			badgeClass: 'bg-blue-100 text-blue-700'
		},
		running: {
			label: 'Running',
			dotClass: 'bg-yellow-500',
			badgeClass: 'bg-yellow-100 text-yellow-700'
		},
		complete: {
			label: 'Complete',
			dotClass: 'bg-green-500',
			badgeClass: 'bg-green-100 text-green-700'
		},
		has_run: {
			label: lastRunDate ? formatDate(lastRunDate) : 'Has Run',
			dotClass: 'bg-green-500',
			badgeClass: 'bg-green-100 text-green-700'
		},
		failed: {
			label: 'Failed',
			dotClass: 'bg-red-500',
			badgeClass: 'bg-red-100 text-red-700'
		}
	};

	let config = $derived(statusConfig[status] || statusConfig.idle);
	let shouldAnimate = $derived(animated && (status === 'running' || status === 'pending'));

	function formatDate(dateStr) {
		if (!dateStr) return '-';
		try {
			const date = new Date(dateStr);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMins / 60);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMins < 1) return 'Just now';
			if (diffMins < 60) return `${diffMins}m ago`;
			if (diffHours < 24) return `${diffHours}h ago`;
			if (diffDays < 7) return `${diffDays}d ago`;
			return date.toLocaleDateString();
		} catch {
			return '-';
		}
	}
</script>

<span
	class="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium {config.badgeClass}"
>
	<span class="w-2 h-2 rounded-full {config.dotClass} {shouldAnimate ? 'animate-pulse' : ''}"
	></span>
	{config.label}
</span>
