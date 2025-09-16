import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	InitializationStateManager,
	initializationState,
	INITIALIZATION_STATES,
	isInitializing,
	getInitializationState,
	isInitializationComplete,
	waitForInitialization
} from './initialization-state.js';

describe('InitializationStateManager', () => {
	let stateManager;

	beforeEach(() => {
		stateManager = new InitializationStateManager();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should initialize with default state', () => {
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			expect(stateManager.isCompleted()).toBe(false);
			expect(stateManager.errors).toEqual([]);
			expect(stateManager.context).toEqual({});
		});
	});

	describe('getCurrentState', () => {
		it('should return current state', () => {
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
		});
	});

	describe('setState', () => {
		it('should update state with valid transition', () => {
			const result = stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(result).toBe(true);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.STARTING);
		});

		it('should reject invalid state transitions', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const result = stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			expect(result).toBe(false);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Invalid state transition from idle to sessions_ready'
			);
		});

		it('should track state history', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.stateHistory).toHaveLength(1);
			expect(stateManager.stateHistory[0]).toEqual({
				from: INITIALIZATION_STATES.IDLE,
				to: INITIALIZATION_STATES.STARTING,
				timestamp: expect.any(Number),
				context: {}
			});
		});

		it('should include context in state change', () => {
			const context = { source: 'test' };
			stateManager.setState(INITIALIZATION_STATES.STARTING, context);

			expect(stateManager.context).toEqual(context);
			expect(stateManager.stateHistory[0].context).toEqual(context);
		});
	});

	describe('isInState', () => {
		it('should return true for current state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.isInState(INITIALIZATION_STATES.STARTING)).toBe(true);
		});

		it('should return false for different state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.isInState(INITIALIZATION_STATES.IDLE)).toBe(false);
		});
	});

	describe('isInitializing', () => {
		it('should return true during initialization states', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			expect(stateManager.isInitializing()).toBe(true);
		});

		it('should return false for non-initializing states', () => {
			expect(stateManager.isInitializing()).toBe(false); // idle

			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			stateManager.complete();
			expect(stateManager.isInitializing()).toBe(false); // completed
		});
	});

	describe('addError', () => {
		it('should add error with context', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			const error = new Error('Test error');
			const context = { component: 'test' };

			stateManager.addError(error, context);

			expect(stateManager.errors).toHaveLength(1);
			expect(stateManager.errors[0].error.message).toBe('Test error');
			expect(stateManager.errors[0].context).toEqual(context);
			expect(stateManager.errors[0].state).toBe(INITIALIZATION_STATES.STARTING);
			expect(stateManager.errors[0].timestamp).toBeTypeOf('number');
		});

		it('should add error without context', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			const error = new Error('Test error');

			stateManager.addError(error);

			expect(stateManager.errors[0].error.message).toBe('Test error');
			expect(stateManager.errors[0].context).toEqual({});
			expect(stateManager.errors[0].state).toBe(INITIALIZATION_STATES.STARTING);
			expect(stateManager.errors[0].timestamp).toBeTypeOf('number');
		});

		it('should transition to error state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			const error = new Error('Test error');
			stateManager.addError(error);

			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.ERROR);
		});
	});

	describe('hasErrors', () => {
		it('should return false when no errors', () => {
			expect(stateManager.hasErrors()).toBe(false);
		});

		it('should return true when errors exist', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.addError(new Error('Test error'));
			expect(stateManager.hasErrors()).toBe(true);
		});

		it('should return true when in error state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.setState(INITIALIZATION_STATES.ERROR);
			expect(stateManager.hasErrors()).toBe(true);
		});
	});

	describe('start', () => {
		it('should start initialization from idle state', () => {
			const result = stateManager.start({ source: 'test' });

			expect(result).toBe(true);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.STARTING);
			expect(stateManager.startTime).toBeTypeOf('number');
		});

		it('should not allow starting when already started', () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			stateManager.setState(INITIALIZATION_STATES.STARTING);
			const result = stateManager.start();

			expect(result).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith('Initialization already started');
		});

		it('should reset errors and history on start', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.addError(new Error('Previous error'));
			stateManager.reset();

			const result = stateManager.start();

			expect(result).toBe(true);
			expect(stateManager.errors).toEqual([]);
			expect(stateManager.stateHistory).toHaveLength(1); // Only the start transition
		});
	});

	describe('complete', () => {
		it('should complete initialization with metadata', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);

			const metadata = { source: 'test' };
			const result = stateManager.complete(metadata);

			expect(result).toBe(true);
			expect(stateManager.isCompleted()).toBe(true);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.COMPLETED);
		});

		it('should calculate duration', async () => {
			stateManager.start();

			// Wait a bit to ensure duration > 0
			await new Promise((resolve) => {
				setTimeout(() => {
					stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
					stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
					stateManager.complete();
					expect(stateManager.getDuration()).toBeGreaterThan(0);
					resolve();
				}, 10);
			});
		});
	});

	describe('reset', () => {
		it('should reset to initial state', () => {
			stateManager.start();
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			stateManager.addError(new Error('Test error'));

			stateManager.reset();

			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			expect(stateManager.isCompleted()).toBe(false);
			expect(stateManager.errors).toEqual([]);
			expect(stateManager.context).toEqual({});
			expect(stateManager.stateHistory).toEqual([]);
			expect(stateManager.startTime).toBeNull();
		});
	});

	describe('getSummary', () => {
		it('should return complete state information', () => {
			stateManager.start();
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			stateManager.addError(new Error('Test error'), { source: 'test' });

			const summary = stateManager.getSummary();

			expect(summary).toEqual({
				currentState: INITIALIZATION_STATES.ERROR,
				duration: expect.any(Number),
				errorCount: 1,
				stateChanges: 4, // start, dropin_init, sessions_ready, error
				isInitializing: false, // error state is not initializing
				isCompleted: false,
				hasErrors: true,
				context: expect.any(Object)
			});
		});
	});

	describe('onStateChange', () => {
		it('should notify listeners of state changes', () => {
			const listener = vi.fn();
			const unsubscribe = stateManager.onStateChange(listener);

			stateManager.setState(INITIALIZATION_STATES.STARTING);

			expect(listener).toHaveBeenCalledWith(
				INITIALIZATION_STATES.STARTING,
				INITIALIZATION_STATES.IDLE,
				{}
			);

			unsubscribe();
			stateManager.setState(INITIALIZATION_STATES.ERROR);
			expect(listener).toHaveBeenCalledTimes(1); // Should not be called after unsubscribe
		});

		it('should filter notifications by specific states', () => {
			const listener = vi.fn();
			stateManager.onStateChange(listener, [INITIALIZATION_STATES.COMPLETED]);

			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(listener).not.toHaveBeenCalled();

			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			stateManager.complete();
			expect(listener).toHaveBeenCalledWith(
				INITIALIZATION_STATES.COMPLETED,
				INITIALIZATION_STATES.SESSIONS_READY,
				expect.any(Object)
			);
		});
	});

	describe('waitForState', () => {
		it('should resolve immediately if already in target state', async () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);

			const result = await stateManager.waitForState(INITIALIZATION_STATES.STARTING);
			expect(result).toBe(INITIALIZATION_STATES.STARTING);
		});

		it('should resolve when target state is reached', async () => {
			const promise = stateManager.waitForState(INITIALIZATION_STATES.COMPLETED);

			setTimeout(() => {
				stateManager.start();
				stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
				stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
				stateManager.complete();
			}, 50);

			const result = await promise;
			expect(result).toBe(INITIALIZATION_STATES.COMPLETED);
		});

		it('should timeout if state is not reached', async () => {
			await expect(
				stateManager.waitForState(INITIALIZATION_STATES.COMPLETED, 100)
			).rejects.toThrow('Timeout waiting for state completed');
		});

		it('should reject if error state is reached', async () => {
			const promise = stateManager.waitForState(INITIALIZATION_STATES.COMPLETED);

			setTimeout(() => {
				stateManager.setState(INITIALIZATION_STATES.STARTING);
				stateManager.addError(new Error('Test error'));
			}, 50);

			await expect(promise).rejects.toThrow('Initialization failed');
		});
	});

	describe('waitForCompletion', () => {
		it('should resolve when initialization completes', async () => {
			const promise = stateManager.waitForCompletion();

			setTimeout(() => {
				stateManager.start();
				stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
				stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
				stateManager.complete();
			}, 50);

			const result = await promise;
			expect(result).toBe(INITIALIZATION_STATES.COMPLETED);
		});

		it('should use custom timeout', async () => {
			await expect(stateManager.waitForCompletion(100)).rejects.toThrow(
				'Timeout waiting for state completed'
			);
		});
	});

	describe('state transitions validation', () => {
		it('should allow valid initialization flow', () => {
			expect(stateManager.setState(INITIALIZATION_STATES.STARTING)).toBe(true);
			expect(stateManager.setState(INITIALIZATION_STATES.SDK_LOADING)).toBe(true);
			expect(stateManager.setState(INITIALIZATION_STATES.SDK_INITIALIZING)).toBe(true);
			expect(stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY)).toBe(true);
			expect(stateManager.setState(INITIALIZATION_STATES.PAYMENT_INITIALIZING)).toBe(true);
			expect(stateManager.setState(INITIALIZATION_STATES.COMPLETED)).toBe(true);
		});

		it('should allow error transitions from any state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.setState(INITIALIZATION_STATES.ERROR)).toBe(true);
		});

		it('should allow reset from completed state', () => {
			stateManager.start();
			stateManager.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
			stateManager.setState(INITIALIZATION_STATES.SESSIONS_READY);
			stateManager.complete();
			expect(stateManager.setState(INITIALIZATION_STATES.IDLE)).toBe(true);
		});
	});
});

