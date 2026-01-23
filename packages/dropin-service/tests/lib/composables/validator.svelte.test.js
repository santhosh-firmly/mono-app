import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { useValidator } from '$lib/composables/validator.svelte.js';

describe('useValidator', () => {
	describe('initialization', () => {
		it('initializes with empty value by default', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', () => {});
				expect(validator.value).toBe('');
				expect(validator.error).toBe('');
				expect(validator.filled).toBeFalsy();
			});
			cleanup();
		});

		it('initializes with provided value', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('initial', () => {});
				expect(validator.value).toBe('initial');
			});
			cleanup();
		});
	});

	describe('validate', () => {
		it('sets error when validation fails', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', (v) => {
					if (!v) throw new Error('Required');
				});

				validator.validate();
				flushSync();

				expect(validator.error).toBe('Required');
			});
			cleanup();
		});

		it('clears error when validation passes', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', (v) => {
					if (!v) throw new Error('Required');
				});

				validator.validate();
				flushSync();
				expect(validator.error).toBe('Required');

				validator.validate('valid value');
				flushSync();
				expect(validator.error).toBe('');
			});
			cleanup();
		});

		it('updates value when validate is called with new value', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', () => {});

				validator.validate('new value');
				flushSync();

				expect(validator.value).toBe('new value');
			});
			cleanup();
		});
	});

	describe('filled', () => {
		it('returns true when value exists and no error', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('valid', () => {});

				validator.validate();
				flushSync();

				expect(validator.filled).toBe(true);
			});
			cleanup();
		});

		it('returns falsy when value exists but has error', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('invalid', () => {
					throw new Error('Always fails');
				});

				validator.validate();
				flushSync();

				expect(validator.filled).toBeFalsy();
			});
			cleanup();
		});

		it('returns falsy when value is empty', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', () => {});
				expect(validator.filled).toBeFalsy();
			});
			cleanup();
		});
	});

	describe('reset', () => {
		it('clears value and error', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('value', (v) => {
					if (!v) throw new Error('Required');
				});

				validator.validate();
				flushSync();

				validator.reset();
				flushSync();

				expect(validator.value).toBe('');
				expect(validator.error).toBe('');
			});
			cleanup();
		});
	});

	describe('value setter', () => {
		it('allows direct value assignment', () => {
			const cleanup = $effect.root(() => {
				const validator = useValidator('', () => {});

				validator.value = 'directly set';
				flushSync();

				expect(validator.value).toBe('directly set');
			});
			cleanup();
		});
	});
});
