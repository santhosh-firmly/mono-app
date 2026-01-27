import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeNotices, getNotices, resetNotices } from '$lib/states/notices.svelte.js';

describe('notices state', () => {
	let uuidCounter = 0;

	beforeEach(() => {
		resetNotices();
		uuidCounter = 0;
		vi.stubGlobal('crypto', {
			randomUUID: () => 'mock-uuid-' + uuidCounter++
		});
	});

	afterEach(() => {
		resetNotices();
		vi.unstubAllGlobals();
	});

	describe('initialization', () => {
		it('creates notices instance', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				expect(notices).toBeDefined();
				expect(notices.notices).toEqual([]);
			});
			cleanup();
		});

		it('getNotices returns initialized instance', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				expect(getNotices()).toBe(notices);
			});
			cleanup();
		});

		it('getNotices creates instance if not initialized', () => {
			const cleanup = $effect.root(() => {
				const notices = getNotices();
				expect(notices).toBeDefined();
				expect(notices.notices).toEqual([]);
			});
			cleanup();
		});
	});

	describe('add notice', () => {
		it('adds notice with generated ID', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id = notices.add({
					type: 'info',
					message: 'Test message'
				});

				expect(id).toBeDefined();
				expect(notices.notices).toHaveLength(1);
				expect(notices.notices[0]).toMatchObject({
					id,
					type: 'info',
					message: 'Test message',
					duration: 10000
				});
			});
			cleanup();
		});

		it('adds notice with custom duration', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				notices.add({
					type: 'success',
					message: 'Custom duration',
					duration: 5000
				});

				expect(notices.notices[0].duration).toBe(5000);
			});
			cleanup();
		});

		it('adds notice with action', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const onAction = vi.fn();

				notices.add({
					type: 'warning',
					message: 'With action',
					actionLabel: 'Undo',
					onAction
				});

				expect(notices.notices[0].actionLabel).toBe('Undo');
				expect(notices.notices[0].onAction).toBe(onAction);
			});
			cleanup();
		});

		it('adds notice with image', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const imageUrl = 'https://example.com/product.jpg';

				notices.add({
					type: 'info',
					message: 'With image',
					image: imageUrl
				});

				expect(notices.notices[0].image).toBe(imageUrl);
			});
			cleanup();
		});

		it('adds multiple notices', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();

				notices.add({ type: 'info', message: 'First' });
				notices.add({ type: 'success', message: 'Second' });
				notices.add({ type: 'error', message: 'Third' });

				expect(notices.notices).toHaveLength(3);
				expect(notices.notices[0].message).toBe('First');
				expect(notices.notices[1].message).toBe('Second');
				expect(notices.notices[2].message).toBe('Third');
			});
			cleanup();
		});
	});

	describe('info notice', () => {
		it('adds info notice', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id = notices.info('Info message');

				expect(id).toBeDefined();
				expect(notices.notices).toHaveLength(1);
				expect(notices.notices[0]).toMatchObject({
					id,
					type: 'info',
					message: 'Info message',
					duration: 10000
				});
			});
			cleanup();
		});

		it('adds info notice with options', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const onAction = vi.fn();

				notices.info('Info with options', {
					actionLabel: 'Close',
					onAction,
					duration: 3000
				});

				expect(notices.notices[0]).toMatchObject({
					type: 'info',
					message: 'Info with options',
					actionLabel: 'Close',
					duration: 3000
				});
				expect(notices.notices[0].onAction).toBe(onAction);
			});
			cleanup();
		});
	});

	describe('success notice', () => {
		it('adds success notice', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id = notices.success('Success message');

				expect(id).toBeDefined();
				expect(notices.notices).toHaveLength(1);
				expect(notices.notices[0]).toMatchObject({
					id,
					type: 'success',
					message: 'Success message',
					duration: 10000
				});
			});
			cleanup();
		});

		it('adds success notice with image', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const imageUrl = 'https://example.com/product.jpg';

				notices.success('Item added', {
					image: imageUrl
				});

				expect(notices.notices[0]).toMatchObject({
					type: 'success',
					message: 'Item added',
					image: imageUrl
				});
			});
			cleanup();
		});
	});

	describe('warning notice', () => {
		it('adds warning notice', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id = notices.warning('Warning message');

				expect(id).toBeDefined();
				expect(notices.notices).toHaveLength(1);
				expect(notices.notices[0]).toMatchObject({
					id,
					type: 'warning',
					message: 'Warning message',
					duration: 10000
				});
			});
			cleanup();
		});

		it('adds warning notice with action', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const onAction = vi.fn();

				notices.warning('Low stock', {
					actionLabel: 'View details',
					onAction
				});

				expect(notices.notices[0]).toMatchObject({
					type: 'warning',
					message: 'Low stock',
					actionLabel: 'View details'
				});
			});
			cleanup();
		});
	});

	describe('error notice', () => {
		it('adds error notice', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id = notices.error('Error message');

				expect(id).toBeDefined();
				expect(notices.notices).toHaveLength(1);
				expect(notices.notices[0]).toMatchObject({
					id,
					type: 'error',
					message: 'Error message',
					duration: 10000
				});
			});
			cleanup();
		});

		it('adds error notice with custom duration', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();

				notices.error('Critical error', {
					duration: 15000
				});

				expect(notices.notices[0]).toMatchObject({
					type: 'error',
					message: 'Critical error',
					duration: 15000
				});
			});
			cleanup();
		});
	});

	describe('dismiss notice', () => {
		it('removes notice by ID', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				const id1 = notices.info('First');
				const id2 = notices.success('Second');
				const id3 = notices.error('Third');

				expect(notices.notices).toHaveLength(3);

				notices.dismiss(id2);

				expect(notices.notices).toHaveLength(2);
				expect(notices.notices.find((n) => n.id === id1)).toBeDefined();
				expect(notices.notices.find((n) => n.id === id2)).toBeUndefined();
				expect(notices.notices.find((n) => n.id === id3)).toBeDefined();
			});
			cleanup();
		});

		it('does nothing when dismissing non-existent ID', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				notices.info('Test');

				expect(notices.notices).toHaveLength(1);

				notices.dismiss('non-existent-id');

				expect(notices.notices).toHaveLength(1);
			});
			cleanup();
		});

		it('handles empty notices array', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();

				expect(() => {
					notices.dismiss('any-id');
				}).not.toThrow();

				expect(notices.notices).toHaveLength(0);
			});
			cleanup();
		});
	});

	describe('clear notices', () => {
		it('removes all notices', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();
				notices.info('Info');
				notices.success('Success');
				notices.warning('Warning');
				notices.error('Error');

				expect(notices.notices).toHaveLength(4);

				notices.clear();

				expect(notices.notices).toHaveLength(0);
			});
			cleanup();
		});

		it('handles empty notices array', () => {
			const cleanup = $effect.root(() => {
				const notices = initializeNotices();

				expect(() => {
					notices.clear();
				}).not.toThrow();

				expect(notices.notices).toHaveLength(0);
			});
			cleanup();
		});
	});

	describe('reset', () => {
		it('resets instance to null', () => {
			const cleanup = $effect.root(() => {
				initializeNotices();
				resetNotices();

				const newNotices = getNotices();
				expect(newNotices.notices).toEqual([]);
			});
			cleanup();
		});
	});
});
