import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, locals, platform }) {
	const { authInfo } = locals;

	if (!authInfo?.oid) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = platform?.env?.dashUsers;
	if (!db) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	// Parse query parameters
	const search = url.searchParams.get('search') || '';
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);

	try {
		let query;
		let countQuery;

		if (search) {
			// Search by email (case-insensitive)
			query = db.prepare(
				`SELECT id, email, created_at, last_login_at
				 FROM users
				 WHERE email LIKE ?
				 ORDER BY created_at DESC
				 LIMIT ? OFFSET ?`
			);
			countQuery = db.prepare(`SELECT COUNT(*) as total FROM users WHERE email LIKE ?`);

			const searchPattern = `%${search}%`;
			const { results } = await query.bind(searchPattern, limit, offset).all();
			const countResult = await countQuery.bind(searchPattern).first();

			return json({
				users: results || [],
				total: countResult?.total || 0,
				limit,
				offset
			});
		} else {
			// Return all users
			query = db.prepare(
				`SELECT id, email, created_at, last_login_at
				 FROM users
				 ORDER BY created_at DESC
				 LIMIT ? OFFSET ?`
			);
			countQuery = db.prepare(`SELECT COUNT(*) as total FROM users`);

			const { results } = await query.bind(limit, offset).all();
			const countResult = await countQuery.first();

			return json({
				users: results || [],
				total: countResult?.total || 0,
				limit,
				offset
			});
		}
	} catch (error) {
		console.error('Error fetching users:', error);
		return json({ error: 'Failed to fetch users' }, { status: 500 });
	}
}
