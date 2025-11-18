import { InternalError } from '../errors/index.js';

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

		const { sessionData } = await this.#bufferAdapter.finalize(sessionId);

		if (!sessionData) {
			throw new InternalError('No session data returned from buffer');
		}

		await this.#persistenceAdapter.writeEvents(sessionId, sessionData.events);
		await this.#persistenceAdapter.createMetadata(sessionId, sessionData.metadata);

		return {
			sessionId,
			success: true,
			finalized: true,
			eventCount: sessionData.metadata.eventCount
		};
	}
}
