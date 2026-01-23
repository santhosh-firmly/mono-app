/**
 * Browser Fetch Utility
 *
 * Wrapper with error handling and optional error callback.
 * Does NOT import from services - uses callback for telemetry.
 */

/**
 * Error callback type
 * @callback ErrorCallback
 * @param {Object} errorData - Error data for telemetry
 */

/** @type {ErrorCallback|null} */
let onFetchError = null;

/**
 * Set the error callback for fetch errors (called by telemetry service)
 * @param {ErrorCallback} callback - Error handler callback
 */
export function setFetchErrorHandler(callback) {
	onFetchError = callback;
}

/**
 * Handles fetch errors by returning a standardized error response.
 * @param {Error} err - The error object.
 * @returns {Response} A response object containing the error details.
 */
function handleFetchError(err) {
	return new Response(
		JSON.stringify({
			code: 460,
			error: 'NetworkError',
			description: 'Network error occurred.',
			errorString: JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))
		}),
		{ status: 460 }
	);
}

const defaultOptions = {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	},
	method: 'GET'
};

let ongoingRequest;

/**
 * Executes a function within a semaphore to prevent parallel execution.
 * @param {Function} func - The function to execute.
 * @returns {Promise<any>} The result of the function.
 */
async function semaphore(func) {
	while (ongoingRequest) {
		await ongoingRequest;
	}
	let resolvePromise;
	ongoingRequest = new Promise((resolve) => {
		resolvePromise = resolve;
	});
	try {
		return await func();
	} finally {
		resolvePromise();
		ongoingRequest = null;
	}
}

/**
 * Performs a browser fetch using semaphores to prevent parallel execution and handles errors.
 * @param {string} url - The URL to fetch.
 * @param {object} [options] - The fetch options.
 * @returns {Promise<{status: number, data?: any}>} An object containing the status and data from the response.
 */
export async function browserFetch(url, options = defaultOptions) {
	const mergedOptions = Object.assign(options, {
		credentials: 'include'
	});
	const res = await semaphore(() => fetch(url, mergedOptions).catch(handleFetchError));
	let ret = { status: res.status };
	try {
		ret.data = await res.json();
	} catch {
		/* empty */
	}

	if (res.status != 200 && onFetchError) {
		try {
			const tempData = ret.data;
			onFetchError({
				url: url,
				method: options.method,
				status: ret.status,
				code: tempData?.code,
				description: tempData?.description,
				error: tempData?.error,
				error_string: tempData?.errorString,
				res_headers: Object.fromEntries(res.headers)
			});
		} catch {
			/* empty */
		}
	}

	return ret;
}
