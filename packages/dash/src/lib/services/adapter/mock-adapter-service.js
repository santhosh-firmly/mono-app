/**
 * Mock adapter service.
 * Implements the same interface that the future R2-backed service will use.
 * Uses localStorage for persistence across page reloads, keyed by merchant domain.
 */

import {
	BLUEPRINT_FILES,
	buildFileTree,
	getDefaultContent,
	isRequiredFile
} from './adapter-blueprint.js';

const STORAGE_PREFIX = 'firmly-adapter';

function storageKey(domain) {
	return `${STORAGE_PREFIX}:${domain}:files`;
}

function versionsKey(domain) {
	return `${STORAGE_PREFIX}:${domain}:versions`;
}

function publishLogKey(domain) {
	return `${STORAGE_PREFIX}:${domain}:publish-log`;
}

function readStorage(key) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function writeStorage(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Silently fail — localStorage may be unavailable in tests
	}
}

/**
 * Initialize files from blueprint if no files exist for this domain.
 */
function getOrInitFiles(domain) {
	let files = readStorage(storageKey(domain));
	if (!files) {
		files = {};
		for (const entry of BLUEPRINT_FILES) {
			files[entry.path] = {
				path: entry.path,
				content: getDefaultContent(entry.path),
				lastModified: new Date().toISOString(),
				modifiedBy: 'system'
			};
		}
		writeStorage(storageKey(domain), files);
	}
	return files;
}

function saveFiles(domain, files) {
	writeStorage(storageKey(domain), files);
}

function getVersions(domain) {
	return readStorage(versionsKey(domain)) || { current: null, previous: null };
}

function saveVersions(domain, versions) {
	writeStorage(versionsKey(domain), versions);
}

function appendPublishLog(domain, entry) {
	const log = readStorage(publishLogKey(domain)) || [];
	log.push(entry);
	writeStorage(publishLogKey(domain), log);
}

/**
 * Validate a file path for safety.
 * @param {string} path
 * @returns {{valid: boolean, error?: string}}
 */
