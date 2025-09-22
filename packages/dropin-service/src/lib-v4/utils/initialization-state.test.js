import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	InitializationStateManager,
	initializationState,
	INITIALIZATION_STATES,
	isInitializing,
	getInitializationState,
	isInitializationComplete
} from './initialization-state.js';

describe('InitializationStateManager', () => {
	let stateManager;

	beforeEach(() => {
		stateManager = new InitializationStateManager();
	});

	describe('constructor', () => {
		it('should initialize with default state', () => {
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			expect(stateManager.isCompleted()).toBe(false);
			expect(stateManager.errors).toEqual([]);
		});
	});

	describe('setState', () => {
		it('should update current state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.STARTING);
		});

		it('should set start time when starting', () => {
			expect(stateManager.startTime).toBeNull();
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.startTime).toBeGreaterThan(0);
		});
	});

	describe('state checking methods', () => {
		it('should identify completed state', () => {
			stateManager.setState(INITIALIZATION_STATES.COMPLETED);
			expect(stateManager.isCompleted()).toBe(true);
		});

		it('should identify error state', () => {
			stateManager.setState(INITIALIZATION_STATES.ERROR);
			expect(stateManager.hasErrors()).toBe(true);
		});

		it('should identify initializing states', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.isInitializing()).toBe(true);

			stateManager.setState(INITIALIZATION_STATES.COMPLETED);
			expect(stateManager.isInitializing()).toBe(false);
		});
	});

	describe('error handling', () => {
		it('should add error and set error state', () => {
			const error = new Error('Test error');
			stateManager.addError(error);

			expect(stateManager.errors).toHaveLength(1);
			expect(stateManager.errors[0].error).toBe(error);
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.ERROR);
		});
	});

	describe('lifecycle methods', () => {
		it('should start initialization', () => {
			stateManager.start();
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.STARTING);
			expect(stateManager.errors).toEqual([]);
		});

		it('should complete initialization', () => {
			stateManager.complete();
			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.COMPLETED);
		});

		it('should reset state', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			stateManager.addError(new Error('test'));

			stateManager.reset();

			expect(stateManager.getCurrentState()).toBe(INITIALIZATION_STATES.IDLE);
			expect(stateManager.errors).toEqual([]);
			expect(stateManager.startTime).toBeNull();
		});
	});

	describe('getDuration', () => {
		it('should return 0 when no start time', () => {
			expect(stateManager.getDuration()).toBe(0);
		});

		it('should calculate duration from start time', () => {
			stateManager.setState(INITIALIZATION_STATES.STARTING);
			expect(stateManager.getDuration()).toBeGreaterThanOrEqual(0);
		});
	});
});

describe('exported utilities', () => {
	beforeEach(() => {
		initializationState.reset();
	});

	it('should get current initialization state', () => {
		expect(getInitializationState()).toBe(INITIALIZATION_STATES.IDLE);

		initializationState.setState(INITIALIZATION_STATES.STARTING);
		expect(getInitializationState()).toBe(INITIALIZATION_STATES.STARTING);
	});

	it('should check if initializing', () => {
		expect(isInitializing()).toBe(false);

		initializationState.setState(INITIALIZATION_STATES.STARTING);
		expect(isInitializing()).toBe(true);

		initializationState.setState(INITIALIZATION_STATES.COMPLETED);
		expect(isInitializing()).toBe(false);
	});

	it('should check if initialization is complete', () => {
		expect(isInitializationComplete()).toBe(false);

		initializationState.setState(INITIALIZATION_STATES.COMPLETED);
		expect(isInitializationComplete()).toBe(true);
	});
});
