/**
 * Adapter store using Svelte 5 runes.
 * Manages reactive state for the adapter code editor feature.
 * Shared across all adapter components via import.
 */

import * as service from './mock-adapter-service.js';

let domain = $state(null);
let fileTree = $state([]);
let fileCount = $state(0);
let selectedFilePath = $state(null);
let openFileContent = $state('');
let originalFileContent = $state('');
let testRun = $state(null);
let isTestRunning = $state(false);
let isTestStale = $state(false);
let currentVersion = $state(null);
let previousVersion = $state(null);
let isLoading = $state(true);
let isSaving = $state(false);
let isPublishing = $state(false);
let error = $state(null);

const isDirty = $derived(openFileContent !== originalFileContent);
const canRollback = $derived(previousVersion !== null);

/**
 * Initialize the adapter store for a given merchant domain.
 * Loads the file tree and version info.
 */
async function initialize(merchantDomain) {
	domain = merchantDomain;
	isLoading = true;
	error = null;

	try {
		const [filesResult, versionsResult] = await Promise.all([
			service.listFiles(domain),
			service.getVersionsInfo(domain)
		]);

		fileTree = filesResult.tree;
		fileCount = filesResult.fileCount;
		currentVersion = versionsResult.current;
		previousVersion = versionsResult.previous;

		// Auto-select the first file
		const firstFile = findFirstFile(fileTree);
		if (firstFile) {
			await selectFile(firstFile.path);
		}
	} catch (e) {
		error = e.message;
	} finally {
		isLoading = false;
	}
}

/**
 * Find the first file node in the tree (depth-first).
 */
function findFirstFile(nodes) {
	for (const node of nodes) {
		if (node.type === 'file') return node;
		if (node.children) {
			const found = findFirstFile(node.children);
			if (found) return found;
		}
	}
	return null;
}

/**
 * Select a file and load its content into the editor.
 */
async function selectFile(path) {
	const file = await service.getFile(domain, path);
	if (file) {
		selectedFilePath = path;
		openFileContent = file.content;
		originalFileContent = file.content;
	}
}

/**
 * Update the editor content (called on every keystroke).
 */
function updateContent(content) {
	openFileContent = content;
	if (testRun && !isTestStale) {
		isTestStale = true;
	}
}

/**
 * Save the currently open file.
 */
async function saveCurrentFile() {
	if (!selectedFilePath || !isDirty) return;

	isSaving = true;
	error = null;

	try {
		await service.saveFile(domain, selectedFilePath, openFileContent);
		originalFileContent = openFileContent;
	} catch (e) {
		error = e.message;
	} finally {
		isSaving = false;
	}
}

/**
 * Create a new file and select it.
 */
async function createFile(path) {
	error = null;

	try {
		await service.createFile(domain, path);
		// Refresh the file tree
		const result = await service.listFiles(domain);
		fileTree = result.tree;
		fileCount = result.fileCount;
		// Select the new file
		await selectFile(path);
	} catch (e) {
		error = e.message;
		throw e;
	}
}

/**
 * Delete a file.
 */
async function deleteFile(path) {
	error = null;

	try {
		await service.deleteFile(domain, path);
		// Refresh the file tree
		const result = await service.listFiles(domain);
		fileTree = result.tree;
		fileCount = result.fileCount;

		// If we deleted the currently selected file, select another
		if (selectedFilePath === path) {
			const firstFile = findFirstFile(fileTree);
			if (firstFile) {
				await selectFile(firstFile.path);
			} else {
				selectedFilePath = null;
				openFileContent = '';
				originalFileContent = '';
			}
		}
	} catch (e) {
		error = e.message;
		throw e;
	}
}

/**
 * Run the adapter test suite.
 */
async function runTestsSuite() {
	isTestRunning = true;
	isTestStale = false;
	error = null;

	// Set a placeholder "running" test run
	testRun = {
		runId: 'pending',
		triggeredAt: new Date().toISOString(),
		triggeredBy: 'current-user',
		status: 'running',
		results: [],
		summary: { total: 0, passed: 0, failed: 0, duration: 0 }
	};

	try {
		testRun = await service.runTests(domain);
	} catch (e) {
		error = e.message;
		testRun = null;
	} finally {
		isTestRunning = false;
	}
}

/**
 * Publish the adapter.
 * @param {boolean} force - Force publish even if tests failed
 */
async function publishAdapter(force = false) {
	isPublishing = true;
	error = null;

	try {
		const version = await service.publish(domain, force, testRun);
		currentVersion = {
			versionId: version.versionId,
			publishedAt: version.publishedAt,
			publishedBy: version.publishedBy,
			forcePublished: version.forcePublished,
			testStatus: version.testStatus
		};

		// Refresh versions
		const versionsResult = await service.getVersionsInfo(domain);
		currentVersion = versionsResult.current;
		previousVersion = versionsResult.previous;
	} catch (e) {
		error = e.message;
		throw e;
	} finally {
		isPublishing = false;
	}
}

/**
 * Rollback to the previous version.
 */
async function rollbackAdapter() {
	isPublishing = true;
	error = null;

	try {
		await service.rollback(domain);

		// Refresh versions and file tree
		const [filesResult, versionsResult] = await Promise.all([
			service.listFiles(domain),
			service.getVersionsInfo(domain)
		]);

		fileTree = filesResult.tree;
		fileCount = filesResult.fileCount;
		currentVersion = versionsResult.current;
		previousVersion = versionsResult.previous;

		// Reload the currently selected file
		if (selectedFilePath) {
			const file = await service.getFile(domain, selectedFilePath);
			if (file) {
				openFileContent = file.content;
				originalFileContent = file.content;
			} else {
				// File might not exist in the rolled-back version
				const firstFile = findFirstFile(fileTree);
				if (firstFile) {
					await selectFile(firstFile.path);
				}
			}
		}

		testRun = null;
		isTestStale = false;
	} catch (e) {
		error = e.message;
		throw e;
	} finally {
		isPublishing = false;
	}
}

export const adapterStore = {
	get domain() {
		return domain;
	},
	get fileTree() {
		return fileTree;
	},
	get fileCount() {
		return fileCount;
	},
	get selectedFilePath() {
		return selectedFilePath;
	},
	get openFileContent() {
		return openFileContent;
	},
	get originalFileContent() {
		return originalFileContent;
	},
	get isDirty() {
		return isDirty;
	},
	get testRun() {
		return testRun;
	},
	get isTestRunning() {
		return isTestRunning;
	},
	get isTestStale() {
		return isTestStale;
	},
	get currentVersion() {
		return currentVersion;
	},
	get previousVersion() {
		return previousVersion;
	},
	get canRollback() {
		return canRollback;
	},
	get isLoading() {
		return isLoading;
	},
	get isSaving() {
		return isSaving;
	},
	get isPublishing() {
		return isPublishing;
	},
	get error() {
		return error;
	},
	initialize,
	selectFile,
	updateContent,
	saveCurrentFile,
	createFile,
	deleteFile,
	runTests: runTestsSuite,
	publish: publishAdapter,
	rollback: rollbackAdapter
};
