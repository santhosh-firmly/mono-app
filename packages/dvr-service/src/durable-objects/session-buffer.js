import { SessionPersistenceAdapter } from '../adapters/session-persistence-adapter.js';
import { calculateSessionMetadata } from '../utils/session-helpers.js';
import { InvalidRequestError, MissingParameterError } from '../errors/index.js';
import { withErrorHandling } from '../middleware/error-handler.js';

const INACTIVITY_TIMEOUT_MS = 1 * 60 * 1000;

export class SessionBuffer {
	constructor(state, env) {
		this.state = state;
		this.env = env;
		this.events = [];
		this.firstTimestamp = null;
		this.lastTimestamp = null;
		this.url = null;
		this.sessionId = null;
	}

	fetch = withErrorHandling(async (request) => {
		const url = new URL(request.url);

		if (url.pathname === '/append' && request.method === 'POST') {
			return this.#append(request);
		}

		if (url.pathname === '/finalize' && request.method === 'POST') {
			return this.#finalize(request);
		}

		return new Response('Not found', { status: 404 });
	});

	async #append(request) {
		const { sessionId, events } = await request.json();

		if (!sessionId) {
			throw new MissingParameterError('sessionId');
		}

		if (!events || !Array.isArray(events)) {
			throw new InvalidRequestError('events must be an array');
		}

		this.sessionId = sessionId;
		this.#updateTimestamps(events);
		this.events.push(...events);
		this.#resetInactivityTimer();

		return Response.json({
			success: true,
			buffered: true,
			eventCount: this.events.length
		});
	}

	async #finalize(request = null) {
		if (request) {
			const { sessionId } = await request.json();
			this.sessionId = sessionId;
		}

		this.#clearInactivityTimer();

		const metadata = calculateSessionMetadata(this.events);

		const sessionData = {
			events: this.events,
			metadata: {
				...metadata,
				sessionId: this.sessionId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
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

	async #handleInactivityTimeout() {
		try {
			console.log(`Session ${this.sessionId || this.state.id} timed out after inactivity`);

			const persistenceAdapter = new SessionPersistenceAdapter({
				RECORDINGS: this.env.RECORDINGS,
				METADATA: this.env.METADATA
			});

			const metadata = calculateSessionMetadata(this.events);

			await persistenceAdapter.writeEvents(this.sessionId, this.events);
			await persistenceAdapter.createMetadata(this.sessionId, {
				...metadata,
				sessionId: this.sessionId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			});

			this.#cleanup();
		} catch (error) {
			// Background operation - log but don't throw
			console.error('SessionBuffer inactivity timeout error:', error);
		}
	}

	#resetInactivityTimer() {
		this.#clearInactivityTimer();

		const alarmTime = Date.now() + INACTIVITY_TIMEOUT_MS;
		this.state.storage.setAlarm(alarmTime);
	}

	#clearInactivityTimer() {
		this.state.storage.deleteAlarm();
	}

	async alarm() {
		await this.#handleInactivityTimeout();
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
