import { calculateSessionMetadata } from '../utils/session-helpers.js';

export class SaveSessionUseCase {
	/**
	 * @param {import('../domain/session-repository.js').ISessionRepository} repository
	 */
	constructor(repository) {
		this.repository = repository;
	}

	/**
	 * @param {string} sessionId
	 * @param {import('../domain/session-repository.js').SessionEvent[]} events
	 * @returns {Promise<{sessionId: string, message: string}>}
	 */
	async execute(sessionId, events) {
		const existingMetadata = await this.repository.getMetadata(sessionId);
		const isNewSession = !existingMetadata;

		if (isNewSession) {
			return await this._createSession(sessionId, events);
		} else {
			return await this._appendToSession(sessionId, events);
		}
	}

	async _createSession(sessionId, events) {
		const metadataFields = calculateSessionMetadata(events);

		const metadata = {
			sessionId,
			...metadataFields,
			createdAt: new Date().toISOString()
		};

		await this.repository.saveEvents(sessionId, events);
		await this.repository.createMetadata(metadata);
		await this.repository.addToList(metadata);

		return { sessionId, message: 'Session created successfully' };
	}

	async _appendToSession(sessionId, events) {
		const { totalEventCount, allEvents } = await this.repository.appendEvents(
			sessionId,
			events
		);
		const updatedFields = calculateSessionMetadata(allEvents);

		const updates = {
			duration: updatedFields.duration,
			eventCount: totalEventCount,
			url: updatedFields.url,
			updatedAt: new Date().toISOString()
		};

		await Promise.all([
			this.repository.updateMetadata(sessionId, updates),
			this.repository.updateInList(sessionId, updates)
		]);

		return { sessionId, message: 'Session updated successfully' };
	}
}
