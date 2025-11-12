export function generateSessionId() {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function saveSessionToR2(platform, sessionId, events) {
	const key = `${sessionId}.json`;
	await platform.env.RECORDINGS.put(key, JSON.stringify(events));
	return events.length;
}

export async function appendEventsToR2(platform, sessionId, newEvents) {
	const existingEvents = await getSessionFromR2(platform, sessionId);
	if (!existingEvents) {
		throw new Error('Session not found');
	}

	const mergedEvents = [...existingEvents, ...newEvents];
	await platform.env.RECORDINGS.put(`${sessionId}.json`, JSON.stringify(mergedEvents));

	return {
		totalEventCount: mergedEvents.length,
		allEvents: mergedEvents
	};
}

export async function getSessionFromR2(platform, sessionId) {
	const key = `${sessionId}.json`;
	const object = await platform.env.RECORDINGS.get(key);

	if (!object) {
		return null;
	}

	return JSON.parse(await object.text());
}

export async function createSessionMetadata(platform, metadata) {
	const { sessionId } = metadata;
	await platform.env.METADATA.put(sessionId, JSON.stringify(metadata));
}

export async function updateSessionMetadata(platform, sessionId, updates) {
	const existing = await getSessionMetadata(platform, sessionId);
	if (!existing) {
		throw new Error('Session metadata not found');
	}

	const updated = {
		...existing,
		...updates,
		updatedAt: new Date().toISOString()
	};

	await platform.env.METADATA.put(sessionId, JSON.stringify(updated));
	return updated;
}

export async function getSessionMetadata(platform, sessionId) {
	const data = await platform.env.METADATA.get(sessionId);
	return data ? JSON.parse(data) : null;
}

const SESSION_LIST_KEY = 'session_list';
const MAX_SESSIONS_IN_LIST = 1000;

async function getSessionList(platform) {
	const data = await platform.env.METADATA.get(SESSION_LIST_KEY);
	return data ? JSON.parse(data) : [];
}

async function saveSessionList(platform, sessionList) {
	await platform.env.METADATA.put(SESSION_LIST_KEY, JSON.stringify(sessionList));
}

export async function addToSessionList(platform, metadata) {
	const sessionList = await getSessionList(platform);

	// Prevent duplicates
	const exists = sessionList.some((s) => s.sessionId === metadata.sessionId);
	if (exists) {
		return;
	}

	sessionList.unshift(metadata);

	// Keep list size manageable
	if (sessionList.length > MAX_SESSIONS_IN_LIST) {
		sessionList.pop();
	}

	await saveSessionList(platform, sessionList);
}

export async function updateInSessionList(platform, sessionId, updates) {
	const sessionList = await getSessionList(platform);
	const index = sessionList.findIndex((s) => s.sessionId === sessionId);

	if (index === -1) {
		return;
	}

	sessionList[index] = { ...sessionList[index], ...updates };
	await saveSessionList(platform, sessionList);
}

export async function removeFromSessionList(platform, sessionId) {
	const sessionList = await getSessionList(platform);
	const filtered = sessionList.filter((s) => s.sessionId !== sessionId);
	await saveSessionList(platform, filtered);
}

export async function listSessionMetadata(platform, limit = 50, offset = 0) {
	const sessionList = await getSessionList(platform);
	return sessionList.slice(offset, offset + limit);
}

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
