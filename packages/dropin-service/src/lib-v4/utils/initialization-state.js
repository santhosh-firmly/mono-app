/**
 * Initialization State Manager
 * Replaces simple boolean flags with proper state management
 */

export const INITIALIZATION_STATES = {
	IDLE: 'idle',
	STARTING: 'starting',
	SDK_LOADING: 'sdk_loading',
	SDK_INITIALIZING: 'sdk_initializing',
	DROPIN_INITIALIZING: 'dropin_initializing',
	SESSIONS_READY: 'sessions_ready',
	PAYMENT_INITIALIZING: 'payment_initializing',
	COMPLETED: 'completed',
	ERROR: 'error'
};

export class InitializationStateManager {
	constructor() {
		this.currentState = INITIALIZATION_STATES.IDLE;
		this.stateHistory = [];
		this.listeners = new Map();
		this.startTime = null;
		this.errors = [];
		this.context = {};
	}

	/**
	 * Get current initialization state
	 */
	getCurrentState() {
		return this.currentState;
	}

	/**
	 * Check if in a specific state
	 */
	isInState(state) {
		return this.currentState === state;
	}

	/**
	 * Check if initialization is complete
	 */
	isCompleted() {
		return this.currentState === INITIALIZATION_STATES.COMPLETED;
	}

	/**
	 * Check if initialization has errors
	 */
	hasErrors() {
		return this.currentState === INITIALIZATION_STATES.ERROR || this.errors.length > 0;
	}

	/**
	 * Check if in initialization phase (not idle or completed)
	 */
	isInitializing() {
		return ![
			INITIALIZATION_STATES.IDLE,
			INITIALIZATION_STATES.COMPLETED,
			INITIALIZATION_STATES.ERROR
		].includes(this.currentState);
	}

	/**
	 * Transition to a new state
	 */
	setState(newState, context = {}) {
		const previousState = this.currentState;

		// Validate state transition
		if (!this._isValidTransition(previousState, newState)) {
			console.warn(`Invalid state transition from ${previousState} to ${newState}`);
			return false;
		}

		// Record state change
		this.stateHistory.push({
			from: previousState,
			to: newState,
			timestamp: Date.now(),
			context
		});

		this.currentState = newState;
		this.context = { ...this.context, ...context };

		// Track start time
		if (newState === INITIALIZATION_STATES.STARTING) {
			this.startTime = Date.now();
		}

		// Notify listeners
		this._notifyListeners(newState, previousState, context);

		return true;
	}

	/**
	 * Add error to the state
	 */
	addError(error, context = {}) {
		this.errors.push({
			error,
			timestamp: Date.now(),
			state: this.currentState,
			context
		});

		if (this.currentState !== INITIALIZATION_STATES.ERROR) {
			this.setState(INITIALIZATION_STATES.ERROR, { error, ...context });
		}
	}

	/**
	 * Start initialization process
	 */
	start(context = {}) {
		if (this.currentState !== INITIALIZATION_STATES.IDLE) {
			console.warn('Initialization already started');
			return false;
		}

		this.errors = [];
		this.stateHistory = [];
		this.context = {};

		return this.setState(INITIALIZATION_STATES.STARTING, context);
	}

	/**
	 * Complete initialization successfully
	 */
	complete(context = {}) {
		const duration = this.startTime ? Date.now() - this.startTime : 0;
		return this.setState(INITIALIZATION_STATES.COMPLETED, {
			duration,
			...context
		});
	}

	/**
	 * Reset to idle state
	 */
	reset() {
		this.currentState = INITIALIZATION_STATES.IDLE;
		this.stateHistory = [];
		this.errors = [];
		this.context = {};
		this.startTime = null;
		this._notifyListeners(INITIALIZATION_STATES.IDLE, null, {});
	}

	/**
	 * Subscribe to state changes
	 */
	onStateChange(callback, states = null) {
		const id = Date.now() + Math.random();
		this.listeners.set(id, { callback, states });

		// Return unsubscribe function
		return () => this.listeners.delete(id);
	}

