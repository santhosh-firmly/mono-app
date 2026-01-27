/**
 * @typedef {Object} Notice
 * @property {string} id - Unique identifier
 * @property {'info' | 'success' | 'warning' | 'error'} type - Notice type
 * @property {string} message - Message to display
 * @property {string} [actionLabel] - Action button label (e.g., "Undo")
 * @property {Function} [onAction] - Action callback
 * @property {number} [duration] - Auto-dismiss duration in ms (default 10000)
 * @property {string} [image] - Optional product image URL
 */

class Notices {
	notices = $state([]);

	/**
	 * Add a notice to the stack
	 * @param {Omit<Notice, 'id'>} notice
	 * @returns {string} The notice ID
	 */
	add(notice) {
		const id = crypto.randomUUID();
		this.notices = [
			...this.notices,
			{
				id,
				duration: 10000,
				...notice
			}
		];
		return id;
	}

	/**
	 * Add an info notice
	 * @param {string} message
	 * @param {Partial<Omit<Notice, 'id' | 'type' | 'message'>>} options
	 */
	info(message, options = {}) {
		return this.add({ type: 'info', message, ...options });
	}

	/**
	 * Add a success notice
	 * @param {string} message
	 * @param {Partial<Omit<Notice, 'id' | 'type' | 'message'>>} options
	 */
	success(message, options = {}) {
		return this.add({ type: 'success', message, ...options });
	}

	/**
	 * Add a warning notice
	 * @param {string} message
	 * @param {Partial<Omit<Notice, 'id' | 'type' | 'message'>>} options
	 */
	warning(message, options = {}) {
		return this.add({ type: 'warning', message, ...options });
	}

	/**
	 * Add an error notice
	 * @param {string} message
	 * @param {Partial<Omit<Notice, 'id' | 'type' | 'message'>>} options
	 */
	error(message, options = {}) {
		return this.add({ type: 'error', message, ...options });
	}

	/**
	 * Remove a notice by ID
	 * @param {string} id
	 */
	dismiss(id) {
		this.notices = this.notices.filter((n) => n.id !== id);
	}

	/**
	 * Clear all notices
	 */
	clear() {
		this.notices = [];
	}
}

let instance = null;

export function initializeNotices() {
	instance = new Notices();
	return instance;
}

export function getNotices() {
	if (!instance) {
		instance = new Notices();
	}
	return instance;
}

export function resetNotices() {
	instance = null;
}
