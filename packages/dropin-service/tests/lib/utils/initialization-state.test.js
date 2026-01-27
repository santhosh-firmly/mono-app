import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	INITIALIZATION_STATES,
	InitializationStateManager,
	initializationState,
	getInitializationState,
	isInitializing,
	isInitializationComplete
} from '$lib/utils/initialization-state.js';

describe('initialization-state', () => {
	describe('INITIALIZATION_STATES', () => {
		it('exports all expected states', () => {
			expect(INITIALIZATION_STATES.IDLE).toBe('idle');
			expect(INITIALIZATION_STATES.STARTING).toBe('starting');
			expect(INITIALIZATION_STATES.SDK_READY).toBe('sdk_ready');
			expect(INITIALIZATION_STATES.DROPIN_READY).toBe('dropin_ready');
			expect(INITIALIZATION_STATES.COMPLETED).toBe('completed');
			expect(INITIALIZATION_STATES.ERROR).toBe('error');
		});
	});

	describe('InitializationStateManager', () => {
		let manager;

		beforeEach(() => {
			manager = new InitializationStateManager();
		});

		describe('getCurrentState', () => {
			it('returns IDLE as initial state', () => {
				expect(manager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			});

			it('returns current state after setState', () => {
				manager.setState(INITIALIZATION_STATES.SDK_READY);
				expect(manager.getCurrentState()).toBe(INITIALIZATION_STATES.SDK_READY);
			});
		});

		describe('isCompleted', () => {
			it('returns false when not completed', () => {
				expect(manager.isCompleted()).toBe(false);
			});

			it('returns true when state is COMPLETED', () => {
				manager.setState(INITIALIZATION_STATES.COMPLETED);
				expect(manager.isCompleted()).toBe(true);
			});
		});

		describe('hasErrors', () => {
			it('returns false when no errors', () => {
				expect(manager.hasErrors()).toBe(false);
			});

			it('returns true when state is ERROR', () => {
				manager.setState(INITIALIZATION_STATES.ERROR);
				expect(manager.hasErrors()).toBe(true);
			});

			it('returns true when errors array has items', () => {
				manager.addError(new Error('Test error'));
				expect(manager.hasErrors()).toBe(true);
			});
		});

		describe('isInitializing', () => {
			it('returns false when IDLE', () => {
				expect(manager.isInitializing()).toBe(false);
			});

			it('returns false when COMPLETED', () => {
				manager.setState(INITIALIZATION_STATES.COMPLETED);
				expect(manager.isInitializing()).toBe(false);
			});

			it('returns false when ERROR', () => {
				manager.setState(INITIALIZATION_STATES.ERROR);
				expect(manager.isInitializing()).toBe(false);
			});

			it('returns true when STARTING', () => {
				manager.setState(INITIALIZATION_STATES.STARTING);
				expect(manager.isInitializing()).toBe(true);
			});

			it('returns true when SDK_READY', () => {
				manager.setState(INITIALIZATION_STATES.SDK_READY);
				expect(manager.isInitializing()).toBe(true);
			});

			it('returns true when DROPIN_READY', () => {
				manager.setState(INITIALIZATION_STATES.DROPIN_READY);
				expect(manager.isInitializing()).toBe(true);
			});
		});

		describe('setState', () => {
			it('updates the current state', () => {
				manager.setState(INITIALIZATION_STATES.SDK_READY);
				expect(manager.currentState).toBe(INITIALIZATION_STATES.SDK_READY);
			});

			it('sets startTime when transitioning to STARTING', () => {
				expect(manager.startTime).toBeNull();
				manager.setState(INITIALIZATION_STATES.STARTING);
				expect(manager.startTime).toBeTypeOf('number');
			});

			it('does not set startTime for other states', () => {
				manager.setState(INITIALIZATION_STATES.SDK_READY);
				expect(manager.startTime).toBeNull();
			});
		});

		describe('addError', () => {
			it('adds error to errors array', () => {
				const error = new Error('Test error');
				manager.addError(error);
				expect(manager.errors).toHaveLength(1);
				expect(manager.errors[0].error).toBe(error);
			});

			it('includes timestamp with error', () => {
				manager.addError(new Error('Test'));
				expect(manager.errors[0].timestamp).toBeTypeOf('number');
			});

			it('sets state to ERROR', () => {
				manager.addError(new Error('Test'));
				expect(manager.currentState).toBe(INITIALIZATION_STATES.ERROR);
			});
		});

		describe('start', () => {
			it('clears errors array', () => {
				manager.addError(new Error('Previous error'));
				manager.start();
				expect(manager.errors).toHaveLength(0);
			});

			it('sets state to STARTING', () => {
				manager.start();
				expect(manager.currentState).toBe(INITIALIZATION_STATES.STARTING);
			});

			it('sets startTime', () => {
				manager.start();
				expect(manager.startTime).toBeTypeOf('number');
			});
		});

		describe('complete', () => {
			it('sets state to COMPLETED', () => {
				manager.complete();
				expect(manager.currentState).toBe(INITIALIZATION_STATES.COMPLETED);
			});
		});

		describe('reset', () => {
			it('resets state to IDLE', () => {
				manager.setState(INITIALIZATION_STATES.COMPLETED);
				manager.reset();
				expect(manager.currentState).toBe(INITIALIZATION_STATES.IDLE);
			});

			it('clears errors', () => {
				manager.addError(new Error('Test'));
				manager.reset();
				expect(manager.errors).toHaveLength(0);
			});

			it('clears startTime', () => {
				manager.start();
				manager.reset();
				expect(manager.startTime).toBeNull();
			});
		});

		describe('getDuration', () => {
			it('returns 0 when not started', () => {
				expect(manager.getDuration()).toBe(0);
			});

			it('returns duration since start', () => {
				vi.useFakeTimers();
				manager.start();
				vi.advanceTimersByTime(1000);
				expect(manager.getDuration()).toBe(1000);
				vi.useRealTimers();
			});
		});
	});

	describe('exported singleton and helpers', () => {
		beforeEach(() => {
			initializationState.reset();
		});

		it('exports initializationState singleton', () => {
			expect(initializationState).toBeInstanceOf(InitializationStateManager);
		});

		it('getInitializationState returns current state', () => {
			expect(getInitializationState()).toBe(INITIALIZATION_STATES.IDLE);
			initializationState.start();
			expect(getInitializationState()).toBe(INITIALIZATION_STATES.STARTING);
		});

		it('isInitializing returns initialization status', () => {
			expect(isInitializing()).toBe(false);
			initializationState.start();
			expect(isInitializing()).toBe(true);
		});

		it('isInitializationComplete returns completion status', () => {
			expect(isInitializationComplete()).toBe(false);
			initializationState.complete();
			expect(isInitializationComplete()).toBe(true);
		});
	});
});
