/**
 * Shared team and audit log functionality for Durable Objects.
 *
 * This module provides reusable SQL schemas and handler implementations
 * for team membership and audit logging, used by both MerchantDO and DestinationDO.
 */

/**
 * Route definitions for team endpoints.
 * @type {Array<Object>}
 */
export const teamRoutes = [
    { path: '/team', method: 'GET', handler: 'handleGetTeam' },
    { path: '/team', method: 'POST', handler: 'handleAddTeamMember', needsJson: true },
    { path: '/team/:userId', method: 'PUT', handler: 'handleUpdateTeamMember', needsJson: true },
    { path: '/team/:userId', method: 'DELETE', handler: 'handleRemoveTeamMember' },
];

/**
 * Route definitions for pending invite endpoints.
 * @type {Array<Object>}
 */
export const pendingInviteRoutes = [
    { path: '/pending-invites', method: 'GET', handler: 'handleGetPendingInvites' },
    { path: '/pending-invites', method: 'POST', handler: 'handleAddPendingInvite', needsJson: true },
    { path: '/pending-invites/by-email/:email', method: 'GET', handler: 'handleGetPendingInviteByEmail' },
    { path: '/pending-invites/:token', method: 'PUT', handler: 'handleUpdatePendingInvite', needsJson: true },
    { path: '/pending-invites/:token', method: 'DELETE', handler: 'handleRemovePendingInvite' },
];

/**
 * Route definitions for audit log endpoints.
 * @type {Array<Object>}
 */
export const auditLogRoutes = [
    { path: '/audit-logs', method: 'GET', handler: 'handleGetAuditLogs' },
    { path: '/audit-logs', method: 'POST', handler: 'handleCreateAuditLog', needsJson: true },
];

/**
 * Initialize team table schema.
 * @param {Object} sql - SQLite interface from Durable Object storage
 */
export function initializeTeamSchema(sql) {
    sql.exec(`
        CREATE TABLE IF NOT EXISTS team (
            user_id TEXT PRIMARY KEY,
            user_email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'viewer',
            granted_at TEXT DEFAULT (datetime('now')),
            granted_by TEXT
        )
    `);
}

/**
 * Initialize pending invites table schema.
 * @param {Object} sql - SQLite interface from Durable Object storage
 */
export function initializePendingInvitesSchema(sql) {
    sql.exec(`
        CREATE TABLE IF NOT EXISTS pending_invites (
            token TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'viewer',
            invited_by_user_id TEXT NOT NULL,
            invited_by_email TEXT NOT NULL,
            is_firmly_admin INTEGER DEFAULT 0,
            expires_at TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // Index for efficient expiry-based garbage collection
    sql.exec(`
        CREATE INDEX IF NOT EXISTS idx_pending_invites_expires_at ON pending_invites(expires_at)
    `);
}

/**
 * Initialize audit logs table schema with migrations.
 * @param {Object} sql - SQLite interface from Durable Object storage
 */
export function initializeAuditLogSchema(sql) {
    sql.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            actor_id TEXT NOT NULL,
            actor_email TEXT NOT NULL,
            target_id TEXT,
            target_email TEXT,
            details TEXT,
            is_firmly_admin INTEGER DEFAULT 0,
            actor_type TEXT DEFAULT 'user',
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // Migration: add is_firmly_admin column to existing tables
    try {
        sql.exec(`ALTER TABLE audit_logs ADD COLUMN is_firmly_admin INTEGER DEFAULT 0`);
    } catch {
        // Column already exists, ignore error
    }

    // Migration: add actor_type column to existing tables
    try {
        sql.exec(`ALTER TABLE audit_logs ADD COLUMN actor_type TEXT DEFAULT 'user'`);
    } catch {
        // Column already exists, ignore error
    }

    // Index for efficient audit log queries
    sql.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)
    `);
}

/**
 * Team handler implementations.
 * These methods should be bound to the Durable Object instance.
 */
