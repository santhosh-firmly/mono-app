import { BaseDurableObject } from 'foundation/durable-objects/durable-object-base.js';
import { getLogger } from 'foundation/utils/log.js';

const logger = getLogger('DashUserDO');

/**
 * DashUserDO - Durable Object for per-user data storage.
 *
 * Each user has their own Durable Object instance identified by their UUID.
 * Uses SQLite for persistent storage of profile, sessions, access control, and preferences.
 */
export class DashUserDO extends BaseDurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.ctx = ctx;
        this.env = env;
        this.sql = ctx.storage.sql;

        // Initialize schema on first request
        this.initialized = this.initializeSchema();
    }

    async initializeSchema() {
        // Profile table (single row with JSON)
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS profile (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				data TEXT NOT NULL DEFAULT '{}'
			)
		`);

        // Sessions table
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS sessions (
				id TEXT PRIMARY KEY,
				device_name TEXT,
				device_type TEXT,
				ip_address TEXT,
				user_agent TEXT,
				created_at TEXT DEFAULT (datetime('now')),
				last_access_at TEXT DEFAULT (datetime('now')),
				expires_at TEXT
			)
		`);

        // Merchant access table
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS merchant_access (
				merchant_domain TEXT PRIMARY KEY,
				role TEXT DEFAULT 'owner',
				granted_at TEXT DEFAULT (datetime('now'))
			)
		`);

        // Destination access table
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS destination_access (
				destination_id TEXT PRIMARY KEY,
				access_level TEXT DEFAULT 'full',
				granted_at TEXT DEFAULT (datetime('now'))
			)
		`);

        // Preferences table (single row with JSON)
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS preferences (
				id INTEGER PRIMARY KEY CHECK (id = 1),
				data TEXT NOT NULL DEFAULT '{}'
			)
		`);

        // Initialize profile row if not exists
        this.sql.exec(`INSERT OR IGNORE INTO profile (id, data) VALUES (1, '{}')`);

        // Initialize preferences row if not exists
        this.sql.exec(`INSERT OR IGNORE INTO preferences (id, data) VALUES (1, '{}')`);

        // Pending invites table
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS pending_invites (
				token TEXT PRIMARY KEY,
				merchant_domain TEXT NOT NULL,
				role TEXT NOT NULL,
				invited_by_email TEXT,
				expires_at TEXT NOT NULL,
				created_at TEXT DEFAULT (datetime('now'))
			)
		`);
    }

    async fetch(request) {
        await this.initialized;

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // Profile endpoints
            if (path === '/profile' && method === 'GET') {
                return this.handleGetProfile();
            }
            if (path === '/profile' && method === 'PUT') {
                const data = await request.json();
                return this.handleUpdateProfile(data);
            }

            // Session endpoints
            if (path === '/sessions' && method === 'GET') {
                return this.handleListSessions();
            }
            if (path === '/sessions' && method === 'POST') {
                const data = await request.json();
                return this.handleCreateSession(data);
            }
            // Check /sessions/all BEFORE /sessions/:id since both match startsWith('/sessions/')
            if (path === '/sessions/all' && method === 'DELETE') {
                const excludeSessionId = url.searchParams.get('exclude');
                return this.handleTerminateAllSessions(excludeSessionId);
            }
            if (path.startsWith('/sessions/') && method === 'GET') {
                const sessionId = path.split('/')[2];
                return this.handleValidateSession(sessionId);
            }
            if (path.startsWith('/sessions/') && method === 'PUT') {
                const sessionId = path.split('/')[2];
                return this.handleRefreshSession(sessionId);
            }
            if (path.startsWith('/sessions/') && method === 'DELETE') {
                const sessionId = path.split('/')[2];
                return this.handleTerminateSession(sessionId);
            }

            // Merchant access endpoints
            if (path === '/merchant-access' && method === 'GET') {
                return this.handleGetMerchantAccess();
            }
            if (path === '/merchant-access' && method === 'POST') {
                const data = await request.json();
                return this.handleGrantMerchantAccess(data);
            }
            if (path.startsWith('/merchant-access/') && method === 'DELETE') {
                const domain = decodeURIComponent(path.split('/')[2]);
                return this.handleRevokeMerchantAccess(domain);
            }

            // Destination access endpoints
            if (path === '/destination-access' && method === 'GET') {
                return this.handleGetDestinationAccess();
            }
            if (path === '/destination-access' && method === 'POST') {
                const data = await request.json();
                return this.handleGrantDestinationAccess(data);
            }
            if (path.startsWith('/destination-access/') && method === 'DELETE') {
                const id = decodeURIComponent(path.split('/')[2]);
                return this.handleRevokeDestinationAccess(id);
            }

            // Preferences endpoints
            if (path === '/preferences' && method === 'GET') {
                return this.handleGetPreferences();
            }
            if (path === '/preferences' && method === 'PUT') {
                const data = await request.json();
                return this.handleUpdatePreferences(data);
            }

            // Pending invites endpoints
            if (path === '/pending-invites' && method === 'GET') {
                return this.handleGetPendingInvites();
            }
            if (path === '/pending-invites' && method === 'POST') {
                const data = await request.json();
                return this.handleAddPendingInvite(data);
            }
            if (path.startsWith('/pending-invites/') && method === 'DELETE') {
                const token = decodeURIComponent(path.split('/')[2]);
                return this.handleRemovePendingInvite(token);
            }

            return new Response(JSON.stringify({ error: 'Not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            logger.error('fetch', 'Request handling failed', { error: error.message, path, method });
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }
    }

    // Profile methods
    handleGetProfile() {
        const result = this.sql.exec('SELECT data FROM profile WHERE id = 1').toArray();
        const data = result.length > 0 ? JSON.parse(result[0].data) : {};
        return Response.json(data);
    }

    handleUpdateProfile(newData) {
        // Merge with existing data
        const existing = this.sql.exec('SELECT data FROM profile WHERE id = 1').toArray();
        const currentData = existing.length > 0 ? JSON.parse(existing[0].data) : {};
        const merged = { ...currentData, ...newData };

        this.sql.exec('UPDATE profile SET data = ? WHERE id = 1', JSON.stringify(merged));
        return Response.json(merged);
    }

    // Session methods
    handleListSessions() {
        const sessions = this.sql
            .exec(
                `SELECT id, device_name, device_type, ip_address, created_at, last_access_at, expires_at
			 FROM sessions
			 WHERE datetime(expires_at) > datetime('now')
			 ORDER BY last_access_at DESC`,
            )
            .toArray();
        return Response.json(sessions);
    }

    handleCreateSession({ deviceName, deviceType, ipAddress, userAgent, expiresAt }) {
        const sessionId = crypto.randomUUID();

        this.sql.exec(
            `INSERT INTO sessions (id, device_name, device_type, ip_address, user_agent, expires_at)
			 VALUES (?, ?, ?, ?, ?, ?)`,
            sessionId,
            deviceName || 'Unknown Device',
            deviceType || 'desktop',
            ipAddress || null,
            userAgent || null,
            expiresAt,
        );

        return Response.json({ sessionId });
    }

    handleValidateSession(sessionId) {
        const result = this.sql
            .exec(
                `SELECT id, device_name, device_type, ip_address, created_at, last_access_at, expires_at
			 FROM sessions
			 WHERE id = ? AND datetime(expires_at) > datetime('now')`,
                sessionId,
            )
            .toArray();

        if (result.length === 0) {
            return Response.json({ valid: false }, { status: 404 });
        }

        return Response.json({ valid: true, session: result[0] });
    }

    handleRefreshSession(sessionId) {
        const result = this.sql.exec(`UPDATE sessions SET last_access_at = datetime('now') WHERE id = ? RETURNING *`, sessionId);

        const updated = result.toArray();
        if (updated.length === 0) {
            return Response.json({ error: 'Session not found' }, { status: 404 });
        }

        return Response.json({ success: true, session: updated[0] });
    }

    handleTerminateSession(sessionId) {
        this.sql.exec('DELETE FROM sessions WHERE id = ?', sessionId);
        return Response.json({ success: true });
    }

    handleTerminateAllSessions(excludeSessionId) {
        if (excludeSessionId) {
            this.sql.exec('DELETE FROM sessions WHERE id != ?', excludeSessionId);
        } else {
            this.sql.exec('DELETE FROM sessions');
        }
        return Response.json({ success: true });
    }

    // Merchant access methods
    handleGetMerchantAccess() {
        const access = this.sql.exec('SELECT * FROM merchant_access').toArray();
        return Response.json(access);
    }

    handleGrantMerchantAccess({ merchantDomain, role = 'owner' }) {
        this.sql.exec(
            `INSERT OR REPLACE INTO merchant_access (merchant_domain, role, granted_at)
			 VALUES (?, ?, datetime('now'))`,
            merchantDomain,
            role,
        );
        return Response.json({ success: true });
    }

    handleRevokeMerchantAccess(domain) {
        this.sql.exec('DELETE FROM merchant_access WHERE merchant_domain = ?', domain);
        return Response.json({ success: true });
    }

    // Destination access methods
    handleGetDestinationAccess() {
        const access = this.sql.exec('SELECT * FROM destination_access').toArray();
        return Response.json(access);
    }

    handleGrantDestinationAccess({ destinationId, accessLevel = 'full' }) {
        this.sql.exec(
            `INSERT OR REPLACE INTO destination_access (destination_id, access_level, granted_at)
			 VALUES (?, ?, datetime('now'))`,
            destinationId,
            accessLevel,
        );
        return Response.json({ success: true });
    }

    handleRevokeDestinationAccess(id) {
        this.sql.exec('DELETE FROM destination_access WHERE destination_id = ?', id);
        return Response.json({ success: true });
    }

    // Preferences methods
    handleGetPreferences() {
        const result = this.sql.exec('SELECT data FROM preferences WHERE id = 1').toArray();
        const data = result.length > 0 ? JSON.parse(result[0].data) : {};
        return Response.json(data);
    }

    handleUpdatePreferences(newData) {
        // Merge with existing data
        const existing = this.sql.exec('SELECT data FROM preferences WHERE id = 1').toArray();
        const currentData = existing.length > 0 ? JSON.parse(existing[0].data) : {};
        const merged = { ...currentData, ...newData };

        this.sql.exec('UPDATE preferences SET data = ? WHERE id = 1', JSON.stringify(merged));
        return Response.json(merged);
    }

    // Pending invites methods
    handleGetPendingInvites() {
        // Clean up expired invites first (garbage collection)
        this.sql.exec(`DELETE FROM pending_invites WHERE datetime(expires_at) <= datetime('now')`);

        // Get remaining (non-expired) pending invites
        const invites = this.sql
            .exec(
                `SELECT token, merchant_domain, role, invited_by_email, expires_at, created_at
				 FROM pending_invites
				 ORDER BY created_at DESC`,
            )
            .toArray();
        return Response.json(invites);
    }

    handleAddPendingInvite({ token, merchantDomain, role, invitedByEmail, expiresAt }) {
        // Clean up expired invites first (opportunistic garbage collection)
        this.sql.exec(`DELETE FROM pending_invites WHERE datetime(expires_at) <= datetime('now')`);

        this.sql.exec(
            `INSERT OR REPLACE INTO pending_invites (token, merchant_domain, role, invited_by_email, expires_at)
			 VALUES (?, ?, ?, ?, ?)`,
            token,
            merchantDomain,
            role,
            invitedByEmail,
            expiresAt,
        );
        return Response.json({ success: true });
    }

    handleRemovePendingInvite(token) {
        this.sql.exec('DELETE FROM pending_invites WHERE token = ?', token);
        return Response.json({ success: true });
    }
}
