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

export class ISessionRepository {
	async writeEvents(sessionId, events) {
		throw new Error('Method not implemented');
	}

	async getEvents(sessionId) {
		throw new Error('Method not implemented');
	}

	async createMetadata(sessionId, metadata) {
		throw new Error('Method not implemented');
	}

	async getMetadata(sessionId) {
		throw new Error('Method not implemented');
	}

	async listMetadata(limit, offset) {
		throw new Error('Method not implemented');
	}
}
