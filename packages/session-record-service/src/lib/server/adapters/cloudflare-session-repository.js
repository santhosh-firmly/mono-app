import { ISessionRepository } from '../domain/session-repository.js';

const SESSION_LIST_KEY = 'session_list';
const MAX_SESSIONS_IN_LIST = 1000;

/**
 * Cloudflare Workers KV + R2 implementation of ISessionRepository
 */
export class CloudflareSessionRepository extends ISessionRepository {
	/**
	 * @param {any} platform - Cloudflare platform object with env.RECORDINGS and env.METADATA
	 */
	constructor(platform) {
		super();
		this.recordings = platform.env.RECORDINGS;
		this.metadata = platform.env.METADATA;
	}

	async saveEvents(sessionId, events) {
		const key = `${sessionId}.json`;
		await this.recordings.put(key, JSON.stringify(events));
		return events.length;
	}

	async appendEvents(sessionId, events) {
		const existingEvents = await this.getEvents(sessionId);
		if (!existingEvents) {
			throw new Error('Session not found');
		}

		const mergedEvents = [...existingEvents, ...events];
		await this.recordings.put(`${sessionId}.json`, JSON.stringify(mergedEvents));

		return {
			totalEventCount: mergedEvents.length,
			allEvents: mergedEvents
		};
	}

	async getEvents(sessionId) {
		const key = `${sessionId}.json`;
		const object = await this.recordings.get(key);

		if (!object) {
			return null;
		}

		return JSON.parse(await object.text());
	}

	async createMetadata(metadata) {
		const { sessionId } = metadata;
		await this.metadata.put(sessionId, JSON.stringify(metadata));
	}

	async updateMetadata(sessionId, updates) {
		const existing = await this.getMetadata(sessionId);
		if (!existing) {
			throw new Error('Session metadata not found');
		}

		const updated = {
			...existing,
			...updates,
			updatedAt: new Date().toISOString()
		};

		await this.metadata.put(sessionId, JSON.stringify(updated));
		return updated;
	}

	async getMetadata(sessionId) {
		const data = await this.metadata.get(sessionId);
		return data ? JSON.parse(data) : null;
	}

	async addToList(metadata) {
		const sessionList = await this._getSessionList();

		const exists = sessionList.some((s) => s.sessionId === metadata.sessionId);
		if (exists) {
			return;
		}

		sessionList.unshift(metadata);

		if (sessionList.length > MAX_SESSIONS_IN_LIST) {
			sessionList.pop();
		}

		await this._saveSessionList(sessionList);
	}

	async updateInList(sessionId, updates) {
		const sessionList = await this._getSessionList();
		const index = sessionList.findIndex((s) => s.sessionId === sessionId);

		if (index === -1) {
			return;
		}

		sessionList[index] = { ...sessionList[index], ...updates };
		await this._saveSessionList(sessionList);
	}

	async listMetadata(limit, offset) {
		const sessionList = await this._getSessionList();
		return sessionList.slice(offset, offset + limit);
	}

	async _getSessionList() {
		const data = await this.metadata.get(SESSION_LIST_KEY);
		return data ? JSON.parse(data) : [];
	}

	async _saveSessionList(sessionList) {
		await this.metadata.put(SESSION_LIST_KEY, JSON.stringify(sessionList));
	}
}