	/**
	 * Get initialization duration
	 */
	getDuration() {
		if (!this.startTime) return 0;
		const endTime = this.isCompleted()
			? this.stateHistory.find((h) => h.to === INITIALIZATION_STATES.COMPLETED)?.timestamp ||
				Date.now()
			: Date.now();
		return endTime - this.startTime;
	}

	/**
	 * Get state summary for debugging
	 */
	getSummary() {
		return {
			currentState: this.currentState,
			duration: this.getDuration(),
			errorCount: this.errors.length,
			stateChanges: this.stateHistory.length,
			isInitializing: this.isInitializing(),
			isCompleted: this.isCompleted(),
			hasErrors: this.hasErrors(),
			context: this.context
		};
	}

	/**
	 * Validate state transitions
	 */
	_isValidTransition(from, to) {
		const validTransitions = {
			[INITIALIZATION_STATES.IDLE]: [INITIALIZATION_STATES.STARTING],
			[INITIALIZATION_STATES.STARTING]: [
				INITIALIZATION_STATES.SDK_LOADING,
				INITIALIZATION_STATES.DROPIN_INITIALIZING,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.SDK_LOADING]: [
				INITIALIZATION_STATES.SDK_INITIALIZING,
				INITIALIZATION_STATES.DROPIN_INITIALIZING,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.SDK_INITIALIZING]: [
				INITIALIZATION_STATES.DROPIN_INITIALIZING,
				INITIALIZATION_STATES.SESSIONS_READY,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.DROPIN_INITIALIZING]: [
				INITIALIZATION_STATES.SESSIONS_READY,
				INITIALIZATION_STATES.PAYMENT_INITIALIZING,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.SESSIONS_READY]: [
				INITIALIZATION_STATES.PAYMENT_INITIALIZING,
				INITIALIZATION_STATES.COMPLETED,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.PAYMENT_INITIALIZING]: [
				INITIALIZATION_STATES.COMPLETED,
				INITIALIZATION_STATES.ERROR
			],
			[INITIALIZATION_STATES.COMPLETED]: [
				INITIALIZATION_STATES.IDLE // Allow reset
			],
			[INITIALIZATION_STATES.ERROR]: [
				INITIALIZATION_STATES.IDLE, // Allow reset
				INITIALIZATION_STATES.STARTING // Allow retry
			]
		};

		return validTransitions[from]?.includes(to) || false;
	}

	/**
	 * Notify all listeners of state change
	 */
	_notifyListeners(newState, previousState, context) {
		this.listeners.forEach(({ callback, states }) => {
			// If specific states are specified, only notify for those
			if (states && !states.includes(newState)) return;

			try {
				callback(newState, previousState, context);
			} catch (error) {
				console.error('Error in state change listener:', error);
			}
		});
	}

	/**
	 * Create a promise that resolves when a specific state is reached
	 */
	waitForState(targetState, timeout = 10000) {
		return new Promise((resolve, reject) => {
			// If already in target state, resolve immediately
			if (this.currentState === targetState) {
				resolve(this.currentState);
				return;
			}

			// Set up timeout
			const timeoutId = setTimeout(() => {
				unsubscribe();
				reject(new Error(`Timeout waiting for state ${targetState}`));
			}, timeout);

			// Listen for state change
			const unsubscribe = this.onStateChange((newState) => {
				if (newState === targetState) {
					clearTimeout(timeoutId);
					unsubscribe();
					resolve(newState);
				} else if (newState === INITIALIZATION_STATES.ERROR) {
					clearTimeout(timeoutId);
					unsubscribe();
					reject(new Error('Initialization failed'));
				}
			});
		});
	}

	/**
	 * Create a promise that resolves when initialization is complete
	 */
	waitForCompletion(timeout = 15000) {
		return this.waitForState(INITIALIZATION_STATES.COMPLETED, timeout);
	}
}

// Export default instance for global use
export const initializationState = new InitializationStateManager();

// Export convenience functions
export const getInitializationState = () => initializationState.getCurrentState();
export const isInitializing = () => initializationState.isInitializing();
export const isInitializationComplete = () => initializationState.isCompleted();
export const waitForInitialization = (timeout) => initializationState.waitForCompletion(timeout);
