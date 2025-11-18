import { BaseError } from './base-error.js';

/**
 * Base class for client errors (4xx)
 */
class ClientError extends BaseError {
	constructor(message, code, statusCode = 400) {
		super(message, code, statusCode);
	}
}

/**
 * 400 Bad Request - Invalid request format or data
 */
export class InvalidRequestError extends ClientError {
	constructor(message = 'The request is invalid or malformed') {
		super(message, 'INVALID_REQUEST', 400);
	}
}

/**
 * 400 Bad Request - Required parameter is missing
 */
export class MissingParameterError extends ClientError {
	constructor(parameterName) {
		super(`Required parameter is missing: ${parameterName}`, 'MISSING_PARAMETER', 400);
	}
}

/**
 * 400 Bad Request - Invalid session data
 */
export class InvalidSessionDataError extends ClientError {
	constructor(message = 'Session data is invalid') {
		super(message, 'INVALID_SESSION_DATA', 400);
	}
}

/**
 * 404 Not Found - Session not found
 */
export class SessionNotFoundError extends ClientError {
	constructor(sessionId) {
		super(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND', 404);
	}
}
