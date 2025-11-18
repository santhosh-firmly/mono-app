export class GetSessionUseCase {
	constructor(repository) {
		this.repository = repository;
	}

	async execute(sessionId) {
		const events = await this.repository.getEvents(sessionId);

		if (!events) {
			throw new Error('Session not found');
		}

		const metadata = await this.repository.getMetadata(sessionId);

		return { sessionId, events, metadata };
	}
}
