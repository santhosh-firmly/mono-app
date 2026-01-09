import { BaseDurableObject } from 'foundation/durable-objects/durable-object-base.js';
import { getLogger } from 'foundation/utils/log.js';
import { handleRoutes } from './shared/route-utils.js';
import {
    teamRoutes,
    auditLogRoutes,
    initializeTeamSchema,
    initializeAuditLogSchema,
    teamHandlers,
    auditLogHandlers,
    clearTeamAndAuditLogs,
} from './shared/team-audit-mixin.js';

const logger = getLogger('MerchantDO');

/**
 * MerchantDO - Durable Object for per-merchant data storage.
 *
 * Each merchant has their own Durable Object instance identified by their domain.
 * Uses SQLite for persistent storage of team membership and audit logs.
 */
export class MerchantDO extends BaseDurableObject {
    // Route configuration - order matters: exact matches should come before parameterized routes
    static routes = [
        // Team endpoints (from shared)
        ...teamRoutes,

        // Audit log endpoints (from shared)
        ...auditLogRoutes,

        // Agreement endpoints
        { path: '/agreement', method: 'GET', handler: 'handleGetAgreement' },
        { path: '/agreement', method: 'POST', handler: 'handleSignAgreement', needsJson: true },

        // Onboarding status endpoints
        { path: '/onboarding', method: 'GET', handler: 'handleGetOnboardingStatus' },
        { path: '/onboarding-status-all', method: 'GET', handler: 'handleGetAllOnboardingStatus' },
        { path: '/onboarding/:key', method: 'PUT', handler: 'handleSetOnboardingStatus', needsJson: true },

        // Catalog config endpoints
        { path: '/catalog-config', method: 'GET', handler: 'handleGetCatalogConfig' },
        { path: '/catalog-config', method: 'POST', handler: 'handleSetCatalogConfig', needsJson: true },

        // Integration steps endpoints - /bulk must come before parameterized routes
        { path: '/integration-steps', method: 'GET', handler: 'handleGetIntegrationSteps' },
        { path: '/integration-steps', method: 'PUT', handler: 'handleUpdateIntegrationStep', needsJson: true },
        { path: '/integration-steps/bulk', method: 'PUT', handler: 'handleBulkUpdateIntegrationSteps', needsJson: true },
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

        // Merchant agreement table
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS merchant_agreement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                signed_by_user_id TEXT NOT NULL,
                signed_by_email TEXT NOT NULL,
                signed_at TEXT DEFAULT (datetime('now')),
                browser_info TEXT,
                client_ip TEXT,
                client_location TEXT,
                agreement_version TEXT DEFAULT '1.0'
            )
        `);

        // Onboarding status table
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS onboarding_status (
                key TEXT PRIMARY KEY,
                completed INTEGER DEFAULT 0,
                completed_at TEXT,
                completed_by_user_id TEXT,
                completed_by_email TEXT
            )
        `);

        // Catalog configuration table
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS catalog_config (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                catalog_type TEXT NOT NULL,
                configured_at TEXT DEFAULT (datetime('now')),
                configured_by_user_id TEXT,
                configured_by_email TEXT
            )
        `);

        // Integration steps table
        this.sql.exec(`
            CREATE TABLE IF NOT EXISTS integration_steps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                step_id TEXT NOT NULL,
                substep_id TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                completed_at TEXT,
                completed_by TEXT,
                source TEXT NOT NULL DEFAULT 'api',
                updated_at TEXT DEFAULT (datetime('now')),
                UNIQUE(step_id, substep_id)
            )
        `);

        // Index for efficient integration steps queries
        this.sql.exec(`
            CREATE INDEX IF NOT EXISTS idx_integration_steps_step_id ON integration_steps(step_id)
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
                routes: MerchantDO.routes,
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
    // Agreement methods
    // ============================================================================

    handleGetAgreement() {
        const result = this.sql.exec('SELECT * FROM merchant_agreement ORDER BY signed_at DESC LIMIT 1').toArray();

        if (result.length === 0) {
            return Response.json({ signed: false, agreement: null });
        }

        return Response.json({ signed: true, agreement: result[0] });
    }

    handleSignAgreement({ userId, userEmail, browserInfo, clientIp, clientLocation, agreementVersion = '1.0' }) {
        // Check if already signed
        const existing = this.sql.exec('SELECT * FROM merchant_agreement LIMIT 1').toArray();

        if (existing.length > 0) {
            return Response.json({ error: 'Agreement already signed', agreement: existing[0] }, { status: 400 });
        }

        this.sql.exec(
            `INSERT INTO merchant_agreement (signed_by_user_id, signed_by_email, browser_info, client_ip, client_location, agreement_version)
             VALUES (?, ?, ?, ?, ?, ?)`,
            userId,
            userEmail,
            browserInfo || null,
            clientIp || null,
            clientLocation || null,
            agreementVersion,
        );

        const agreement = this.sql.exec('SELECT * FROM merchant_agreement ORDER BY id DESC LIMIT 1').toArray()[0];

        return Response.json({ success: true, agreement });
    }

    // ============================================================================
    // Onboarding status methods
    // ============================================================================

    handleGetOnboardingStatus() {
        const statuses = this.sql.exec('SELECT * FROM onboarding_status').toArray();

        // Convert to object keyed by status key
        const result = {};
        for (const status of statuses) {
            result[status.key] = {
                completed: status.completed === 1,
                completedAt: status.completed_at,
                completedByUserId: status.completed_by_user_id,
                completedByEmail: status.completed_by_email,
            };
        }

        return Response.json(result);
    }

    /**
     * Returns all onboarding status data in a single response.
     * This batches multiple queries that would otherwise require separate DO calls.
     */
    handleGetAllOnboardingStatus() {
        // Get onboarding statuses (integration, destinations, cdn)
        const onboardingStatuses = this.sql.exec('SELECT * FROM onboarding_status').toArray();
        const statusMap = {};
        for (const status of onboardingStatuses) {
            statusMap[status.key] = status.completed === 1;
        }

        // Get agreement signing status
        const agreementResult = this.sql.exec('SELECT * FROM merchant_agreement LIMIT 1').toArray();
        const agreementSigned = agreementResult.length > 0;

        // Get catalog config status
        const catalogResult = this.sql.exec('SELECT * FROM catalog_config WHERE id = 1').toArray();
        const catalogConfigured = catalogResult.length > 0;

        return Response.json({
            integrationComplete: statusMap['integration'] === true,
            agreementSigned,
            destinationsConfigured: statusMap['destinations'] === true,
            catalogConfigured,
            cdnWhitelistingComplete: statusMap['cdn'] === true,
        });
    }

    handleSetOnboardingStatus(key, { completed, userId, userEmail }) {
        if (completed) {
            this.sql.exec(
                `INSERT INTO onboarding_status (key, completed, completed_at, completed_by_user_id, completed_by_email)
                 VALUES (?, 1, datetime('now'), ?, ?)
                 ON CONFLICT(key) DO UPDATE SET
                    completed = 1,
                    completed_at = datetime('now'),
                    completed_by_user_id = excluded.completed_by_user_id,
                    completed_by_email = excluded.completed_by_email`,
                key,
                userId,
                userEmail,
            );
        } else {
            this.sql.exec(
                `INSERT INTO onboarding_status (key, completed, completed_at, completed_by_user_id, completed_by_email)
                 VALUES (?, 0, NULL, NULL, NULL)
                 ON CONFLICT(key) DO UPDATE SET
                    completed = 0,
                    completed_at = NULL,
                    completed_by_user_id = NULL,
                    completed_by_email = NULL`,
                key,
            );
        }

        return Response.json({ success: true, key, completed });
    }

    // ============================================================================
    // Catalog config methods
    // ============================================================================

    handleGetCatalogConfig() {
        const result = this.sql.exec('SELECT * FROM catalog_config WHERE id = 1').toArray();

        if (result.length === 0) {
            return Response.json({
                hasExistingConfig: false,
                catalogType: null,
                configuredAt: null,
                configuredByUserId: null,
                configuredByEmail: null,
            });
        }

        const config = result[0];
        return Response.json({
            hasExistingConfig: true,
            catalogType: config.catalog_type,
            configuredAt: config.configured_at,
            configuredByUserId: config.configured_by_user_id,
            configuredByEmail: config.configured_by_email,
        });
    }

    handleSetCatalogConfig({ catalogType, userId, userEmail }) {
        // Check if this is the first time saving (for onboarding task completion)
        const existing = this.sql.exec('SELECT * FROM catalog_config WHERE id = 1').toArray();

        const isFirstTimeSave = existing.length === 0;

        this.sql.exec(
            `INSERT INTO catalog_config (id, catalog_type, configured_at, configured_by_user_id, configured_by_email)
             VALUES (1, ?, datetime('now'), ?, ?)
             ON CONFLICT(id) DO UPDATE SET
                catalog_type = excluded.catalog_type,
                configured_at = datetime('now'),
                configured_by_user_id = excluded.configured_by_user_id,
                configured_by_email = excluded.configured_by_email`,
            catalogType,
            userId,
            userEmail,
        );

        return Response.json({
            success: true,
            catalogType,
            isFirstTimeSave,
        });
    }

    // ============================================================================
    // Integration steps methods
    // ============================================================================

    handleGetIntegrationSteps() {
        const steps = this.sql
            .exec(
                `SELECT step_id, substep_id, status, completed_at, completed_by, source, updated_at
                 FROM integration_steps
                 ORDER BY step_id, substep_id`,
            )
            .toArray();

        return Response.json(steps);
    }

    /**
     * Internal method to execute a single integration step update.
     * Returns true if the update was valid, false otherwise.
     */
    _executeIntegrationStepUpdate({ stepId, substepId, status, completedBy, source }) {
        // Validate status
        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            return false;
        }

        // Insert or update the step
        if (status === 'completed') {
            this.sql.exec(
                `INSERT INTO integration_steps (step_id, substep_id, status, completed_at, completed_by, source, updated_at)
                 VALUES (?, ?, ?, datetime('now'), ?, ?, datetime('now'))
                 ON CONFLICT(step_id, substep_id) DO UPDATE SET
                    status = excluded.status,
                    completed_at = datetime('now'),
                    completed_by = excluded.completed_by,
                    source = excluded.source,
                    updated_at = datetime('now')`,
                stepId,
                substepId || null,
                status,
                completedBy || null,
                source || 'api',
            );
        } else {
            // For non-completed statuses, clear completion info
            this.sql.exec(
                `INSERT INTO integration_steps (step_id, substep_id, status, completed_at, completed_by, source, updated_at)
                 VALUES (?, ?, ?, NULL, NULL, ?, datetime('now'))
                 ON CONFLICT(step_id, substep_id) DO UPDATE SET
                    status = excluded.status,
                    completed_at = NULL,
                    completed_by = NULL,
                    source = excluded.source,
                    updated_at = datetime('now')`,
                stepId,
                substepId || null,
                status,
                source || 'api',
            );
        }

        return true;
    }

    handleUpdateIntegrationStep(data) {
        const success = this._executeIntegrationStepUpdate(data);
        if (!success) {
            return Response.json({ error: 'Invalid status' }, { status: 400 });
        }
        return Response.json({ success: true, stepId: data.stepId, substepId: data.substepId, status: data.status });
    }

    async handleBulkUpdateIntegrationSteps({ updates }) {
        if (!Array.isArray(updates)) {
            return Response.json({ error: 'Updates must be an array' }, { status: 400 });
        }

        let updatedCount = 0;
        await this.ctx.storage.transaction(() => {
            for (const update of updates) {
                if (this._executeIntegrationStepUpdate(update)) {
                    updatedCount++;
                }
            }
        });

        return Response.json({ success: true, count: updatedCount });
    }

    // ============================================================================
    // Reset method - clears all merchant data (admin operation)
    // ============================================================================

    handleReset() {
        // Clear team and audit logs using shared helper
        const clearedTeamMembers = clearTeamAndAuditLogs(this.sql);

        // Clear merchant-specific tables
        this.sql.exec('DELETE FROM merchant_agreement');
        this.sql.exec('DELETE FROM onboarding_status');
        this.sql.exec('DELETE FROM catalog_config');
        this.sql.exec('DELETE FROM integration_steps');

        return Response.json({
            success: true,
            clearedTeamMembers,
        });
    }
}
