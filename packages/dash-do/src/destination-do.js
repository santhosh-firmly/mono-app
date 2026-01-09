import { BaseDurableObject } from 'foundation/durable-objects/durable-object-base.js';
import { getLogger } from 'foundation/utils/log.js';
import { matchRoute, handleRoutes } from './shared/route-utils.js';
import {
    teamRoutes,
    auditLogRoutes,
    initializeTeamSchema,
    initializeAuditLogSchema,
    teamHandlers,
    auditLogHandlers,
    clearTeamAndAuditLogs,
} from './shared/team-audit-mixin.js';

const logger = getLogger('DestinationDO');

/**
 * DestinationDO - Durable Object for per-destination data storage.
 *
 * Each destination has their own Durable Object instance identified by their app_id.
 * Uses SQLite for persistent storage of team membership, audit logs, profile, and invites.
 */
export class DestinationDO extends BaseDurableObject {
    // Route configuration - order matters: exact matches should come before parameterized routes
    static routes = [
        // Team endpoints (from shared)
        ...teamRoutes,

        // Audit log endpoints (from shared)
        ...auditLogRoutes,

        // Profile endpoints
        { path: '/profile', method: 'GET', handler: 'handleGetProfile' },
        { path: '/profile', method: 'PUT', handler: 'handleUpdateProfile', needsJson: true },

        // Invite endpoints
        { path: '/invites', method: 'GET', handler: 'handleGetInvites' },
        { path: '/invites', method: 'POST', handler: 'handleCreateInvite', needsJson: true },
        { path: '/invites/:inviteId', method: 'DELETE', handler: 'handleCancelInvite' },
    ];

    constructor(ctx, env) {
        super(ctx, env);
        this.ctx = ctx;
        this.env = env;
        this.sql = ctx.storage.sql;

        // Initialize schema on first request
        this.initialized = this.initializeSchema();
    }

    async initializeSchema() {
        // Team membership table (shared)
        initializeTeamSchema(this.sql);

        // Audit logs table (shared)
        initializeAuditLogSchema(this.sql);

        // Profile table (destination-specific settings)
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                data TEXT NOT NULL DEFAULT '{}'
            )
        `);

        // Initialize profile row if not exists
        this.sql.exec(`INSERT OR IGNORE INTO profile (id, data) VALUES (1, '{}')`);

        // Invites table (pending team invites)
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS invites (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                invited_by TEXT,
                invited_by_email TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                expires_at TEXT
            )
        `);

        // Index for efficient invite lookups
        this.sql.exec(`
            CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email)
        `);
    }

    async fetch(request) {
        await this.initialized;

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // Use shared route handler
            const response = await handleRoutes({
                routes: DestinationDO.routes,
                handlers: this,
                request,
                options: {
                    onAuditLogs: (route) => route.handler === 'handleGetAuditLogs',
                },
            });

            if (response) {
                return response;
            }

            // Reset endpoint (admin only)
            if (path === '/reset' && method === 'POST') {
                return this.handleReset();
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

    // ============================================================================
    // Team methods (delegating to shared handlers)
    // ============================================================================

    handleGetTeam() {
        return teamHandlers.getTeam(this.sql);
    }

    handleAddTeamMember(data) {
        return teamHandlers.addTeamMember(this.sql, data);
    }

    handleUpdateTeamMember(userId, data) {
        return teamHandlers.updateTeamMember(this.sql, userId, data);
    }

    handleRemoveTeamMember(userId) {
        return teamHandlers.removeTeamMember(this.sql, userId);
    }

    // ============================================================================
    // Audit log methods (delegating to shared handlers)
    // ============================================================================

    handleGetAuditLogs(limit, offset, includeFirmlyAdmin) {
        return auditLogHandlers.getAuditLogs(this.sql, limit, offset, includeFirmlyAdmin);
    }

    handleCreateAuditLog(data) {
        return auditLogHandlers.createAuditLog(this.sql, data);
    }

    // ============================================================================
    // Profile methods
    // ============================================================================

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

    // ============================================================================
    // Invite methods
    // ============================================================================

    handleGetInvites() {
        // Clean up expired invites first (garbage collection)
        this.sql.exec(`DELETE FROM invites WHERE datetime(expires_at) <= datetime('now')`);

        const invites = this.sql
            .exec(
                `SELECT id, email, role, invited_by, invited_by_email, created_at, expires_at
                 FROM invites
                 ORDER BY created_at DESC`,
            )
            .toArray();
        return Response.json(invites);
    }

    handleCreateInvite({ email, role, invitedBy, invitedByEmail }) {
        // Clean up expired invites first
        this.sql.exec(`DELETE FROM invites WHERE datetime(expires_at) <= datetime('now')`);

        // Check if invite already exists for this email
        const existing = this.sql.exec('SELECT id FROM invites WHERE email = ?', email).toArray();

        if (existing.length > 0) {
            return Response.json({ error: 'Invite already exists for this email' }, { status: 400 });
        }

        // Check if user is already a team member
        const teamMember = this.sql.exec('SELECT user_id FROM team WHERE user_email = ?', email).toArray();

        if (teamMember.length > 0) {
            return Response.json({ error: 'User is already a team member' }, { status: 400 });
        }

        const inviteId = crypto.randomUUID();
        // Invites expire in 7 days
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        this.sql.exec(
            `INSERT INTO invites (id, email, role, invited_by, invited_by_email, expires_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            inviteId,
            email,
            role || 'viewer',
            invitedBy || null,
            invitedByEmail || null,
            expiresAt,
        );

        const invite = this.sql.exec('SELECT * FROM invites WHERE id = ?', inviteId).toArray()[0];

        return Response.json(invite);
    }

    handleCancelInvite(inviteId) {
        const result = this.sql.exec(`DELETE FROM invites WHERE id = ? RETURNING *`, inviteId);

        const deleted = result.toArray();
        if (deleted.length === 0) {
            return Response.json({ error: 'Invite not found' }, { status: 404 });
        }

        return Response.json({ success: true });
    }

    // ============================================================================
    // Reset method
    // ============================================================================

    handleReset() {
        // Get team members before deletion (for returning affected users)
        const clearedTeamMembers = clearTeamAndAuditLogs(this.sql);

        // Clear destination-specific tables
        this.sql.exec('DELETE FROM invites');
        this.sql.exec(`UPDATE profile SET data = '{}' WHERE id = 1`);

        return Response.json({
            success: true,
            clearedTeamMembers,
        });
    }
}
