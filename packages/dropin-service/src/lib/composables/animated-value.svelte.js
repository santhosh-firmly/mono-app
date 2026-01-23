/**
 * Creates an animated value that tweens between values when changed.
 * Useful for counting up/down effects on price changes.
 *
 * @param {number} initialValue - The initial value
 * @param {Object} [options] - Animation options
 * @param {number} [options.duration=300] - Animation duration in milliseconds
 * @param {(t: number) => number} [options.easing] - Easing function (default: ease-out cubic)
 * @returns {{ value: number, target: number, isAnimating: boolean }}
 */
export function createAnimatedValue(initialValue = 0, options = {}) {
	const { duration = 300, easing = (t) => 1 - Math.pow(1 - t, 3) } = options;

	let displayValue = $state(initialValue);
	let targetValue = $state(initialValue);
	let isAnimating = $state(false);
	let animationFrame = null;

	const raf =
		typeof requestAnimationFrame !== 'undefined'
			? requestAnimationFrame
			: (fn) => setTimeout(fn, 16);

	const caf = typeof cancelAnimationFrame !== 'undefined' ? cancelAnimationFrame : clearTimeout;

	const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();

	function animate(from, to, startTime) {
		const elapsed = now() - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const easedProgress = easing(progress);

		displayValue = from + (to - from) * easedProgress;

		if (progress < 1) {
			animationFrame = raf(() => animate(from, to, startTime));
		} else {
			displayValue = to;
			isAnimating = false;
			animationFrame = null;
		}
	}

	function set(newValue) {
		if (newValue === targetValue) return;

		if (animationFrame) {
			caf(animationFrame);
		}

		const from = displayValue;
		targetValue = newValue;
		isAnimating = true;

		animationFrame = raf(() => animate(from, newValue, now()));
	}

	function setImmediate(newValue) {
		if (animationFrame) {
			caf(animationFrame);
			animationFrame = null;
		}
		displayValue = newValue;
		targetValue = newValue;
		isAnimating = false;
	}

	function destroy() {
		if (animationFrame) {
			caf(animationFrame);
			animationFrame = null;
		}
	}

	return {
		get value() {
			return displayValue;
		},
		get target() {
			return targetValue;
		},
		get isAnimating() {
			return isAnimating;
		},
		set,
		setImmediate,
		destroy
	};
}

/**
 * Creates a reactive animated value that automatically animates when the source value changes.
 * Use this in Svelte components with $effect for automatic cleanup.
 *
 * @param {() => number} getValue - Function that returns the current value (use arrow fn for reactivity)
 * @param {Object} [options] - Animation options
 * @param {number} [options.duration=400] - Animation duration in milliseconds
 * @returns {{ value: number, destroy: () => void }}
 */
export function useAnimatedValue(getValue, options = {}) {
	const animated = createAnimatedValue(getValue(), { duration: 400, ...options });
	let previousValue = getValue();

	$effect(() => {
		const currentValue = getValue();
		if (previousValue === currentValue) return;

		if (previousValue === null || previousValue === undefined) {
			animated.setImmediate(currentValue);
		} else {
			animated.set(currentValue);
		}
		previousValue = currentValue;
	});

	$effect(() => {
		return () => animated.destroy();
	});

	return {
		get value() {
			return animated.value;
		},
		destroy: animated.destroy
	};
}