export const teamHandlers = {
    /**
     * Get all team members.
     * @param {Object} sql - SQLite interface
     * @returns {Response} JSON response with team array
     */
    getTeam(sql) {
        const team = sql.exec('SELECT * FROM team ORDER BY granted_at ASC').toArray();
        return Response.json(team);
    },

    /**
     * Add or update a team member.
     * @param {Object} sql - SQLite interface
     * @param {Object} data - Team member data
     * @param {string} data.userId - User UUID
     * @param {string} data.userEmail - User email
     * @param {string} data.role - Role (owner, editor, viewer)
     * @param {string} data.grantedBy - User ID who granted access
     * @returns {Response} JSON response
     */
    addTeamMember(sql, { userId, userEmail, role = 'viewer', grantedBy }) {
        sql.exec(
            `INSERT OR REPLACE INTO team (user_id, user_email, role, granted_at, granted_by)
             VALUES (?, ?, ?, datetime('now'), ?)`,
            userId,
            userEmail,
            role,
            grantedBy,
        );
        return Response.json({ success: true });
    },

    /**
     * Update a team member's role.
     * @param {Object} sql - SQLite interface
     * @param {string} userId - User UUID
     * @param {Object} data - Update data
     * @param {string} data.role - New role
     * @returns {Response} JSON response
     */
    updateTeamMember(sql, userId, { role }) {
        const result = sql.exec(`UPDATE team SET role = ? WHERE user_id = ? RETURNING *`, role, userId);

        const updated = result.toArray();
        if (updated.length === 0) {
            return Response.json({ error: 'Team member not found' }, { status: 404 });
        }

        return Response.json({ success: true, member: updated[0] });
    },

    /**
     * Remove a team member.
     * @param {Object} sql - SQLite interface
     * @param {string} userId - User UUID
     * @returns {Response} JSON response
     */
    removeTeamMember(sql, userId) {
        const result = sql.exec(`DELETE FROM team WHERE user_id = ? RETURNING *`, userId);

        const deleted = result.toArray();
        if (deleted.length === 0) {
            return Response.json({ error: 'Team member not found' }, { status: 404 });
        }

        return Response.json({ success: true });
    },
};

/**
 * Pending invite handler implementations.
 * These methods should be bound to the Durable Object instance.
 */
export const pendingInviteHandlers = {
    /**
     * Get all pending invites, optionally filtering by includeFirmlyAdmin.
     * Also performs garbage collection of expired invites.
     * @param {Object} sql - SQLite interface
     * @param {boolean} includeFirmlyAdmin - Include invites created by Firmly admins
     * @returns {Response} JSON response with invites array
     */
    getPendingInvites(sql, includeFirmlyAdmin = false) {
        // Garbage collect expired invites first
        sql.exec(`DELETE FROM pending_invites WHERE expires_at < datetime('now')`);

        // Regular users don't see Firmly admin invites
        const whereClause = includeFirmlyAdmin ? '' : 'WHERE is_firmly_admin = 0';

        const invites = sql.exec(`SELECT * FROM pending_invites ${whereClause} ORDER BY created_at DESC`).toArray();

        return Response.json(invites);
    },

    /**
     * Add a pending invite.
     * @param {Object} sql - SQLite interface
     * @param {Object} data - Invite data
     * @param {string} data.token - Unique invite token
     * @param {string} data.email - Invitee email
     * @param {string} data.role - Role (owner, editor, viewer)
     * @param {string} data.invitedByUserId - User ID who sent the invite
     * @param {string} data.invitedByEmail - Email of user who sent the invite
     * @param {boolean} data.isFirmlyAdmin - Whether inviter is a Firmly admin
     * @param {string} data.expiresAt - ISO date string for expiry
     * @returns {Response} JSON response
     */
    addPendingInvite(sql, { token, email, role = 'viewer', invitedByUserId, invitedByEmail, isFirmlyAdmin = false, expiresAt }) {
        sql.exec(
            `INSERT INTO pending_invites (token, email, role, invited_by_user_id, invited_by_email, is_firmly_admin, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(token) DO UPDATE SET
                email = excluded.email,
                role = excluded.role,
                invited_by_user_id = excluded.invited_by_user_id,
                invited_by_email = excluded.invited_by_email,
                is_firmly_admin = excluded.is_firmly_admin,
                expires_at = excluded.expires_at`,
            token,
            email,
            role,
            invitedByUserId,
            invitedByEmail,
            isFirmlyAdmin ? 1 : 0,
            expiresAt,
        );
        return Response.json({ success: true });
    },

    /**
     * Get a pending invite by email.
     * @param {Object} sql - SQLite interface
     * @param {string} email - Invitee email
     * @returns {Response} JSON response with invite or null
     */
    getPendingInviteByEmail(sql, email) {
        // Garbage collect expired invites first
        sql.exec(`DELETE FROM pending_invites WHERE expires_at < datetime('now')`);

        const invites = sql.exec(`SELECT * FROM pending_invites WHERE LOWER(email) = LOWER(?) LIMIT 1`, email).toArray();

        if (invites.length === 0) {
            return Response.json(null);
        }

        return Response.json(invites[0]);
    },

    /**
     * Update a pending invite (role and/or expiry).
     * @param {Object} sql - SQLite interface
     * @param {string} token - Invite token
     * @param {Object} data - Update data
     * @param {string} data.role - New role (optional)
     * @param {string} data.expiresAt - New expiry date (optional)
     * @returns {Response} JSON response
     */
    updatePendingInvite(sql, token, { role, expiresAt }) {
        const updates = [];
        const params = [];

        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (expiresAt) {
            updates.push('expires_at = ?');
            params.push(expiresAt);
        }

        if (updates.length === 0) {
            return Response.json({ error: 'No updates provided' }, { status: 400 });
        }

        params.push(token);
        const result = sql.exec(`UPDATE pending_invites SET ${updates.join(', ')} WHERE token = ? RETURNING *`, ...params);

        const updated = result.toArray();
        if (updated.length === 0) {
            return Response.json({ error: 'Invite not found' }, { status: 404 });
        }

        return Response.json({ success: true, invite: updated[0] });
    },

    /**
     * Remove a pending invite by token.
     * @param {Object} sql - SQLite interface
     * @param {string} token - Invite token
     * @returns {Response} JSON response
     */
    removePendingInvite(sql, token) {
        const result = sql.exec(`DELETE FROM pending_invites WHERE token = ? RETURNING *`, token);

        const deleted = result.toArray();
        if (deleted.length === 0) {
            return Response.json({ error: 'Invite not found' }, { status: 404 });
        }

        return Response.json({ success: true });
    },
};

