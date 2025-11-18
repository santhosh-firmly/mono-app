export class SessionBufferAdapter {
	#namespace;

	constructor(durableObjectNamespace) {
		this.#namespace = durableObjectNamespace;
	}

	async appendEvents(sessionId, events) {
		const response = await this.#fetch(sessionId, '/append', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ sessionId, events })
		});

		return response.json();
	}

	async finalize(sessionId) {
		const response = await this.#fetch(sessionId, '/finalize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ sessionId })
		});

		return response.json();
	}

	#fetch(sessionId, path, options) {
		const stub = this.#getStub(sessionId);
		return stub.fetch(`http://internal${path}`, options);
	}

	#getStub(sessionId) {
		const id = this.#namespace.idFromName(sessionId);
		return this.#namespace.get(id);
	}
}
