/**
 * Initialization State Manager
 * Tracks initialization states for the V5 buy flow
 */

export const INITIALIZATION_STATES = {
	IDLE: 'idle',
	STARTING: 'starting',
	SDK_READY: 'sdk_ready',
	DROPIN_READY: 'dropin_ready',
	COMPLETED: 'completed',
	ERROR: 'error'
};

export class InitializationStateManager {
	constructor() {
		this.currentState = INITIALIZATION_STATES.IDLE;
		this.errors = [];
		this.startTime = null;
	}

	getCurrentState() {
		return this.currentState;
	}

	isCompleted() {
		return this.currentState === INITIALIZATION_STATES.COMPLETED;
	}

	hasErrors() {
		return this.currentState === INITIALIZATION_STATES.ERROR || this.errors.length > 0;
	}

	isInitializing() {
		return ![
			INITIALIZATION_STATES.IDLE,
			INITIALIZATION_STATES.COMPLETED,
			INITIALIZATION_STATES.ERROR
		].includes(this.currentState);
	}

	setState(newState) {
		this.currentState = newState;

		if (newState === INITIALIZATION_STATES.STARTING) {
			this.startTime = Date.now();
		}
	}

	addError(error) {
		this.errors.push({ error, timestamp: Date.now() });
		this.setState(INITIALIZATION_STATES.ERROR);
	}

	start() {
		this.errors = [];
		this.setState(INITIALIZATION_STATES.STARTING);
	}

	complete() {
		this.setState(INITIALIZATION_STATES.COMPLETED);
	}

	reset() {
		this.currentState = INITIALIZATION_STATES.IDLE;
		this.errors = [];
		this.startTime = null;
	}

	getDuration() {
		return this.startTime ? Date.now() - this.startTime : 0;
	}
}

export const initializationState = new InitializationStateManager();

export const getInitializationState = () => initializationState.getCurrentState();
export const isInitializing = () => initializationState.isInitializing();
export const isInitializationComplete = () => initializationState.isCompleted();
