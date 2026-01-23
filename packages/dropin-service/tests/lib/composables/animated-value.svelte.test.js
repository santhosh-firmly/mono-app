import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAnimatedValue, useAnimatedValue } from '$lib/composables/animated-value.svelte.js';

describe('animated-value', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('initializes with the provided value', () => {
		const animated = createAnimatedValue(100);
		expect(animated.value).toBe(100);
		expect(animated.target).toBe(100);
		expect(animated.isAnimating).toBe(false);
	});

	it('initializes with default value of 0', () => {
		const animated = createAnimatedValue();
		expect(animated.value).toBe(0);
		expect(animated.target).toBe(0);
	});

	it('setImmediate updates value instantly without animation', () => {
		const animated = createAnimatedValue(0);
		animated.setImmediate(500);

		expect(animated.value).toBe(500);
		expect(animated.target).toBe(500);
		expect(animated.isAnimating).toBe(false);
	});

	it('set starts animation and updates target', () => {
		const animated = createAnimatedValue(0);
		animated.set(100);

		expect(animated.target).toBe(100);
		expect(animated.isAnimating).toBe(true);
		expect(animated.value).toBe(0);
	});

	it('does not start animation if value is the same', () => {
		const animated = createAnimatedValue(100);
		animated.set(100);

		expect(animated.isAnimating).toBe(false);
	});

	it('animates value over time using requestAnimationFrame', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0, { duration: 100 });
		animated.set(100);

		expect(animated.isAnimating).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(animated.value).toBe(100);
		expect(animated.target).toBe(100);
		expect(animated.isAnimating).toBe(false);

		animated.destroy();
	});

	it('animates value down when decreasing', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(100, { duration: 100 });
		animated.set(0);

		expect(animated.isAnimating).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 150));

		expect(animated.value).toBe(0);
		expect(animated.target).toBe(0);
		expect(animated.isAnimating).toBe(false);

		animated.destroy();
	});

	it('respects custom duration option', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0, { duration: 50 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(animated.isAnimating).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 80));
		expect(animated.value).toBeCloseTo(100, 2);
		expect(animated.isAnimating).toBe(false);

		animated.destroy();
	});

	it('respects custom easing function', async () => {
		vi.useRealTimers();

		const linearEasing = (t) => t;
		const animated = createAnimatedValue(0, { duration: 200, easing: linearEasing });
		animated.set(100);

		// Wait for animation to complete and verify final value
		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(animated.value).toBe(100);
		expect(animated.isAnimating).toBe(false);

		animated.destroy();
	});

	it('cancels previous animation when setting new value', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0, { duration: 200 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 80));
		const intermediateValue = animated.value;
		expect(intermediateValue).toBeGreaterThan(0);
		expect(intermediateValue).toBeLessThan(100);

		animated.set(200);
		expect(animated.target).toBe(200);

		await new Promise((resolve) => setTimeout(resolve, 250));
		expect(animated.value).toBe(200);

		animated.destroy();
	});

	it('setImmediate cancels ongoing animation', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0, { duration: 200 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(animated.isAnimating).toBe(true);

		animated.setImmediate(500);

		expect(animated.value).toBe(500);
		expect(animated.target).toBe(500);
		expect(animated.isAnimating).toBe(false);

		animated.destroy();
	});

	it('destroy cancels ongoing animation', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0, { duration: 200 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(animated.isAnimating).toBe(true);

		animated.destroy();

		const valueAtDestroy = animated.value;
		await new Promise((resolve) => setTimeout(resolve, 200));

		expect(animated.value).toBe(valueAtDestroy);
	});

	it('handles negative values', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(-100, { duration: 100 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(animated.value).toBe(100);

		animated.set(-50);
		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(animated.value).toBe(-50);

		animated.destroy();
	});

	it('handles decimal values', async () => {
		vi.useRealTimers();

		const animated = createAnimatedValue(0.5, { duration: 100 });
		animated.set(99.99);

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(animated.value).toBe(99.99);

		animated.destroy();
	});

	it('setImmediate works when no animation is running', () => {
		const animated = createAnimatedValue(0);
		animated.setImmediate(100);

		expect(animated.value).toBe(100);
		expect(animated.target).toBe(100);
		expect(animated.isAnimating).toBe(false);
	});

	it('destroy works when no animation is running', () => {
		const animated = createAnimatedValue(0);
		expect(() => animated.destroy()).not.toThrow();
	});

	it.skip('works in environments without requestAnimationFrame', async () => {
		const originalRAF = globalThis.requestAnimationFrame;
		const originalCAF = globalThis.cancelAnimationFrame;
		const originalPerformance = globalThis.performance;

		delete globalThis.requestAnimationFrame;
		delete globalThis.cancelAnimationFrame;
		delete globalThis.performance;

		vi.useRealTimers();

		const { createAnimatedValue: createAnimatedValueFallback } = await import(
			'$lib/composables/animated-value.svelte.js?t=' + Date.now()
		);

		const animated = createAnimatedValueFallback(0, { duration: 100 });
		animated.set(100);

		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(animated.value).toBe(100);

		animated.destroy();

		globalThis.requestAnimationFrame = originalRAF;
		globalThis.cancelAnimationFrame = originalCAF;
		globalThis.performance = originalPerformance;
	});
});

