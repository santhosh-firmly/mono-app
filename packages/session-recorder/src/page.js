/**
 * @class Page
 * Manages page unload and visibility change event handlers
 */
export class Page {
	/**
	 * @param {Function} onUnload - Callback to execute on unload
	 */
	constructor(onUnload) {
		this.onUnload = onUnload;
		this.visibilityHandler = null;
		this.unloadHandler = null;
	}

	/**
	 * Sets up event listeners for page unload and visibility change
	 */
	setup() {
		this.unloadHandler = () => this.onUnload();
		this.visibilityHandler = () => {
			if (document.visibilityState === 'hidden') {
				this.onUnload();
			}
		};

		window.addEventListener('visibilitychange', this.visibilityHandler);
		window.addEventListener('pagehide', this.unloadHandler);
	}

	/**
	 * Removes event listeners
	 */
	remove() {
		if (this.visibilityHandler) {
			window.removeEventListener('visibilitychange', this.visibilityHandler);
			this.visibilityHandler = null;
		}
		if (this.unloadHandler) {
			window.removeEventListener('pagehide', this.unloadHandler);
			this.unloadHandler = null;
		}
	}
}
