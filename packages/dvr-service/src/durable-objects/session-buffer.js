const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export class SessionBuffer {
	constructor(state, env) {
		this.state = state;
		this.env = env;
		this.events = [];
		this.firstTimestamp = null;
		this.lastTimestamp = null;
		this.url = null;
		this.inactivityTimer = null;
		this.sessionId = null;
	}

	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === '/append' && request.method === 'POST') {
			return this.append(request);
		}

		if (url.pathname === '/finalize' && request.method === 'POST') {
			return this.finalize(request);
		}

		return new Response('Not found', { status: 404 });
	}

	async append(request) {
		const { sessionId, events } = await request.json();

		this.sessionId = sessionId;
		this.#updateTimestamps(events);
		this.#extractUrl(events);
		this.events.push(...events);
		this.#resetInactivityTimer();

		return Response.json({
			success: true,
			buffered: true,
			eventCount: this.events.length
		});
	}

	async finalize(request = null) {
		if (request) {
			const { sessionId } = await request.json();
			this.sessionId = sessionId;
		}

		this.#clearInactivityTimer();

		const sessionData = {
			events: this.events,
			metadata: this.#buildMetadata()
		};

		this.#cleanup();

		return Response.json({
			success: true,
			finalized: true,
			sessionData
		});
	}

	#updateTimestamps(events) {
		if (!this.firstTimestamp && events.length > 0) {
			this.firstTimestamp = events[0].timestamp;
		}

		if (events.length > 0) {
			this.lastTimestamp = events[events.length - 1].timestamp;
		}
	}

	#extractUrl(events) {
		if (this.url) return;

		const metaEvent = events.find((e) => e.type === 4 && e.data?.href);
		if (metaEvent) {
			this.url = metaEvent.data.href;
		}
	}

	#buildMetadata() {
		return {
			sessionId: this.sessionId,
			timestamp: this.firstTimestamp || Date.now(),
			duration: this.#calculateDuration(),
			eventCount: this.events.length,
			url: this.url || 'Unknown',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
	}

	#calculateDuration() {
		return this.lastTimestamp && this.firstTimestamp ? this.lastTimestamp - this.firstTimestamp : 0;
	}

	#resetInactivityTimer() {
		this.#clearInactivityTimer();

		this.inactivityTimer = setTimeout(() => {
			this.#handleInactivityTimeout();
		}, INACTIVITY_TIMEOUT_MS);
	}

	async #handleInactivityTimeout() {
		console.log(`Session ${this.state.id} timed out after inactivity`);
		await this.finalize();
	}

	#clearInactivityTimer() {
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
			this.inactivityTimer = null;
		}
	}

	#cleanup() {
		this.#clearInactivityTimer();
		this.events = [];
		this.firstTimestamp = null;
		this.lastTimestamp = null;
		this.url = null;
		this.sessionId = null;
	}
}
