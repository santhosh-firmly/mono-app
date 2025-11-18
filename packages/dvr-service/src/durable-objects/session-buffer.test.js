import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { env } from 'cloudflare:test';
import { SessionBuffer } from './session-buffer.js';

describe('SessionBuffer Durable Object', () => {
	let instance;

	beforeEach(() => {
		// Mock state with storage alarm functionality
		const mockState = {
			id: 'test-do-id',
			storage: {
				setAlarm: vi.fn(),
				deleteAlarm: vi.fn(),
				getAlarm: vi.fn().mockResolvedValue(null)
			}
		};
		// Use real env from cloudflare:test
		instance = new SessionBuffer(mockState, env);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('/append endpoint', () => {
		it('should append events successfully', async () => {
			const events = [
				{ type: 1, timestamp: 1000, data: { x: 1 } },
				{ type: 2, timestamp: 2000, data: { y: 2 } }
			];

			const request = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});

			const response = await instance.fetch(request);

			expect(response.status).toBe(200);
			const result = await response.json();
			expect(result).toEqual({
				success: true,
				buffered: true,
				eventCount: 2
			});
		});

		it('should throw MissingParameterError for missing sessionId', async () => {
			const events = [{ type: 1, timestamp: 1000 }];

			const request = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ events })
			});

			const response = await instance.fetch(request);

			expect(response.status).toBe(400);
			const result = await response.json();
			expect(result.code).toBe('MISSING_PARAMETER');
			expect(result.error).toContain('sessionId');
		});

		it('should throw InvalidRequestError for invalid events', async () => {
			const request = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events: 'invalid' })
			});

			const response = await instance.fetch(request);

			expect(response.status).toBe(400);
			const result = await response.json();
			expect(result.code).toBe('INVALID_REQUEST');
			expect(result.error).toContain('events must be an array');
		});

		it('should handle empty events array', async () => {
			const request = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events: [] })
			});

			const response = await instance.fetch(request);

			expect(response.status).toBe(200);
			const result = await response.json();
			expect(result.eventCount).toBe(0);
		});
	});

	describe('/finalize endpoint', () => {
		it('should finalize session successfully', async () => {
			// First append some events
			const events = [{ type: 1, timestamp: 1000 }];
			const appendRequest = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});
			await instance.fetch(appendRequest);

			// Then finalize
			const finalizeRequest = new Request('http://internal/finalize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session' })
			});
			const response = await instance.fetch(finalizeRequest);

			expect(response.status).toBe(200);
			const result = await response.json();
			expect(result.success).toBe(true);
			expect(result.finalized).toBe(true);
			expect(result.sessionData.events).toEqual(events);
			expect(result.sessionData.metadata.sessionId).toBe('test-session');
			expect(result.sessionData.metadata.eventCount).toBe(1);
		});

		it('should finalize empty session', async () => {
			const request = new Request('http://internal/finalize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session' })
			});
			const response = await instance.fetch(request);

			expect(response.status).toBe(200);
			const result = await response.json();
			expect(result.success).toBe(true);
			expect(result.finalized).toBe(true);
			expect(result.sessionData.events).toEqual([]);
		});
	});

	describe('unknown endpoints', () => {
		it('should return 404 for unknown paths', async () => {
			const request = new Request('http://internal/unknown', {
				method: 'GET'
			});
			const response = await instance.fetch(request);

			expect(response.status).toBe(404);
			expect(await response.text()).toBe('Not found');
		});

		it('should return 404 for wrong methods', async () => {
			const request = new Request('http://internal/append', {
				method: 'GET'
			});
			const response = await instance.fetch(request);

			expect(response.status).toBe(404);
		});
	});

	describe('session metadata calculation', () => {
		it('should calculate correct metadata for events', async () => {
			const events = [
				{ type: 1, timestamp: 1000 },
				{ type: 2, timestamp: 2000 },
				{ type: 3, timestamp: 3000 }
			];

			const appendRequest = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});
			await instance.fetch(appendRequest);

			const finalizeRequest = new Request('http://internal/finalize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session' })
			});
			const finalizeResponse = await instance.fetch(finalizeRequest);

			const result = await finalizeResponse.json();
			expect(result.sessionData.metadata.eventCount).toBe(3);
			expect(result.sessionData.metadata.duration).toBe(2000); // 3000 - 1000
			expect(result.sessionData.metadata.url).toBe('Unknown'); // No META events
		});
	});

	describe('alarm functionality', () => {
		it('should set alarm when appending events', async () => {
			const events = [{ type: 1, timestamp: 1000 }];

			const request = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});

			await instance.fetch(request);

			expect(instance.state.storage.setAlarm).toHaveBeenCalledWith(expect.any(Number));
		});

		it('should clear alarm when finalizing', async () => {
			// First append to set alarm
			const events = [{ type: 1, timestamp: 1000 }];
			const appendRequest = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});
			await instance.fetch(appendRequest);

			// Then finalize
			const finalizeRequest = new Request('http://internal/finalize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session' })
			});
			await instance.fetch(finalizeRequest);

			expect(instance.state.storage.deleteAlarm).toHaveBeenCalled();
		});

		it('should handle alarm trigger correctly', async () => {
			// Set up session data
			const events = [{ type: 1, timestamp: 1000 }];
			const appendRequest = new Request('http://internal/append', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sessionId: 'test-session', events })
			});
			await instance.fetch(appendRequest);

			// Trigger alarm
			await instance.alarm();

			// Verify session was saved (this would be tested through the persistence adapter)
			// Since we're using real env, the data should be saved
			expect(instance.events).toEqual([]); // Should be cleared after alarm
			expect(instance.sessionId).toBeNull(); // Should be cleared after alarm
		});
	});
});
