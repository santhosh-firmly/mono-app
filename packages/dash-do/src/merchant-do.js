import { BaseDurableObject } from 'foundation/durable-objects/durable-object-base.js';
import { getLogger } from 'foundation/utils/log.js';

const logger = getLogger('MerchantDO');

/**
 * Matches a URL path against a route pattern.
 * Supports exact matches and :param patterns.
 * @returns {Object|null} - Match result with params, or null if no match
 */
function matchRoute(routePath, actualPath) {
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);

    if (routeParts.length !== actualParts.length) {
        return null;
    }

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = decodeURIComponent(actualParts[i]);
        } else if (routeParts[i] !== actualParts[i]) {
            return null;
        }
    }

    return { params };
}

/**
 * MerchantDO - Durable Object for per-merchant data storage.
 *
 * Each merchant has their own Durable Object instance identified by their domain.
 * Uses SQLite for persistent storage of team membership and audit logs.
 */
export class MerchantDO extends BaseDurableObject {
    // Route configuration - order matters: exact matches should come before parameterized routes
    static routes = [
        // Team endpoints
        { path: '/team', method: 'GET', handler: 'handleGetTeam' },
        { path: '/team', method: 'POST', handler: 'handleAddTeamMember', needsJson: true },
        { path: '/team/:userId', method: 'PUT', handler: 'handleUpdateTeamMember', needsJson: true },
        { path: '/team/:userId', method: 'DELETE', handler: 'handleRemoveTeamMember' },

        // Audit log endpoints
        { path: '/audit-logs', method: 'GET', handler: 'handleGetAuditLogs' },
        { path: '/audit-logs', method: 'POST', handler: 'handleCreateAuditLog', needsJson: true },

        // Agreement endpoints
        { path: '/agreement', method: 'GET', handler: 'handleGetAgreement' },
        { path: '/agreement', method: 'POST', handler: 'handleSignAgreement', needsJson: true },

        // Onboarding status endpoints
        { path: '/onboarding', method: 'GET', handler: 'handleGetOnboardingStatus' },
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
        // Team membership table
        this.sql.exec(`
			CREATE TABLE IF NOT EXISTS team (
				user_id TEXT PRIMARY KEY,
				user_email TEXT NOT NULL,
				role TEXT NOT NULL DEFAULT 'viewer',
				granted_at TEXT DEFAULT (datetime('now')),
				granted_by TEXT
			)
		`);

        // Audit logs table
        this.sql.exec(`
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
            this.sql.exec(`ALTER TABLE audit_logs ADD COLUMN is_firmly_admin INTEGER DEFAULT 0`);
        } catch {
            // Column already exists, ignore error
        }

        // Migration: add actor_type column to existing tables
        try {
            this.sql.exec(`ALTER TABLE audit_logs ADD COLUMN actor_type TEXT DEFAULT 'user'`);
        } catch {
            // Column already exists, ignore error
        }

        // Index for efficient audit log queries
        this.sql.exec(`
			CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)
		`);

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
            // Find matching route
            for (const route of MerchantDO.routes) {
                if (route.method !== method) continue;

                const match = matchRoute(route.path, path);
                if (!match) continue;

                // Build handler arguments - path params come first, then JSON body
                const args = [];

                // Add path parameters first
                const paramValues = Object.values(match.params);
                args.push(...paramValues);

                // Add JSON body if needed (after path params)
                if (route.needsJson) {
                    args.push(await request.json());
                }

                // Special handling for audit-logs GET (needs query params)
                if (route.handler === 'handleGetAuditLogs') {
                    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
                    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
                    const includeFirmlyAdmin = url.searchParams.get('includeFirmlyAdmin') === 'true';
                    args.push(limit, offset, includeFirmlyAdmin);
                }

                return this[route.handler](...args);
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

    // Team methods
    handleGetTeam() {
        const team = this.sql.exec('SELECT * FROM team ORDER BY granted_at ASC').toArray();
        return Response.json(team);
    }

    handleAddTeamMember({ userId, userEmail, role = 'viewer', grantedBy }) {
        this.sql.exec(
            `INSERT OR REPLACE INTO team (user_id, user_email, role, granted_at, granted_by)
			 VALUES (?, ?, ?, datetime('now'), ?)`,
            userId,
            userEmail,
            role,
            grantedBy,
        );
        return Response.json({ success: true });
    }

    handleUpdateTeamMember(userId, { role }) {
        const result = this.sql.exec(`UPDATE team SET role = ? WHERE user_id = ? RETURNING *`, role, userId);

        const updated = result.toArray();
        if (updated.length === 0) {
            return Response.json({ error: 'Team member not found' }, { status: 404 });
        }

        return Response.json({ success: true, member: updated[0] });
    }

    handleRemoveTeamMember(userId) {
        const result = this.sql.exec(`DELETE FROM team WHERE user_id = ? RETURNING *`, userId);

        const deleted = result.toArray();
        if (deleted.length === 0) {
            return Response.json({ error: 'Team member not found' }, { status: 404 });
        }

        return Response.json({ success: true });
    }

    // Audit log methods
    handleGetAuditLogs(limit, offset, includeFirmlyAdmin = false) {
        // Regular users don't see Firmly admin actions
        const whereClause = includeFirmlyAdmin ? '' : 'WHERE is_firmly_admin = 0';

        const logs = this.sql.exec(`SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`, limit, offset).toArray();

        const countResult = this.sql.exec(`SELECT COUNT(*) as total FROM audit_logs ${whereClause}`).toArray();
        const total = countResult[0]?.total || 0;

        return Response.json({ logs, total, limit, offset });
    }

    handleCreateAuditLog({ eventType, actorId, actorEmail, targetId, targetEmail, details, isFirmlyAdmin = false, actorType = 'user' }) {
        const detailsJson = details ? JSON.stringify(details) : null;

        this.sql.exec(
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
    }

    // Agreement methods
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

    // Onboarding status methods
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

    // Catalog config methods
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

    // Integration steps methods
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
}