/**
 * Audit log handler implementations.
 * These methods should be bound to the Durable Object instance.
 */
export const auditLogHandlers = {
    /**
     * Get audit logs with pagination.
     * @param {Object} sql - SQLite interface
     * @param {number} limit - Number of logs to fetch
     * @param {number} offset - Offset for pagination
     * @param {boolean} includeFirmlyAdmin - Include Firmly admin actions
     * @returns {Response} JSON response with logs array and pagination info
     */
    getAuditLogs(sql, limit, offset, includeFirmlyAdmin = false) {
        // Regular users don't see Firmly admin actions
        const whereClause = includeFirmlyAdmin ? '' : 'WHERE is_firmly_admin = 0';

        const logs = sql.exec(`SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`, limit, offset).toArray();

        const countResult = sql.exec(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`).toArray();
        const total = countResult[0]?.total || 0;

        return Response.json({ logs, total, limit, offset });
    },

    /**
     * Create an audit log entry.
     * @param {Object} sql - SQLite interface
     * @param {Object} data - Audit log data
     * @param {string} data.eventType - Event type
     * @param {string} data.actorId - Actor user ID
     * @param {string} data.actorEmail - Actor email
     * @param {string} data.targetId - Target user ID (optional)
     * @param {string} data.targetEmail - Target email (optional)
     * @param {Object} data.details - Additional details (optional)
     * @param {boolean} data.isFirmlyAdmin - Whether actor is a Firmly admin
     * @param {string} data.actorType - Type of actor
     * @returns {Response} JSON response
     */
    createAuditLog(sql, { eventType, actorId, actorEmail, targetId, targetEmail, details, isFirmlyAdmin = false, actorType = 'user' }) {
        const detailsJson = details ? JSON.stringify(details) : null;

        sql.exec(
            `INSERT INTO audit_logs (event_type, actor_id, actor_email, target_id, target_email, details, is_firmly_admin, actor_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            eventType,
            actorId,
            actorEmail,
            targetId || null,
            targetEmail || null,
            detailsJson,
            isFirmlyAdmin ? 1 : 0,
            actorType,
        );

        return Response.json({ success: true });
    },
};

/**
 * Clear team, pending invites, and audit log tables (for reset functionality).
 * @param {Object} sql - SQLite interface
 * @returns {Object} { teamMembers, pendingInvites } that were cleared
 */
export function clearTeamAndAuditLogs(sql) {
    const teamMembers = sql.exec('SELECT user_id, user_email, role FROM team').toArray();
    const pendingInvites = sql.exec('SELECT token, email, role FROM pending_invites').toArray();
    sql.exec('DELETE FROM team');
    sql.exec('DELETE FROM pending_invites');
    sql.exec('DELETE FROM audit_logs');
    return { teamMembers, pendingInvites };
}
