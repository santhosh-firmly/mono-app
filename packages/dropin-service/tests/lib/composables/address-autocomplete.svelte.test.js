import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { createAddressAutocomplete } from '$lib/composables/address-autocomplete.svelte.js';

describe('createAddressAutocomplete', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initialization', () => {
		it('initializes with empty state', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				expect(autocomplete.completions).toEqual([]);
				expect(autocomplete.selectedAddress).toBe(null);
				expect(autocomplete.isLoading).toBe(false);
			});
			cleanup();
		});
	});

	describe('setCompletions', () => {
		it('updates completions list', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const predictions = [{ id: '1', description: '123 Main St' }];

				autocomplete.setCompletions(predictions);
				flushSync();

				expect(autocomplete.completions).toEqual(predictions);
			});
			cleanup();
		});
	});

	describe('setSelectedAddress', () => {
		it('updates selected address', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const address = { street: '123 Main St', city: 'New York' };

				autocomplete.setSelectedAddress(address);
				flushSync();

				expect(autocomplete.selectedAddress).toEqual(address);
			});
			cleanup();
		});

		it('allows direct setter assignment', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const address = { street: '456 Oak Ave' };

				autocomplete.selectedAddress = address;
				flushSync();

				expect(autocomplete.selectedAddress).toEqual(address);
			});
			cleanup();
		});
	});

	describe('setLoading', () => {
		it('updates loading state', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				autocomplete.setLoading(true);
				flushSync();
				expect(autocomplete.isLoading).toBe(true);

				autocomplete.setLoading(false);
				flushSync();
				expect(autocomplete.isLoading).toBe(false);
			});
			cleanup();
		});
	});

	describe('debounce', () => {
		it('delays function execution', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const callback = vi.fn();

				autocomplete.debounce(callback);
				expect(callback).not.toHaveBeenCalled();

				vi.advanceTimersByTime(300);
				expect(callback).toHaveBeenCalledTimes(1);
			});
			cleanup();
		});

		it('schedules multiple callbacks when called multiple times', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const callback1 = vi.fn();
				const callback2 = vi.fn();

				autocomplete.debounce(callback1);
				autocomplete.debounce(callback2);
				vi.advanceTimersByTime(300);

				expect(callback1).toHaveBeenCalledTimes(1);
				expect(callback2).toHaveBeenCalledTimes(1);
			});
			cleanup();
		});
	});

	describe('createAbortSignal', () => {
		it('returns an AbortSignal', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const signal = autocomplete.createAbortSignal();

				expect(signal).toBeInstanceOf(AbortSignal);
				expect(signal.aborted).toBe(false);
			});
			cleanup();
		});

		it('aborts previous signal when called again', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const signal1 = autocomplete.createAbortSignal();
				const signal2 = autocomplete.createAbortSignal();

				expect(signal1.aborted).toBe(true);
				expect(signal2.aborted).toBe(false);
			});
			cleanup();
		});
	});

	describe('reset', () => {
		it('clears all state', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				autocomplete.setCompletions([{ id: '1' }]);
				autocomplete.setSelectedAddress({ street: '123 Main' });
				autocomplete.setLoading(true);
				flushSync();

				autocomplete.reset();
				flushSync();

				expect(autocomplete.completions).toEqual([]);
				expect(autocomplete.selectedAddress).toBe(null);
				expect(autocomplete.isLoading).toBe(false);
			});
			cleanup();
		});

		it('aborts pending requests', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const signal = autocomplete.createAbortSignal();

				autocomplete.reset();

				expect(signal.aborted).toBe(true);
			});
			cleanup();
		});

		it('clears pending timeout on reset', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const callback = vi.fn();

				autocomplete.debounce(callback);
				autocomplete.reset();
				vi.advanceTimersByTime(300);

				expect(callback).not.toHaveBeenCalled();
			});
			cleanup();
		});

		it('handles reset when no pending timeout exists', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				// Reset without any pending operations should not throw
				expect(() => autocomplete.reset()).not.toThrow();
			});
			cleanup();
		});

		it('handles reset when no abort controller exists', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				// Reset without creating abort signal should not throw
				expect(() => autocomplete.reset()).not.toThrow();
			});
			cleanup();
		});
	});

	describe('createAbortSignal edge cases', () => {
		it('clears pending timeout when creating new signal', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();
				const callback = vi.fn();

				autocomplete.debounce(callback);
				autocomplete.createAbortSignal();
				vi.advanceTimersByTime(300);

				expect(callback).not.toHaveBeenCalled();
			});
			cleanup();
		});

		it('handles createAbortSignal when no previous timeout exists', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				const signal = autocomplete.createAbortSignal();
				expect(signal.aborted).toBe(false);
			});
			cleanup();
		});

		it('handles createAbortSignal when no previous abort controller exists', () => {
			const cleanup = $effect.root(() => {
				const autocomplete = createAddressAutocomplete();

				const signal = autocomplete.createAbortSignal();
				expect(signal).toBeInstanceOf(AbortSignal);
			});
			cleanup();
		});
	});
});
