// We need to disable this verification since the config has no extension in this library
// eslint-disable-next-line import/extensions, import/no-unresolved
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
    test: {
        testTimeout: 20000,
        mockReset: true,
        restoreMocks: true,
        clearMocks: true,
        poolOptions: {
            workers: {
                wrangler: {
                    configPath: './wrangler.jsonc',
                },
                miniflare: {
                    compatibilityFlags: ['nodejs_compat'],
                    compatibilityDate: '2025-01-21',
                },
                // Workaround for known bug with SQLite-based Durable Objects
                // See: https://github.com/cloudflare/workers-sdk/issues/11031
                isolatedStorage: false,
                singleWorker: true,
            },
        },
    },
});