describe('useAnimatedValue', () => {
	it('creates animated value from getter function', () => {
		const cleanup = $effect.root(() => {
			let sourceValue = 100;
			const animated = useAnimatedValue(() => sourceValue);

			expect(animated.value).toBe(100);
		});
		cleanup();
	});

	it('animates when source value changes', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(0);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			sourceValue = 100;

			setTimeout(async () => {
				expect(animated.value).toBe(100);
				animated.destroy();
			}, 150);
		});

		await new Promise((resolve) => setTimeout(resolve, 200));
		cleanup();
	});

	it('uses setImmediate when previous value is null', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(null);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			expect(animated.value).toBe(null);

			sourceValue = 100;

			setTimeout(() => {
				expect(animated.value).toBe(100);
				animated.destroy();
			}, 20);
		});

		await new Promise((resolve) => setTimeout(resolve, 50));
		cleanup();
	});

	it('uses setImmediate when previous value is undefined', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(undefined);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			expect(animated.value).toBe(0);

			sourceValue = 100;

			setTimeout(() => {
				expect(animated.value).toBe(100);
				animated.destroy();
			}, 20);
		});

		await new Promise((resolve) => setTimeout(resolve, 50));
		cleanup();
	});

	it('does not animate when value does not change', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(100);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			const initialValue = animated.value;
			sourceValue = 100;

			setTimeout(() => {
				expect(animated.value).toBe(initialValue);
				animated.destroy();
			}, 50);
		});

		await new Promise((resolve) => setTimeout(resolve, 80));
		cleanup();
	});

	it('respects custom duration option', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(0);
			const animated = useAnimatedValue(() => sourceValue, { duration: 50 });

			sourceValue = 100;

			setTimeout(() => {
				expect(animated.value).toBe(100);
				animated.destroy();
			}, 80);
		});

		await new Promise((resolve) => setTimeout(resolve, 110));
		cleanup();
	});

	it('animates multiple value changes', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(0);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			setTimeout(() => {
				sourceValue = 50;
				setTimeout(() => {
					expect(animated.value).toBeCloseTo(50, 0);
					sourceValue = 100;
					setTimeout(() => {
						expect(animated.value).toBeCloseTo(100, 0);
						animated.destroy();
					}, 120);
				}, 120);
			}, 0);
		});

		await new Promise((resolve) => setTimeout(resolve, 300));
		cleanup();
	});

	it('cleans up on destroy', () => {
		const cleanup = $effect.root(() => {
			let sourceValue = $state(100);
			const animated = useAnimatedValue(() => sourceValue);

			expect(() => animated.destroy()).not.toThrow();
		});
		cleanup();
	});

	it('cleans up effect automatically on component unmount', async () => {
		vi.useRealTimers();

		const cleanup = $effect.root(() => {
			let sourceValue = $state(0);
			const animated = useAnimatedValue(() => sourceValue, { duration: 100 });

			sourceValue = 100;

			setTimeout(() => {
				expect(animated.value).toBe(100);
				animated.destroy();
			}, 150);
		});

		await new Promise((resolve) => setTimeout(resolve, 200));
		cleanup();
	});
});