describe('INITIALIZATION_STATES', () => {
	it('should export all required states', () => {
		expect(INITIALIZATION_STATES).toEqual({
			IDLE: 'idle',
			STARTING: 'starting',
			SDK_LOADING: 'sdk_loading',
			SDK_INITIALIZING: 'sdk_initializing',
			DROPIN_INITIALIZING: 'dropin_initializing',
			SESSIONS_READY: 'sessions_ready',
			PAYMENT_INITIALIZING: 'payment_initializing',
			COMPLETED: 'completed',
			ERROR: 'error'
		});
	});
});

describe('Global initializationState instance', () => {
	beforeEach(() => {
		initializationState.reset();
	});

	it('should be instance of InitializationStateManager', () => {
		expect(initializationState).toBeInstanceOf(InitializationStateManager);
	});

	it('should start in IDLE state', () => {
		expect(initializationState.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
	});
});

describe('Helper functions', () => {
	beforeEach(() => {
		initializationState.reset();
	});

	describe('Helper functions', () => {
		beforeEach(() => {
			initializationState.reset();
		});

		afterEach(() => {
			initializationState.reset();
		});

		describe('getInitializationState', () => {
			it('should return current state from global instance', () => {
				expect(getInitializationState()).toBe(INITIALIZATION_STATES.IDLE);

				initializationState.start();
				expect(getInitializationState()).toBe(INITIALIZATION_STATES.STARTING);
			});
		});

		describe('isInitializing', () => {
			it('should return true when global state is initializing', () => {
				initializationState.start();
				expect(isInitializing()).toBe(true);
			});

			it('should return false when global state is not initializing', () => {
				expect(isInitializing()).toBe(false); // idle

				initializationState.start();
				initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
				initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
				initializationState.complete();
				expect(isInitializing()).toBe(false); // completed
			});
		});

		describe('isInitializationComplete', () => {
			it('should return completion status from global instance', () => {
				expect(isInitializationComplete()).toBe(false);

				initializationState.start();
				initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
				initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
				initializationState.complete();
				expect(isInitializationComplete()).toBe(true);
			});
		});

		describe('waitForInitialization', () => {
			it('should wait for global instance completion', async () => {
				const promise = waitForInitialization(1000);

				setTimeout(() => {
					initializationState.start();
					initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
					initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
					initializationState.complete();
				}, 50);

				const result = await promise;
				expect(result).toBe(INITIALIZATION_STATES.COMPLETED);
			});
		});
	});
});

describe('Integration scenarios', () => {
	beforeEach(() => {
		initializationState.reset();
	});

	it('should handle typical SDK initialization flow', async () => {
		expect(getInitializationState()).toBe(INITIALIZATION_STATES.IDLE);
		expect(isInitializing()).toBe(false);

		// Start initialization
		initializationState.start();
		expect(isInitializing()).toBe(true);

		// SDK loading
		initializationState.setState(INITIALIZATION_STATES.SDK_LOADING);
		expect(isInitializing()).toBe(true);

		// SDK initializing
		initializationState.setState(INITIALIZATION_STATES.SDK_INITIALIZING);
		expect(isInitializing()).toBe(true);

		// Sessions ready
		initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
		expect(isInitializing()).toBe(true);

		// Payment initializing
		initializationState.setState(INITIALIZATION_STATES.PAYMENT_INITIALIZING);
		expect(isInitializing()).toBe(true);

		// Complete initialization
		initializationState.complete();
		expect(isInitializing()).toBe(false);
		expect(isInitializationComplete()).toBe(true);
	});

	it('should handle dropin-only initialization flow', () => {
		initializationState.start();
		initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
		initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
		initializationState.setState(INITIALIZATION_STATES.PAYMENT_INITIALIZING);
		initializationState.complete();

		expect(isInitializationComplete()).toBe(true);
		expect(initializationState.getSummary().stateChanges).toBe(5);
	});

	it('should handle initialization with errors', () => {
		initializationState.start();
		initializationState.setState(INITIALIZATION_STATES.SDK_LOADING);
		initializationState.addError(new Error('SDK load failed'), { source: 'sdk' });

		expect(initializationState.hasErrors()).toBe(true);
		expect(getInitializationState()).toBe(INITIALIZATION_STATES.ERROR);
		expect(initializationState.errors).toHaveLength(1);
	});

	it('should handle state change notifications', () => {
		const stateChanges = [];

		initializationState.onStateChange((newState, prevState, context) => {
			stateChanges.push({ newState, prevState, context });
		});

		initializationState.start({ source: 'test' });
		initializationState.setState(INITIALIZATION_STATES.DROPIN_INITIALIZING);
		initializationState.setState(INITIALIZATION_STATES.SESSIONS_READY);
		initializationState.complete({ duration: 1000 });

		expect(stateChanges).toHaveLength(4);
		expect(stateChanges[0]).toEqual({
			newState: INITIALIZATION_STATES.STARTING,
			prevState: INITIALIZATION_STATES.IDLE,
			context: { source: 'test' }
		});
	});
});
