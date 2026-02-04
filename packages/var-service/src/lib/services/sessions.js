/**
 * Sessions service for handling API requests to DVR service
 */
export default class SessionsService {
	#dvrServiceUrl;
	#authHeaders;

	constructor(dvrServiceUrl, authToken) {
		this.#dvrServiceUrl = dvrServiceUrl;
		this.#authHeaders = { Authorization: `Bearer ${authToken}` };
	}

	async fetchSessions({ limit, offset, sessionId } = {}) {
		const params = new URLSearchParams(
			Object.entries({ limit, offset, sessionId }).filter(([, value]) => value != null)
		);

		const query = params.toString();
		const response = await this.#fetch(`/api/sessions${query ? `?${query}` : ''}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch sessions: ${response.status}`);
		}

		return response.json();
	}

	async fetchSessionById(sessionId) {
		const response = await this.#fetch(`/api/sessions/${encodeURIComponent(sessionId)}`);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Session not found');
			}

			throw new Error(`Failed to fetch session: ${response.status}`);
		}

		return response.json();
	}

	#fetch(path) {
		return fetch(`${this.#dvrServiceUrl}${path}`, { headers: this.#authHeaders });
	}
}
