import { ISessionRepository } from '../domain/session-repository.js';

const SESSION_LIST_KEY = 'session_list';
const MAX_SESSIONS_IN_LIST = 1000;

export class SessionPersistenceAdapter extends ISessionRepository {
	#recordings;
	#metadata;

	constructor(platform) {
		super();
		this.#recordings = platform.env.RECORDINGS;
		this.#metadata = platform.env.METADATA;
	}

	async writeEvents(sessionId, chunkId, events) {
		const key = `${sessionId}/chunk-${chunkId}.json`;
		await this.#recordings.put(key, JSON.stringify(events));
		return events.length;
	}

	async getEvents(sessionId) {
		const { objects } = await this.#recordings.list({ prefix: `${sessionId}/chunk-` });

		if (objects.length === 0) {
			return null;
		}

		const chunks = await Promise.all(objects.map((obj) => this.#loadChunk(obj.key)));

		return chunks.flat();
	}

	async createSession(metadata) {
		await this.#createMetadata(metadata);
		await this.#addToList(metadata);
	}

	async getMetadata(sessionId) {
		const data = await this.#metadata.get(sessionId);
		return data ? JSON.parse(data) : null;
	}

	async listMetadata(limit, offset) {
		const sessionList = await this.#getSessionList();
		return sessionList.slice(offset, offset + limit);
	}

	async #createMetadata(metadata) {
		await this.#metadata.put(metadata.sessionId, JSON.stringify(metadata));
	}

	async #addToList(metadata) {
		const sessionList = await this.#getSessionList();

		if (sessionList.some((s) => s.sessionId === metadata.sessionId)) {
			return;
		}

		sessionList.unshift(metadata);

		if (sessionList.length > MAX_SESSIONS_IN_LIST) {
			sessionList.pop();
		}

		await this.#saveSessionList(sessionList);
	}

	async #loadChunk(key) {
		const data = await this.#recordings.get(key);
		return JSON.parse(await data.text());
	}

	async #getSessionList() {
		const data = await this.#metadata.get(SESSION_LIST_KEY);
		return data ? JSON.parse(data) : [];
	}

	async #saveSessionList(sessionList) {
		await this.#metadata.put(SESSION_LIST_KEY, JSON.stringify(sessionList));
	}
}
