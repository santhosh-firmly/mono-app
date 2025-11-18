import { describe, it, expect, vi } from 'vitest';
import { withErrorHandling } from './error-handler.js';
import { BaseError } from '../errors/index.js';

describe('withErrorHandling', () => {
	it('should return response unchanged if no error occurs', async () => {
		const mockHandler = vi.fn().mockResolvedValue(new Response('success'));
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler('arg1', 'arg2');
		
		expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2');
		expect(response).toBeInstanceOf(Response);
		await expect(response.text()).resolves.toBe('success');
	});

	it('should add CORS headers to successful responses', async () => {
		const mockHandler = vi.fn().mockResolvedValue(
			new Response('success', { headers: { 'Content-Type': 'application/json' } })
		);
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler();
		
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
		expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
		expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
		expect(response.headers.get('Content-Type')).toBe('application/json');
	});

	it('should return non-Response values unchanged', async () => {
		const mockHandler = vi.fn().mockResolvedValue('not a response');
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const result = await wrappedHandler();
		
		expect(result).toBe('not a response');
	});

	it('should handle BaseError instances', async () => {
		const mockError = new BaseError('test error', 'TEST_ERROR', 400);
		mockError.toResponse = vi.fn().mockReturnValue(new Response('error response', { status: 400 }));
		
		const mockHandler = vi.fn().mockRejectedValue(mockError);
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler();
		
		expect(mockError.toResponse).toHaveBeenCalled();
		expect(response.status).toBe(400);
		await expect(response.text()).resolves.toBe('error response');
	});

	it('should wrap unknown errors in InternalError', async () => {
		const mockHandler = vi.fn().mockRejectedValue(new Error('unknown error'));
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler();
		
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toContain('Internal server error');
		expect(body.code).toBe('INTERNAL_ERROR');
	});

	it('should handle errors without message', async () => {
		const mockHandler = vi.fn().mockRejectedValue(new Error());
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler();
		
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toContain('Internal server error');
	});

	it('should handle non-Error objects', async () => {
		const mockHandler = vi.fn().mockRejectedValue('string error');
		const wrappedHandler = withErrorHandling(mockHandler);
		
		const response = await wrappedHandler();
		
		expect(response.status).toBe(500);
		const body = await response.json();
		expect(body.error).toContain('Internal server error');
	});
});
