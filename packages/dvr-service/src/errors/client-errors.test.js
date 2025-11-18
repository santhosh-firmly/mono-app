import { describe, it, expect } from 'vitest';
import {
	InvalidRequestError,
	MissingParameterError,
	InvalidSessionDataError,
	SessionNotFoundError
} from './client-errors.js';

describe('InvalidRequestError', () => {
	it('should create error with default message', () => {
		expect(new InvalidRequestError()).toMatchObject({
			message: 'The request is invalid or malformed',
			code: 'INVALID_REQUEST',
			statusCode: 400
		});
	});

	it('should create error with custom message', () => {
		expect(new InvalidRequestError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'INVALID_REQUEST',
			statusCode: 400
		});
	});
});

describe('MissingParameterError', () => {
	it('should create error with parameter name', () => {
		expect(new MissingParameterError('sessionId')).toMatchObject({
			message: 'Required parameter is missing: sessionId',
			code: 'MISSING_PARAMETER',
			statusCode: 400
		});
	});
});

describe('InvalidSessionDataError', () => {
	it('should create error with default message', () => {
		expect(new InvalidSessionDataError()).toMatchObject({
			message: 'Session data is invalid',
			code: 'INVALID_SESSION_DATA',
			statusCode: 400
		});
	});

	it('should create error with custom message', () => {
		expect(new InvalidSessionDataError('Custom message')).toMatchObject({
			message: 'Custom message',
			code: 'INVALID_SESSION_DATA',
			statusCode: 400
		});
	});
});

describe('SessionNotFoundError', () => {
	it('should create error with session ID', () => {
		expect(new SessionNotFoundError('123')).toMatchObject({
			message: 'Session not found: 123',
			code: 'SESSION_NOT_FOUND',
			statusCode: 404
		});
	});

	it('should generate correct response', async () => {
		const error = new SessionNotFoundError('abc');
		const response = error.toResponse();
		
		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({
			error: 'Session not found: abc',
			code: 'SESSION_NOT_FOUND',
			timestamp: error.timestamp
		});
	});
});
