import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { createMockTelemetry } from '../__mock__/mock-factories.js';
import { initializeBuyNow, getBuyNow, resetBuyNow } from '$lib/states/buy-now.svelte.js';

vi.mock('$lib/services/telemetry.js', () => createMockTelemetry());

describe('buy-now state', () => {
	beforeEach(() => {
		resetBuyNow();
	});

	afterEach(() => {
		resetBuyNow();
	});

	describe('initializeBuyNow', () => {
		it('creates buy-now instance with default values', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				expect(buyNow.layoutType).toBe('fullscreen');
				expect(buyNow.layoutTransitionTime).toBe(0);
				expect(buyNow.isLayoutActive).toBe(true);
				expect(buyNow.mode).toBe('checkout');
				expect(buyNow.errorMessage).toBe('');
			});
			cleanup();
		});

		it('initializes with provided mode', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow('checkout');

				expect(buyNow.mode).toBe('checkout');
			});
			cleanup();
		});
	});

	describe('getBuyNow', () => {
		it('returns initialized buy-now instance', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();
				expect(getBuyNow()).toBe(buyNow);
			});
			cleanup();
		});

		it('throws when buy-now not initialized', () => {
			expect(() => getBuyNow()).toThrow('BuyNow not initialized');
		});
	});

	describe('setupLayout', () => {
		it('sets fullscreen layout by default', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setupLayout('fullscreen');

				expect(buyNow.layoutType).toBe('fullscreen');
				expect(buyNow.layoutTransitionTime).toBe(0);
			});
			cleanup();
		});

		it('sets sidebar layout with transition time', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setupLayout('sidebar');

				expect(buyNow.layoutType).toBe('sidebar');
				expect(buyNow.layoutTransitionTime).toBe(300);
			});
			cleanup();
		});

		it('sets popup layout', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setupLayout('popup');

				expect(buyNow.layoutType).toBe('popup');
				expect(buyNow.layoutTransitionTime).toBe(0);
			});
			cleanup();
		});

		it('sets bottomsheet layout', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setupLayout('bottomsheet');

				expect(buyNow.layoutType).toBe('bottomsheet');
				expect(buyNow.layoutTransitionTime).toBe(0);
			});
			cleanup();
		});

		it('falls back to fullscreen for unknown layout', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setupLayout('unknown');

				expect(buyNow.layoutType).toBe('fullscreen');
				expect(buyNow.layoutTransitionTime).toBe(0);
			});
			cleanup();
		});
	});

	describe('navigation', () => {
		it('goToCheckout changes mode to checkout', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.goToCheckout();
				flushSync();

				expect(buyNow.mode).toBe('checkout');
			});
			cleanup();
		});

		it('goToPdp changes mode to pdp', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();
				buyNow.goToCheckout();
				flushSync();

				buyNow.goToPdp();
				flushSync();

				expect(buyNow.mode).toBe('pdp');
			});
			cleanup();
		});
	});

	describe('error handling', () => {
		it('setError sets error and changes mode', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();
				const error = new Error('Test error');

				buyNow.setError(error);
				flushSync();

				expect(buyNow.mode).toBe('error');
				expect(buyNow.errorMessage).toBe('Test error');
			});
			cleanup();
		});

		it('setError accepts custom message', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setError('error', 'Custom message');
				flushSync();

				expect(buyNow.errorMessage).toBe('Custom message');
			});
			cleanup();
		});

		it('setError converts non-Error to string', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.setError({ custom: 'error' });
				flushSync();

				expect(buyNow.errorMessage).toBe('[object Object]');
			});
			cleanup();
		});

		it('clearError resets error state', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();
				buyNow.setError(new Error('Test'));
				flushSync();

				buyNow.clearError();
				flushSync();

				expect(buyNow.mode).toBe('pdp');
				expect(buyNow.errorMessage).toBe('');
			});
			cleanup();
		});

		it('clearError does not change mode if not in error mode', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();
				buyNow.goToCheckout();
				flushSync();
				buyNow.errorMessage = 'test error';
				flushSync();

				buyNow.clearError();
				flushSync();

				expect(buyNow.errorMessage).toBe('');
				expect(buyNow.mode).toBe('checkout');
			});
			cleanup();
		});
	});

	describe('close', () => {
		it('sets isLayoutActive to false', () => {
			const cleanup = $effect.root(() => {
				const buyNow = initializeBuyNow();

				buyNow.close();
				flushSync();

				expect(buyNow.isLayoutActive).toBe(false);
			});
			cleanup();
		});
	});
});
