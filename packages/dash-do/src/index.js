/**
 * Dash Durable Objects Worker
 *
 * This worker hosts Durable Objects for the dash application:
 * - DashUserDO: Per-user data storage (sessions, merchant access, destination access, preferences)
 * - MerchantDO: Per-merchant data storage (team membership, audit logs, agreement, onboarding)
 * - DestinationDO: Per-destination data storage (team membership, audit logs, profile, invites)
 *
 * The dash SvelteKit app connects to this worker via service binding.
 */

import { initializeLocalStorage } from 'foundation/data-management/strategies/local-storage.js';
import { cloudflareDurableObjectWrapper } from 'foundation/server/metrics/honeycomb/wrappers/durable-objects-wrapper.js';

import localStorageSource from '../data.json';
import { name, version } from '../package.json';

import { DashUserDO as DashUserDOClass } from './dash-user-do.js';
import { MerchantDO as MerchantDOClass } from './merchant-do.js';
import { DestinationDO as DestinationDOClass } from './destination-do.js';

const metricsConfig = {
    data: {
        version,
    },
    redactRequestHeaders: ['authorization', 'cookie'],
    serviceName: name,
};

initializeLocalStorage(localStorageSource);

export const DashUserDO = cloudflareDurableObjectWrapper(metricsConfig, DashUserDOClass, 'dash-user');
export const MerchantDO = cloudflareDurableObjectWrapper(metricsConfig, MerchantDOClass, 'merchant');
export const DestinationDO = cloudflareDurableObjectWrapper(metricsConfig, DestinationDOClass, 'destination');

export default {
    /**
     * Handle incoming requests from the dash app via service binding.
     * Routes requests to the appropriate Durable Object based on headers:
     * - X-User-ID -> DashUserDO
     * - X-Merchant-Domain -> MerchantDO
     * - X-Destination-AppId -> DestinationDO
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        // Health check endpoint
        if (url.pathname === '/health') {
            return new Response(JSON.stringify({ status: 'ok' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check for Destination AppId header (routes to DestinationDO)
        const destinationAppId = request.headers.get('X-Destination-AppId');
        if (destinationAppId) {
            const doId = env.DESTINATION_DO.idFromName(destinationAppId);
            const stub = env.DESTINATION_DO.get(doId);

            return stub.fetch(
                new Request(url.toString(), {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                }),
            );
        }

        // Check for Merchant Domain header (routes to MerchantDO)
        const merchantDomain = request.headers.get('X-Merchant-Domain');
        if (merchantDomain) {
            const doId = env.MERCHANT_DO.idFromName(merchantDomain);
            const stub = env.MERCHANT_DO.get(doId);

            return stub.fetch(
                new Request(url.toString(), {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                }),
            );
        }

        // Check for User ID header (routes to DashUserDO)
        const userId = request.headers.get('X-User-ID');
        if (userId) {
            const doId = env.DASH_USER_DO.idFromName(userId);
            const stub = env.DASH_USER_DO.get(doId);

            return stub.fetch(
                new Request(url.toString(), {
                    method: request.method,
                    headers: request.headers,
                    body: request.body,
                }),
            );
        }

        // No routing header provided
        return new Response(JSON.stringify({ error: 'X-User-ID, X-Merchant-Domain, or X-Destination-AppId header is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    },
};
