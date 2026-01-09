/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const db = platform?.env?.dashUsers;

	if (!db) {
		return { users: [], total: 0, error: 'Database not configured' };
	}

	try {
		// Get initial user list
		const { results } = await db
			.prepare(
				`SELECT id, email, created_at, last_login_at
				 FROM users
				 ORDER BY created_at DESC
				 LIMIT 50`
			)
			.all();

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM users`).first();

		return {
			users: results || [],
			total: countResult?.total || 0
		};
	} catch (error) {
		console.error('Error fetching users:', error);
		return { users: [], total: 0, error: 'Failed to fetch users' };
	}
}
