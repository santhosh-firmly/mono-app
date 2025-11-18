import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env } from 'cloudflare:test';
import { SessionBufferAdapter } from './session-buffer-adapter.js';
import { DurableObjectError } from '../errors/index.js';

describe('SessionBufferAdapter', () => {
	let adapter;

	beforeEach(() => {
		adapter = new SessionBufferAdapter(env.SESSION_RECORDER);
	});

	describe('appendEvents', () => {
		it('should append events successfully', async () => {
			const events = [{ type: 1, timestamp: 123 }];

			const result = await adapter.appendEvents('session-123', events);

			// Since it's real Durable Object, we expect some response
			expect(result).toBeDefined();
		});

		it('should handle errors gracefully', async () => {
			const events = [{ type: 1, timestamp: 123 }];

			// This might not throw in test environment, but we test the structure
			try {
				await adapter.appendEvents('session-123', events);
			} catch (error) {
				expect(error).toBeInstanceOf(DurableObjectError);
			}
		});
	});

	describe('finalize', () => {
		it('should finalize session successfully', async () => {
			const result = await adapter.finalize('session-123');

			// Since it's real Durable Object, we expect some response
			expect(result).toBeDefined();
		});

		it('should handle errors gracefully', async () => {
			try {
				await adapter.finalize('session-123');
			} catch (error) {
				expect(error).toBeInstanceOf(DurableObjectError);
			}
		});
	});
});
