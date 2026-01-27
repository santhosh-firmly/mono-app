import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { browserFetch, setFetchErrorHandler } from '$lib/utils/browser-fetch.js';

describe('browser-fetch', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				status: 200,
				json: () => Promise.resolve({ data: 'test' }),
				headers: new Map([['content-type', 'application/json']])
			})
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		setFetchErrorHandler(null);
	});

	describe('browserFetch', () => {
		it('makes GET request by default', async () => {
			const result = await browserFetch('https://api.example.com/data');

			expect(fetch).toHaveBeenCalledWith(
				'https://api.example.com/data',
				expect.objectContaining({
					credentials: 'include'
				})
			);
			expect(result.status).toBe(200);
		});

		it('returns status and parsed JSON data', async () => {
			fetch.mockResolvedValueOnce({
				status: 200,
				json: () => Promise.resolve({ message: 'success' }),
				headers: new Map()
			});

			const result = await browserFetch('https://api.example.com/data');

			expect(result).toEqual({
				status: 200,
				data: { message: 'success' }
			});
		});

		it('handles non-200 responses', async () => {
			fetch.mockResolvedValueOnce({
				status: 404,
				json: () => Promise.resolve({ error: 'Not found' }),
				headers: new Map()
			});

			const result = await browserFetch('https://api.example.com/data');

			expect(result.status).toBe(404);
			expect(result.data).toEqual({ error: 'Not found' });
		});

		it('handles JSON parse errors gracefully', async () => {
			fetch.mockResolvedValueOnce({
				status: 200,
				json: () => Promise.reject(new Error('Invalid JSON')),
				headers: new Map()
			});

			const result = await browserFetch('https://api.example.com/data');

			expect(result.status).toBe(200);
			expect(result.data).toBeUndefined();
		});

		it('handles network errors', async () => {
			fetch.mockRejectedValueOnce(new Error('Network error'));

			const result = await browserFetch('https://api.example.com/data');

			expect(result.status).toBe(460);
			expect(result.data.error).toBe('NetworkError');
		});

		it('merges options with credentials', async () => {
			await browserFetch('https://api.example.com/data', {
				method: 'POST',
				body: JSON.stringify({ test: true })
			});

			expect(fetch).toHaveBeenCalledWith(
				'https://api.example.com/data',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify({ test: true }),
					credentials: 'include'
				})
			);
		});
	});

	describe('setFetchErrorHandler', () => {
		it('calls error handler on non-200 responses', async () => {
			const errorHandler = vi.fn();
			setFetchErrorHandler(errorHandler);

			fetch.mockResolvedValueOnce({
				status: 500,
				json: () =>
					Promise.resolve({
						code: 'SERVER_ERROR',
						description: 'Internal server error',
						error: 'ServerError'
					}),
				headers: new Map([['x-request-id', '123']])
			});

			await browserFetch('https://api.example.com/data', { method: 'POST' });

			expect(errorHandler).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://api.example.com/data',
					method: 'POST',
					status: 500,
					code: 'SERVER_ERROR',
					description: 'Internal server error',
					error: 'ServerError'
				})
			);
		});

		it('does not call error handler on 200 responses', async () => {
			const errorHandler = vi.fn();
			setFetchErrorHandler(errorHandler);

			await browserFetch('https://api.example.com/data');

			expect(errorHandler).not.toHaveBeenCalled();
		});

		it('handles error handler exceptions gracefully', async () => {
			const errorHandler = vi.fn().mockImplementation(() => {
				throw new Error('Handler error');
			});
			setFetchErrorHandler(errorHandler);

			fetch.mockResolvedValueOnce({
				status: 500,
				json: () => Promise.resolve({ error: 'test' }),
				headers: new Map()
			});

			const result = await browserFetch('https://api.example.com/data');

			expect(result.status).toBe(500);
		});
	});

	describe('semaphore behavior', () => {
		it('serializes concurrent requests', async () => {
			const callOrder = [];

			fetch
				.mockImplementationOnce(
					() =>
						new Promise((resolve) => {
							setTimeout(() => {
								callOrder.push(1);
								resolve({
									status: 200,
									json: () => Promise.resolve({ id: 1 }),
									headers: new Map()
								});
							}, 50);
						})
				)
				.mockImplementationOnce(() => {
					callOrder.push(2);
					return Promise.resolve({
						status: 200,
						json: () => Promise.resolve({ id: 2 }),
						headers: new Map()
					});
				});

			const promise1 = browserFetch('https://api.example.com/1');
			const promise2 = browserFetch('https://api.example.com/2');

			const [result1, result2] = await Promise.all([promise1, promise2]);

			expect(result1.data.id).toBe(1);
			expect(result2.data.id).toBe(2);
			expect(callOrder).toEqual([1, 2]);
		});
	});
});
