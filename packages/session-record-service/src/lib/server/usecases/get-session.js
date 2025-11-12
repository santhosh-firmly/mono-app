export class GetSessionUseCase {
	/**
	 * @param {import('../domain/session-repository.js').ISessionRepository} repository
	 */
	constructor(repository) {
		this.repository = repository;
	}

	/**
	 * @param {string} sessionId
	 * @returns {Promise<{sessionId: string, events: import('../domain/session-repository.js').SessionEvent[], metadata: import('../domain/session-repository.js').SessionMetadata | null}>}
	 */
	async execute(sessionId) {
		const events = await this.repository.getEvents(sessionId);

		if (!events) {
			throw new Error('Session not found');
		}

		const metadata = await this.repository.getMetadata(sessionId);

		return { sessionId, events, metadata };
	}
}
