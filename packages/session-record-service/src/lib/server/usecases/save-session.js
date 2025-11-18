export class SaveSessionUseCase {
	#persistenceAdapter;
	#bufferAdapter;

	constructor(persistenceAdapter, bufferAdapter) {
		this.#persistenceAdapter = persistenceAdapter;
		this.#bufferAdapter = bufferAdapter;
	}

	async execute(sessionId, events, finalize = false) {
		if (finalize) {
			return this.#finalizeSession(sessionId, events);
		}

		const bufferResponse = await this.#bufferAdapter.appendEvents(sessionId, events);

		return {
			sessionId,
			success: true,
			buffered: bufferResponse.buffered,
			eventCount: bufferResponse.eventCount
		};
	}

	async #finalizeSession(sessionId, events) {
		if (events.length > 0) {
			await this.#bufferAdapter.appendEvents(sessionId, events);
		}

		const finalizeResponse = await this.#bufferAdapter.finalize(sessionId);

		if (!finalizeResponse.sessionData) {
			throw new Error('No session data returned from buffer');
		}

		const { events: allEvents, metadata } = finalizeResponse.sessionData;

		await this.#persistSession(sessionId, allEvents, metadata);

		return {
			sessionId,
			success: true,
			finalized: true,
			eventCount: metadata.eventCount
		};
	}

	async #persistSession(sessionId, events, metadata) {
		await this.#persistenceAdapter.writeEvents(sessionId, Date.now(), events);
		await this.#persistenceAdapter.createSession(metadata);
	}
}