function validatePath(path) {
	if (!path || typeof path !== 'string') {
		return { valid: false, error: 'Path is required' };
	}
	if (path.includes('..')) {
		return { valid: false, error: 'Path cannot contain ".."' };
	}
	if (path.startsWith('/')) {
		return { valid: false, error: 'Path cannot start with "/"' };
	}
	if (path.startsWith('tests/') || path === 'tests') {
		return { valid: false, error: 'Cannot access test files' };
	}
	if (!path.endsWith('.js')) {
		return { valid: false, error: 'Files must end with .js' };
	}
	if (/[<>:"|?*\\]/.test(path)) {
		return { valid: false, error: 'Path contains invalid characters' };
	}
	return { valid: true };
}

/**
 * List all adapter files as a file tree.
 * @param {string} domain
 * @returns {Promise<{tree: Array, fileCount: number}>}
 */
export async function listFiles(domain) {
	const files = getOrInitFiles(domain);
	const filePaths = Object.keys(files);

	const fileEntries = filePaths.map((path) => ({
		path,
		isRequired: isRequiredFile(path)
	}));

	const tree = buildFileTree(fileEntries);
	return { tree, fileCount: filePaths.length };
}

/**
 * Get a single file's content.
 * @param {string} domain
 * @param {string} path
 * @returns {Promise<{path: string, content: string, lastModified: string, modifiedBy: string} | null>}
 */
export async function getFile(domain, path) {
	const files = getOrInitFiles(domain);
	return files[path] || null;
}

/**
 * Save (create or update) a file.
 * @param {string} domain
 * @param {string} path
 * @param {string} content
 * @returns {Promise<{path: string, content: string, lastModified: string, modifiedBy: string}>}
 */
export async function saveFile(domain, path, content) {
	const validation = validatePath(path);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const files = getOrInitFiles(domain);
	const file = {
		path,
		content,
		lastModified: new Date().toISOString(),
		modifiedBy: 'current-user'
	};
	files[path] = file;
	saveFiles(domain, files);
	return file;
}

/**
 * Create a new file with empty or default content.
 * @param {string} domain
 * @param {string} path
 * @param {string} [content]
 * @returns {Promise<{path: string, content: string, lastModified: string, modifiedBy: string}>}
 */
export async function createFile(domain, path, content) {
	const validation = validatePath(path);
	if (!validation.valid) {
		throw new Error(validation.error);
	}

	const files = getOrInitFiles(domain);
	if (files[path]) {
		throw new Error(`File already exists: ${path}`);
	}

	const file = {
		path,
		content: content || `// ${path}\n`,
		lastModified: new Date().toISOString(),
		modifiedBy: 'current-user'
	};
	files[path] = file;
	saveFiles(domain, files);
	return file;
}

/**
 * Delete a file. Cannot delete required blueprint files.
 * @param {string} domain
 * @param {string} path
 * @returns {Promise<void>}
 */
export async function deleteFile(domain, path) {
	if (isRequiredFile(path)) {
		throw new Error(`Cannot delete required file: ${path}`);
	}

	const files = getOrInitFiles(domain);
	if (!files[path]) {
		throw new Error(`File not found: ${path}`);
	}

	delete files[path];
	saveFiles(domain, files);
}

/**
 * Run the adapter test suite (mocked).
 * Simulates a ~2-3s delay, then returns predetermined results.
 * @param {string} domain
 * @returns {Promise<import('./types').TestRun>}
 */
// eslint-disable-next-line no-unused-vars
export async function runTests(domain) {
	const runId = `run-${Date.now()}`;
	const triggeredAt = new Date().toISOString();

	// Simulate async test execution
	await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

	const results = [
		{
			testName: 'should return transformed cart',
			suite: 'Cart Operations > getCart',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/cart.js',
			lineNumber: null,
			duration: 45
		},
		{
			testName: 'should add line item to cart',
			suite: 'Cart Operations > addLineItem',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/cart.js',
			lineNumber: null,
			duration: 38
		},
		{
			testName: 'should update line item quantity',
			suite: 'Cart Operations > updateLineItem',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/cart.js',
			lineNumber: null,
			duration: 42
		},
		{
			testName: 'should clear all cart items',
			suite: 'Cart Operations > clearCart',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/cart.js',
			lineNumber: null,
			duration: 35
		},
		{
			testName: 'should transfer session with cookies',
			suite: 'Session > sessionTransfer',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/session.js',
			lineNumber: null,
			duration: 120
		},
		{
			testName: 'should apply promo codes',
			suite: 'Checkout > addPromoCodes',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/checkout/checkout.js',
			lineNumber: null,
			duration: 55
		},
		{
			testName: 'should set shipping info',
			suite: 'Shipping > setShippingInfo',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/checkout/shipping.js',
			lineNumber: null,
			duration: 67
		},
		{
			testName: 'should map shipping rates',
			suite: 'Shipping > getShippingRates',
			status: 'failed',
			errorMessage:
				'Expected shipping rate to have "estimated_delivery" property but received undefined',
			filePath: 'lib/data-transform/map-shipping.js',
			lineNumber: 18,
			duration: 33
		},
		{
			testName: 'should return payment handle',
			suite: 'Payment > getPaymentHandle',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/payment.js',
			lineNumber: null,
			duration: 22
		},
		{
			testName: 'should map order with all fields',
			suite: 'Order > mapOrder',
			status: 'passed',
			errorMessage: null,
			filePath: 'lib/order.js',
			lineNumber: null,
			duration: 15
		},
		{
			testName: 'should transform product catalog data',
			suite: 'Catalog > getCatalogTransformProduct',
			status: 'failed',
			errorMessage:
				'Cannot read property "offers" of undefined — ensure Product object has valid offer data',
			filePath: 'lib/catalog-product-map.js',
			lineNumber: 62,
			duration: 28
		},
		{
			testName: 'should export firmlyConfig',
			suite: 'Config > firmlyConfig',
			status: 'passed',
			errorMessage: null,
			filePath: 'firmly.config.js',
			lineNumber: null,
			duration: 8
		}
	];

	const passed = results.filter((r) => r.status === 'passed').length;
	const failed = results.filter((r) => r.status === 'failed').length;
	const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

	return {
		runId,
		triggeredAt,
		triggeredBy: 'current-user',
		status: failed > 0 ? 'failed' : 'passed',
		results,
		summary: {
			total: results.length,
			passed,
			failed,
			duration: totalDuration
		}
	};
}

/**
 * Publish the current adapter draft.
 * @param {string} domain
 * @param {boolean} force - Publish even if tests failed
 * @param {import('./types').TestRun | null} lastTestRun
 * @returns {Promise<import('./types').AdapterVersion>}
 */
export async function publish(domain, force, lastTestRun) {
	const files = getOrInitFiles(domain);
	const versions = getVersions(domain);

	// Check for test status
	const testStatus = lastTestRun?.status || 'not_run';
	if (testStatus === 'failed' && !force) {
		throw new Error('Tests have failed. Use force publish to override.');
	}

	const versionId = `v${versions.current ? parseInt(versions.current.versionId.slice(1)) + 1 : 1}`;

	const newVersion = {
		versionId,
		publishedAt: new Date().toISOString(),
		publishedBy: 'current-user',
		forcePublished: force && testStatus !== 'passed',
		testStatus,
		files: JSON.parse(JSON.stringify(files))
	};

	// Shift versions: current → previous, new → current
	versions.previous = versions.current;
	versions.current = newVersion;
	saveVersions(domain, versions);

	// Log the action
	appendPublishLog(domain, {
		action: force && testStatus !== 'passed' ? 'force_publish' : 'publish',
		performedAt: new Date().toISOString(),
		performedBy: 'current-user',
		versionId,
		testStatus
	});

	return newVersion;
}

/**
 * Rollback to the previous published version.
 * @param {string} domain
 * @returns {Promise<import('./types').AdapterVersion>}
 */
export async function rollback(domain) {
	const versions = getVersions(domain);

	if (!versions.previous) {
		throw new Error('No previous version available for rollback');
	}

	// Restore files from previous version
	const previousFiles = versions.previous.files;
	saveFiles(domain, previousFiles);

	// Shift versions: previous → current, previous = null
	const restoredVersion = versions.previous;
	versions.current = versions.previous;
	versions.previous = null;
	saveVersions(domain, versions);

	// Log the action
	appendPublishLog(domain, {
		action: 'rollback',
		performedAt: new Date().toISOString(),
		performedBy: 'current-user',
		versionId: restoredVersion.versionId,
		testStatus: restoredVersion.testStatus || null
	});

	return restoredVersion;
}

/**
 * Get version information.
 * @param {string} domain
 * @returns {Promise<{current: object|null, previous: object|null, canRollback: boolean}>}
 */
export async function getVersionsInfo(domain) {
	const versions = getVersions(domain);
	return {
		current: versions.current
			? {
					versionId: versions.current.versionId,
					publishedAt: versions.current.publishedAt,
					publishedBy: versions.current.publishedBy,
					forcePublished: versions.current.forcePublished,
					testStatus: versions.current.testStatus
				}
			: null,
		previous: versions.previous
			? {
					versionId: versions.previous.versionId,
					publishedAt: versions.previous.publishedAt,
					publishedBy: versions.previous.publishedBy,
					forcePublished: versions.previous.forcePublished,
					testStatus: versions.previous.testStatus
				}
			: null,
		canRollback: !!versions.previous
	};
}
