import { BaseError } from './base-error.js';

/**
 * Base class for server errors (5xx)
 */
class ServerError extends BaseError {
	constructor(message, code, statusCode = 500) {
		super(message, code, statusCode);
	}
}

/**
 * 500 Internal Server Error - Generic internal error
 */
export class InternalError extends ServerError {
	constructor(message = 'An internal error occurred') {
		super(message, 'INTERNAL_ERROR', 500);
	}
}

/**
 * 500 Internal Server Error - Storage operation failed (R2/KV)
 */
export class StorageError extends ServerError {
	constructor(message = 'Failed to access storage') {
		super(message, 'STORAGE_ERROR', 500);
	}
}

/**
 * 500 Internal Server Error - Durable Object operation failed
 */
export class DurableObjectError extends ServerError {
	constructor(message = 'Durable Object operation failed') {
		super(message, 'DURABLE_OBJECT_ERROR', 500);
	}
}

/**
 * 500 Internal Server Error - Failed to persist session data
 */
export class PersistenceError extends ServerError {
	constructor(message = 'Failed to persist session data') {
		super(message, 'PERSISTENCE_ERROR', 500);
	}
}
