import { describe, it, expect } from 'vitest';
import {
	InternalError,
	StorageError,
	DurableObjectError,
	PersistenceError
} from './server-errors.js';

describe('InternalError', () => {
	it('should create error with default message', () => {
		expect(new InternalError()).toMatchObject({
			message: 'An internal error occurred',
			code: 'INTERNAL_ERROR',
			statusCode: 500
		});
	});

	it('should create error with custom message', () => {
		expect(new InternalError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'INTERNAL_ERROR',
			statusCode: 500
		});
	});
});

describe('StorageError', () => {
	it('should create error with default message', () => {
		expect(new StorageError()).toMatchObject({
			message: 'Failed to access storage',
			code: 'STORAGE_ERROR',
			statusCode: 500
		});
	});

	it('should create error with custom message', () => {
		expect(new StorageError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'STORAGE_ERROR',
			statusCode: 500
		});
	});
});

describe('DurableObjectError', () => {
	it('should create error with default message', () => {
		expect(new DurableObjectError()).toMatchObject({
			message: 'Durable Object operation failed',
			code: 'DURABLE_OBJECT_ERROR',
			statusCode: 500
		});
	});

	it('should create error with custom message', () => {
		expect(new DurableObjectError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'DURABLE_OBJECT_ERROR',
			statusCode: 500
		});
	});
});

describe('PersistenceError', () => {
	it('should create error with default message', () => {
		expect(new PersistenceError()).toMatchObject({
			message: 'Failed to persist session data',
			code: 'PERSISTENCE_ERROR',
			statusCode: 500
		});
	});

	it('should create error with custom message', () => {
		expect(new PersistenceError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'PERSISTENCE_ERROR',
			statusCode: 500
		});
	});

	it('should generate correct response', async () => {
		const error = new PersistenceError('Database connection failed');
		const response = error.toResponse();
		
		expect(response.status).toBe(500);
		await expect(response.json()).resolves.toEqual({
			error: 'Database connection failed',
			code: 'PERSISTENCE_ERROR',
			timestamp: error.timestamp
		});
	});
});
