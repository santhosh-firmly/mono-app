/**
 * @typedef {Object} SessionMetadata
 * @property {string} sessionId
 * @property {number} timestamp
 * @property {number} duration
 * @property {number} eventCount
 * @property {string} url
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

/**
 * @typedef {Object} SessionEvent
 * @property {number} type
 * @property {number} timestamp
 * @property {any} [data]
 */

/**
 * @typedef {Object} AppendResult
 * @property {number} totalEventCount
 * @property {SessionEvent[]} allEvents
 */

/**
 * Session Repository Interface (Port)
 * Defines the contract for session storage operations
 */
export class ISessionRepository {
	/**
	 * @param {string} sessionId
	 * @param {SessionEvent[]} events
	 * @returns {Promise<number>}
	 */
	async saveEvents(sessionId, events) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {string} sessionId
	 * @param {SessionEvent[]} events
	 * @returns {Promise<AppendResult>}
	 */
	async appendEvents(sessionId, events) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {string} sessionId
	 * @returns {Promise<SessionEvent[] | null>}
	 */
	async getEvents(sessionId) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {SessionMetadata} metadata
	 * @returns {Promise<void>}
	 */
	async createMetadata(metadata) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {string} sessionId
	 * @param {Partial<SessionMetadata>} updates
	 * @returns {Promise<SessionMetadata>}
	 */
	async updateMetadata(sessionId, updates) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {string} sessionId
	 * @returns {Promise<SessionMetadata | null>}
	 */
	async getMetadata(sessionId) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {SessionMetadata} metadata
	 * @returns {Promise<void>}
	 */
	async addToList(metadata) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {string} sessionId
	 * @param {Partial<SessionMetadata>} updates
	 * @returns {Promise<void>}
	 */
	async updateInList(sessionId, updates) {
		throw new Error('Method not implemented');
	}

	/**
	 * @param {number} limit
	 * @param {number} offset
	 * @returns {Promise<SessionMetadata[]>}
	 */
	async listMetadata(limit, offset) {
		throw new Error('Method not implemented');
	}
}
