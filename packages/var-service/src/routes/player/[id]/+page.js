import { DVR_SERVICE_URL } from '$lib/config.js';

export async function load({ params, fetch }) {
	const response = await fetch(`${DVR_SERVICE_URL}/api/sessions/${params.id}`);

	if (!response.ok) {
		return {
			error: 'Session not found',
			sessionData: null
		};
	}

	const sessionData = await response.json();

	return {
		sessionData,
		error: null
	};
}
