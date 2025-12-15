class SessionsStore {
	sessions = $state([]);
	loading = $state(true);
	error = $state(null);

	async fetchSessions(dvrServiceUrl) {
		this.loading = true;
		this.error = null;

		try {
			const response = await fetch(`${dvrServiceUrl}/api/sessions`);
			const data = await response.json();
			this.sessions = data.sessions || [];
		} catch (err) {
			this.error = err.message;
		} finally {
			this.loading = false;
		}
	}

	async fetchSessionById(dvrServiceUrl, sessionId) {
		this.loading = true;
		this.error = null;

		try {
			const response = await fetch(`${dvrServiceUrl}/api/sessions/${sessionId}`);
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
