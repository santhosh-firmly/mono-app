export function generateSessionId() {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function saveSessionToR2(platform, sessionId, events) {
	const key = `${sessionId}.json`;
	await platform.env.RECORDINGS.put(key, JSON.stringify(events));
}

export async function getSessionFromR2(platform, sessionId) {
	const key = `${sessionId}.json`;
	const object = await platform.env.RECORDINGS.get(key);

	if (!object) {
		return null;
	}

	return JSON.parse(await object.text());
}

export async function saveSessionMetadata(platform, metadata) {
	const { sessionId } = metadata;
	await platform.env.METADATA.put(sessionId, JSON.stringify(metadata));

	const listKey = 'session_list';
	const existingList = await platform.env.METADATA.get(listKey);
	const sessionList = existingList ? JSON.parse(existingList) : [];

	sessionList.unshift(metadata);

	if (sessionList.length > 1000) {
		sessionList.pop();
	}

	await platform.env.METADATA.put(listKey, JSON.stringify(sessionList));
}

export async function getSessionMetadata(platform, sessionId) {
	const data = await platform.env.METADATA.get(sessionId);
	return data ? JSON.parse(data) : null;
}

export async function listSessionMetadata(platform, limit = 50, offset = 0) {
	const listKey = 'session_list';
	const data = await platform.env.METADATA.get(listKey);

	if (!data) {
		return [];
	}

	const sessionList = JSON.parse(data);
	return sessionList.slice(offset, offset + limit);
}
