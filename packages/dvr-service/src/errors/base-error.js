/**
 * Base custom error class for dvr-service
 * All custom errors should extend this class
 */
export class BaseError extends Error {
	/**
	 * @param {string} message - Error message
	 * @param {string} code - Error code for programmatic handling
	 * @param {number} statusCode - HTTP status code
	 */
	constructor(message, code, statusCode) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.timestamp = new Date().toISOString();

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Convert error to JSON response body
	 * @returns {Object} JSON representation of the error
	 */
	toJSON() {
		return {
			error: this.message,
			code: this.code,
			timestamp: this.timestamp
		};
	}

	/**
	 * Convert error to HTTP Response
	 * @returns {Response} HTTP Response object
	 */
	toResponse() {
		return new Response(JSON.stringify(this.toJSON()), {
			status: this.statusCode,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
