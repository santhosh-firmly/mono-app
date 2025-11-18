export function calculateSessionMetadata(events) {
	if (!events || events.length === 0) {
		return { duration: 0, eventCount: 0, url: 'Unknown' };
	}

	const firstEvent = events[0];
	const lastEvent = events[events.length - 1];

	return {
		timestamp: firstEvent.timestamp || Date.now(),
		duration: lastEvent.timestamp - firstEvent.timestamp || 0,
		eventCount: events.length,
		url: events.find((e) => e.type === 4 && e.data?.href)?.data?.href || 'Unknown'
	};
}

export function generateSessionId() {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
