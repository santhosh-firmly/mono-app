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
		const sessionList = await this.#getSessionList();

		if (sessionList.some((s) => s?.sessionId === sessionId)) {
			return;
		}

		sessionList.unshift(metadata);

		if (sessionList.length > MAX_SESSIONS_IN_LIST) {
			sessionList.pop();
		}

		await this.#saveSessionList(sessionList);
	}

	async #getSessionList() {
		const data = await this.#metadata.get(SESSION_LIST_KEY);
		const list = data ? JSON.parse(data) : [];
		return list.filter((item) => item && typeof item === 'object' && item.sessionId);
	}

	async #saveSessionList(sessionList) {
		await this.#metadata.put(SESSION_LIST_KEY, JSON.stringify(sessionList));
	}
}
