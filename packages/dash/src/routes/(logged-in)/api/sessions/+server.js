import { json } from '@sveltejs/kit';
import { listSessions, terminateSession, terminateAllSessions } from '$lib/server/user.js';

/**
 * GET /api/sessions
 * Get all active sessions for the current user.
 */
export async function GET({ locals, platform }) {
	const { userId, sessionId: currentSessionId } = locals.session;

	const sessions = await listSessions({ platform, userId });

	// Mark the current session
	const sessionsWithCurrent = sessions.map((session) => ({
		...session,
		isCurrent: session.id === currentSessionId
	}));

	return json(sessionsWithCurrent);
}

/**
 * DELETE /api/sessions
 * Terminate session(s).
 * Body: { sessionId: string } - terminate specific session
 * Body: { all: true } - terminate all other sessions
 */
export async function DELETE({ request, locals, platform }) {
	const { userId, sessionId: currentSessionId } = locals.session;
	const body = await request.json();

	// Terminate all other sessions
	if (body.all === true) {
		await terminateAllSessions({
			platform,
			userId,
			excludeSessionId: currentSessionId
		});

		return json({ success: true, message: 'All other sessions terminated' });
	}

	// Terminate specific session
	const { sessionId } = body;

	if (!sessionId) {
		return json({ error: 'Session ID is required' }, { status: 400 });
	}

	// Prevent terminating current session via this endpoint
	if (sessionId === currentSessionId) {
		return json(
			{ error: 'Cannot terminate current session. Use logout instead.' },
			{ status: 400 }
		);
	}

	await terminateSession({ platform, userId, sessionId });

	return json({ success: true });
}
