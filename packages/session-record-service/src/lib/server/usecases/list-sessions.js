export class ListSessionsUseCase {
	/**
	 * @param {import('../domain/session-repository.js').ISessionRepository} repository
	 */
	constructor(repository) {
		this.repository = repository;
	}

	/**
	 * @param {number} limit
	 * @param {number} offset
	 * @returns {Promise<{sessions: import('../domain/session-repository.js').SessionMetadata[], count: number}>}
	 */
	async execute(limit = 50, offset = 0) {
		const sessions = await this.repository.listMetadata(limit, offset);
		return { sessions, count: sessions.length };
	}
}
