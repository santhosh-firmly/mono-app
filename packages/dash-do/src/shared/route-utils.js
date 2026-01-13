/**
 * Shared routing utilities for Durable Objects.
 */

/**
 * Matches a URL path against a route pattern.
 * Supports exact matches and :param patterns.
 * @param {string} routePath - Route pattern (e.g., '/team/:userId')
 * @param {string} actualPath - Actual request path
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
 * Creates a route handler that processes requests based on route configuration.
 * @param {Object} context - Handler context
 * @param {Object} context.routes - Array of route definitions
 * @param {Object} context.handlers - Object with handler methods
 * @param {Request} request - Incoming request
 * @param {Object} options - Additional options
 * @param {Function} options.onAuditLogs - Custom handler for audit logs query params
 * @returns {Promise<Response|null>} Response or null if no route matched
 */
export async function handleRoutes({ routes, handlers, request, options = {} }) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    for (const route of routes) {
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
        if (route.handler === 'handleGetAuditLogs' || options.onAuditLogs?.(route)) {
            const limit = parseInt(url.searchParams.get('limit') || '50', 10);
            const offset = parseInt(url.searchParams.get('offset') || '0', 10);
            const includeFirmlyAdmin = url.searchParams.get('includeFirmlyAdmin') === 'true';
            args.push(limit, offset, includeFirmlyAdmin);
        }

        // Special handling for pending-invites GET (needs includeFirmlyAdmin query param)
        if (route.handler === 'handleGetPendingInvites') {
            const includeFirmlyAdmin = url.searchParams.get('includeFirmlyAdmin') === 'true';
            args.push(includeFirmlyAdmin);
        }

        return handlers[route.handler](...args);
    }

    return null;
}
