import { describe, it, expect } from 'vitest';
import { BaseError } from './base-error.js';

describe('BaseError', () => {
	it('should create error with correct properties', () => {
		const error = new BaseError('Test message', 'TEST_CODE', 400);
		
		expect(error.message).toBe('Test message');
		expect(error.code).toBe('TEST_CODE');
		expect(error.statusCode).toBe(400);
		expect(error.name).toBe('BaseError');
		expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
	});

	it('should have default status code of 500', () => {
		const error = new BaseError('Test message', 'TEST_CODE');
		
		expect(error.statusCode).toBeUndefined();
	});

	it('should generate JSON representation', () => {
		const error = new BaseError('Test message', 'TEST_CODE', 400);
		
		const json = error.toJSON();
		expect(json).toEqual({
			error: 'Test message',
			code: 'TEST_CODE',
			timestamp: error.timestamp
		});
	});

	it('should generate HTTP response', async () => {
		const error = new BaseError('Test message', 'TEST_CODE', 400);
		
		const response = error.toResponse();
		expect(response).toBeInstanceOf(Response);
		expect(response.status).toBe(400);
		expect(response.headers.get('Content-Type')).toBe('application/json');
		
		await expect(response.json()).resolves.toEqual({
			error: 'Test message',
			code: 'TEST_CODE',
			timestamp: error.timestamp
		});
	});

	it('should capture stack trace', () => {
		const error = new BaseError('Test message', 'TEST_CODE');
		
		expect(error.stack).toContain('BaseError');
		expect(error.stack).toContain('Test message');
	});

	it('should be instanceof Error', () => {
		const error = new BaseError('Test message', 'TEST_CODE');
		
		expect(error).toBeInstanceOf(Error);
	});
});
