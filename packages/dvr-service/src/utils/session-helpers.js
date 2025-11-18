import { EVENT_TYPES } from '../constants/events.js';

/**
 * Calculate session metadata from an array of events
 * @param {Array} events - Array of session recording events
 * @returns {Object} Metadata object with timestamp, duration, eventCount, and url
 */
export function calculateSessionMetadata(events) {
	if (!events || events.length === 0) {
		return {
			timestamp: Date.now(),
			duration: 0,
			eventCount: 0,
			url: 'Unknown'
		};
	}

	const firstEvent = events[0];
	const lastEvent = events[events.length - 1];

	return {
		timestamp: firstEvent.timestamp || Date.now(),
		duration: lastEvent.timestamp - firstEvent.timestamp || 0,
		eventCount: events.length,
		url: extractUrlFromEvents(events)
	};
}

/**
 * Extract URL from events array
 * @param {Array} events - Array of session recording events
 * @returns {string} URL from META event or 'Unknown'
 */
export function extractUrlFromEvents(events) {
	if (!events || events.length === 0) {
		return 'Unknown';
	}

	const metaEvent = events.find((e) => e.type === EVENT_TYPES.META && e.data?.href);
	return metaEvent?.data?.href || 'Unknown';
}
