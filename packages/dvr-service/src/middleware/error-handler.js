import { BaseError, InternalError } from '../errors/index.js';
import { CORS_HEADERS } from '../constants/cors.js';

/**
 * Error handling middleware wrapper for route handlers.
 *
 * Catches all errors thrown by the wrapped handler and converts them to HTTP responses:
 * - BaseError instances are converted using their toResponse() method
 * - Unknown errors are wrapped in InternalError and converted to 500 responses
 * - Automatically applies CORS headers to all responses
 *
 * @param {Function} handler - Async route handler function
 * @returns {Function} Wrapped handler with error handling
 *
 * @example
 * export const handleSessionById = withErrorHandling(async (request, env, sessionId) => {
 *   // Route logic - just throw typed errors, no try-catch needed
 *   if (!sessionId) {
 *     throw new MissingParameterError('sessionId');
 *   }
 *
 *   const result = await useCase.execute(sessionId);
 *   return new Response(JSON.stringify(result), {
 *     status: 200,
 *     headers: { 'Content-Type': 'application/json' }
 *   });
 * });
 */
export function withErrorHandling(handler) {
	return async (...args) => {
		try {
			const response = await handler(...args);

			// Ensure CORS headers are present on successful responses
			if (response instanceof Response) {
				const headers = new Headers(response.headers);
				Object.entries(CORS_HEADERS).forEach(([key, value]) => {
					if (!headers.has(key)) {
						headers.set(key, value);
					}
				});

				return new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers
				});
			}

			return response;
		} catch (error) {
			// Handle typed errors from the application
			if (error instanceof BaseError) {
				return error.toResponse();
			}

			// Wrap unknown errors in InternalError
			console.error('Unhandled error in route handler:', error);
			return new InternalError(
				`Internal server error: ${error.message || 'Unknown error'}`
			).toResponse();
		}
	};
}
