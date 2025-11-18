import { ISessionRepository } from '../domain/session-repository.js';
import { StorageError } from '../errors/index.js';

const SESSION_LIST_KEY = 'session_list';
const MAX_SESSIONS_IN_LIST = 1000;

export class SessionPersistenceAdapter extends ISessionRepository {
	#recordings;
	#metadata;

	constructor(platform) {
		super();
		this.#recordings = platform.RECORDINGS || platform.env?.RECORDINGS;
		this.#metadata = platform.METADATA || platform.env?.METADATA;

		if (!this.#recordings || !this.#metadata) {
			throw new StorageError('RECORDINGS and METADATA bindings are required');
		}
	}

	async writeEvents(sessionId, events) {
		const key = `${sessionId}.json`;
		await this.#recordings.put(key, JSON.stringify(events));
		return events.length;
	}

	async getEvents(sessionId) {
		const key = `${sessionId}.json`;
		const data = await this.#recordings.get(key);
		if (!data) {
			return null;
		}
		return JSON.parse(await data.text());
	}

	async createMetadata(sessionId, metadata) {
		await this.#metadata.put(sessionId, JSON.stringify(metadata));
		await this.#addToList(sessionId, metadata);
	}

	async getMetadata(sessionId) {
		const data = await this.#metadata.get(sessionId);
		return data ? JSON.parse(data) : null;
	}

	async listMetadata(limit, offset) {
		const sessionList = await this.#getSessionList();
		return sessionList.slice(offset, offset + limit);
	}

	async #addToList(sessionId, metadata) {
		try {
			const sessionList = await this.#getSessionList();

			if (sessionList.some((s) => s?.sessionId === sessionId)) {
				return;
			}

			sessionList.unshift(metadata);

			if (sessionList.length > MAX_SESSIONS_IN_LIST) {
				sessionList.pop();
			}

			await this.#saveSessionList(sessionList);
		} catch (error) {
			// Background operation - log but don't throw
			console.error('SessionPersistenceAdapter.#addToList error:', error);
		}
	}

	async #getSessionList() {
		try {
			const data = await this.#metadata.get(SESSION_LIST_KEY);
			const list = data ? JSON.parse(data) : [];
			return list.filter((item) => item && typeof item === 'object' && item.sessionId);
		} catch (error) {
			// Background operation - log and return empty array
			console.error('SessionPersistenceAdapter.#getSessionList error:', error);
			return [];
		}
	}

	async #saveSessionList(sessionList) {
		try {
			await this.#metadata.put(SESSION_LIST_KEY, JSON.stringify(sessionList));
		} catch (error) {
			// Background operation - log but don't throw
			console.error('SessionPersistenceAdapter.#saveSessionList error:', error);
		}
	}
}
