import { BaseDurableObject } from 'foundation/durable-objects/durable-object-base.js';
import { getLogger } from 'foundation/utils/log.js';

import { handleRoutes } from './shared/route-utils.js';
import {
    teamRoutes,
    auditLogRoutes,
    pendingInviteRoutes,
    initializeTeamSchema,
    initializeAuditLogSchema,
    initializePendingInvitesSchema,
    teamHandlers,
    auditLogHandlers,
    pendingInviteHandlers,
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

        // Pending invite endpoints (from shared)
        ...pendingInviteRoutes,

        // Audit log endpoints (from shared)
        ...auditLogRoutes,

        // Profile endpoints
        { path: '/profile', method: 'GET', handler: 'handleGetProfile' },
        { path: '/profile', method: 'PUT', handler: 'handleUpdateProfile', needsJson: true },
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

        // Pending invites table (shared)
        initializePendingInvitesSchema(this.sql);

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
    // Pending invite methods (delegating to shared handlers)
    // ============================================================================

    handleGetPendingInvites() {
        return pendingInviteHandlers.getPendingInvites(this.sql);
    }

    handleAddPendingInvite(data) {
        return pendingInviteHandlers.addPendingInvite(this.sql, data);
    }

    handleGetPendingInviteByEmail(email) {
        return pendingInviteHandlers.getPendingInviteByEmail(this.sql, email);
    }

    handleUpdatePendingInvite(token, data) {
        return pendingInviteHandlers.updatePendingInvite(this.sql, token, data);
    }

    handleRemovePendingInvite(token) {
        return pendingInviteHandlers.removePendingInvite(this.sql, token);
    }

    // ============================================================================
    // Reset method
    // ============================================================================

    handleReset() {
        // Get team members and pending invites before deletion (for returning affected users)
        const { teamMembers, pendingInvites } = clearTeamAndAuditLogs(this.sql);

        // Clear destination-specific tables
        this.sql.exec(`UPDATE profile SET data = '{}' WHERE id = 1`);

        return Response.json({
            success: true,
            clearedTeamMembers: teamMembers,
            clearedPendingInvites: pendingInvites,
        });
    }
}
