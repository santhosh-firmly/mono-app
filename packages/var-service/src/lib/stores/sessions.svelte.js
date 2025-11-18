import { DVR_SERVICE_URL } from '../config.js';

class SessionsStore {
	sessions = $state([]);
	loading = $state(true);
	error = $state(null);

	async fetchSessions() {
		this.loading = true;
		this.error = null;

		try {
			const response = await fetch(`${DVR_SERVICE_URL}/api/sessions`);
			const data = await response.json();
			this.sessions = data.sessions || [];
		} catch (err) {
			this.error = err.message;
		} finally {
			this.loading = false;
		}
	}

	async fetchSessionById(sessionId) {
		this.loading = true;
		this.error = null;

		try {
			const response = await fetch(`${DVR_SERVICE_URL}/api/sessions/${sessionId}`);
			if (!response.ok) {
				throw new Error('Session not found');
			}
			return await response.json();
		} catch (err) {
			this.error = err.message;
			return null;
		} finally {
			this.loading = false;
		}
	}
}

export const sessionsStore = new SessionsStore();
