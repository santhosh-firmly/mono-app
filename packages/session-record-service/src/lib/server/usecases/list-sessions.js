export class ListSessionsUseCase {
	constructor(repository) {
		this.repository = repository;
	}

	async execute(limit = 50, offset = 0) {
		const sessions = await this.repository.listMetadata(limit, offset);
		return { sessions, count: sessions.length };
	}
}
