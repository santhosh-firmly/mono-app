// vitest.coverage.setup.js
import { vi, beforeEach } from 'vitest';

// In-memory storage for coverage mocks
const recordingsStorage = new Map();
const metadataStorage = new Map();

// Clear storage between tests
beforeEach(() => {
	recordingsStorage.clear();
	metadataStorage.clear();
});

// Mock cloudflare:test module for coverage runs
vi.mock('cloudflare:test', () => ({
	env: {
		RECORDINGS: {
			put: vi.fn((key, value) => {
				recordingsStorage.set(key, value);
				return Promise.resolve();
			}),
			get: vi.fn((key) => {
				const value = recordingsStorage.get(key);
				if (value) {
					return Promise.resolve(new Response(value));
				}
				return Promise.resolve(null);
			}),
			delete: vi.fn((key) => {
				recordingsStorage.delete(key);
				return Promise.resolve();
			}),
			list: vi.fn(() => {
				const keys = Array.from(recordingsStorage.keys()).map((key) => ({ name: key }));
				return Promise.resolve({
					keys: () => keys,
					size: recordingsStorage.size
				});
			})
		},
		METADATA: {
			put: vi.fn((key, value) => {
				metadataStorage.set(key, value);
				return Promise.resolve();
			}),
			get: vi.fn((key) => {
				const value = metadataStorage.get(key);
				if (value) {
					return Promise.resolve(value); // Metadata is stored as parsed JSON
				}
				return Promise.resolve(null);
			}),
			delete: vi.fn((key) => {
				metadataStorage.delete(key);
				return Promise.resolve();
			}),
			list: vi.fn(() => {
				const keys = Array.from(metadataStorage.keys()).map((key) => ({ name: key }));
				return Promise.resolve({
					keys: () => keys,
					size: metadataStorage.size
				});
			})
		},
		SESSION_RECORDER: {
			idFromName: vi.fn((name) => ({ name })),
			get: vi.fn(() => ({
				fetch: vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })))
			}))
		}
	},
	createExecutionContext: vi.fn(() => ({})),
	waitOnExecutionContext: vi.fn()
}));
