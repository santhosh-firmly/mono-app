/**
 * Sessions service for handling API requests to DVR service
 */
export default class SessionsService {
	constructor(dvrServiceUrl, authToken) {
		this.dvrServiceUrl = dvrServiceUrl;
		this.authToken = authToken;
	}

	async fetchSessions() {
		const response = await fetch(`${this.dvrServiceUrl}/api/sessions`, {
			headers: {
				Authorization: `Bearer ${this.authToken}`
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch sessions: ${response.status}`);
		}

		const data = await response.json();
		return data.sessions;
	}

	async fetchSessionById(sessionId) {
		const response = await fetch(
			`${this.dvrServiceUrl}/api/sessions/${encodeURIComponent(sessionId)}`,
			{
				headers: {
					Authorization: `Bearer ${this.authToken}`
				}
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				throw new Error('Session not found');
			}

			throw new Error(`Failed to fetch session: ${response.status}`);
		}

		return response.json();
	}
}
