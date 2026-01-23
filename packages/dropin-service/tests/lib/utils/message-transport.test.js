import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	setTransport,
	resetTransport,
	_getCurrentTransport,
	postCheckoutClosed,
	postOrderPlaced,
	postQuantityUpdated,
	postCartUpdated,
	postError,
	postUpdateCart,
	postGetParentInfo,
	postGetDynamoInfo,
	postSignIn,
	postRefresh,
	onParentMessage,
	onMessageAction
} from '$lib/utils/message-transport.js';

describe('message-transport', () => {
	let mockTransport;

	beforeEach(() => {
		mockTransport = {
			postMessage: vi.fn(),
			addEventListener: vi.fn().mockReturnValue(vi.fn())
		};
		setTransport(mockTransport);
	});

	afterEach(() => {
		resetTransport();
	});

	describe('transport management', () => {
		it('sets custom transport', () => {
			expect(_getCurrentTransport()).toBe(mockTransport);
		});

		it('resets to default transport', () => {
			resetTransport();
			expect(_getCurrentTransport()).not.toBe(mockTransport);
		});
	});

	describe('outgoing messages', () => {
		it('postCheckoutClosed sends correct message', () => {
			postCheckoutClosed('example.com');

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::CheckoutClosed',
				domain: 'example.com'
			});
		});

		it('postOrderPlaced sends correct message', () => {
			postOrderPlaced('https://example.com/order', { id: 'session123' });

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::OrderPlaced',
				url: 'https://example.com/order',
				session: { id: 'session123' }
			});
		});

		it('postQuantityUpdated sends correct message', () => {
			postQuantityUpdated(5);

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::QuantityUpdated',
				totalQuantity: 5
			});
		});

		it('postCartUpdated sends correct message', () => {
			const cart = { items: [], total: 100 };
			postCartUpdated(cart);

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::CartUpdated',
				cart
			});
		});

		it('postError sends error message with Error object', () => {
			const error = new Error('Test error');
			postError(error, { step: 'checkout' });

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::Error',
				error: 'Test error',
				context: { step: 'checkout' }
			});
		});

		it('postError sends error message with string', () => {
			postError('String error');

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::Error',
				error: 'String error',
				context: {}
			});
		});

		it('postUpdateCart sends correct message', () => {
			postUpdateCart();

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'cartUpdate'
			});
		});

		it('postGetParentInfo sends correct message', () => {
			postGetParentInfo();

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'getParentInfo'
			});
		});

		it('postGetDynamoInfo sends correct message', () => {
			postGetDynamoInfo();

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmly::getDynamoInfo'
			});
		});

		it('postSignIn sends correct message', () => {
			postSignIn({ token: 'abc123' });

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmlySignIn',
				cookies: { token: 'abc123' }
			});
		});

		it('postRefresh sends correct message', () => {
			postRefresh();

			expect(mockTransport.postMessage).toHaveBeenCalledWith({
				action: 'firmlyRefresh'
			});
		});
	});

	describe('incoming messages', () => {
		it('onParentMessage registers event listener', () => {
			const handler = vi.fn();
			onParentMessage(handler);

			expect(mockTransport.addEventListener).toHaveBeenCalled();
		});

		it('onParentMessage parses JSON string data', () => {
			const handler = vi.fn();
			let capturedListener;
			mockTransport.addEventListener.mockImplementation((listener) => {
				capturedListener = listener;
				return vi.fn();
			});

			onParentMessage(handler);

			const event = { data: JSON.stringify({ action: 'test' }) };
			capturedListener(event);

			expect(handler).toHaveBeenCalledWith({ action: 'test' }, event);
		});

		it('onParentMessage handles already-parsed object data', () => {
			const handler = vi.fn();
			let capturedListener;
			mockTransport.addEventListener.mockImplementation((listener) => {
				capturedListener = listener;
				return vi.fn();
			});

			onParentMessage(handler);

			const event = { data: { action: 'test' } };
			capturedListener(event);

			expect(handler).toHaveBeenCalledWith({ action: 'test' }, event);
		});

		it('onParentMessage ignores invalid JSON silently', () => {
			const handler = vi.fn();
			let capturedListener;
			mockTransport.addEventListener.mockImplementation((listener) => {
				capturedListener = listener;
				return vi.fn();
			});

			onParentMessage(handler);

			const event = { data: 'not-valid-json' };
			expect(() => capturedListener(event)).not.toThrow();
			expect(handler).not.toHaveBeenCalled();
		});

		it('onParentMessage logs non-syntax errors', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			const handler = vi.fn().mockImplementation(() => {
				throw new Error('Handler error');
			});
			let capturedListener;
			mockTransport.addEventListener.mockImplementation((listener) => {
				capturedListener = listener;
				return vi.fn();
			});

			onParentMessage(handler);

			const event = { data: JSON.stringify({ action: 'test' }) };
			capturedListener(event);

			expect(consoleError).toHaveBeenCalledWith(
				'onParentMessage: handler error:',
				expect.any(Error)
			);
			consoleError.mockRestore();
		});

		it('onMessageAction calls handler only for matching action', () => {
			const handler = vi.fn();
			let capturedListener;
			mockTransport.addEventListener.mockImplementation((listener) => {
				capturedListener = listener;
				return vi.fn();
			});

			onMessageAction('targetAction', handler);

			capturedListener({ data: JSON.stringify({ action: 'targetAction', value: 1 }) });
			expect(handler).toHaveBeenCalledWith({ action: 'targetAction', value: 1 });

			handler.mockClear();
			capturedListener({ data: JSON.stringify({ action: 'otherAction' }) });
			expect(handler).not.toHaveBeenCalled();
		});

		it('onMessageAction returns unsubscribe function', () => {
			const unsubscribe = vi.fn();
			mockTransport.addEventListener.mockReturnValue(unsubscribe);

			const result = onMessageAction('test', vi.fn());

			expect(result).toBe(unsubscribe);
		});
	});

	describe('default transport behavior', () => {
		beforeEach(() => {
			resetTransport();
		});

		it('default transport posts message to parent window', () => {
			const postMessageSpy = vi.fn();
			vi.stubGlobal('window', {
				parent: { postMessage: postMessageSpy },
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			});

			postCheckoutClosed('test.com');

			expect(postMessageSpy).toHaveBeenCalledWith(
				JSON.stringify({ action: 'firmly::CheckoutClosed', domain: 'test.com' }),
				'*'
			);

			vi.unstubAllGlobals();
		});

		it('default transport adds and removes event listener', () => {
			const addSpy = vi.fn();
			const removeSpy = vi.fn();
			vi.stubGlobal('window', {
				parent: { postMessage: vi.fn() },
				addEventListener: addSpy,
				removeEventListener: removeSpy
			});

			const unsubscribe = onParentMessage(vi.fn());
			expect(addSpy).toHaveBeenCalledWith('message', expect.any(Function));

			unsubscribe();
			expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));

			vi.unstubAllGlobals();
		});

		it('default transport handles SSR mode (no window)', () => {
			const originalWindow = global.window;
			delete global.window;

			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const transport = _getCurrentTransport();
			transport.postMessage({ test: true });

			expect(consoleWarn).toHaveBeenCalledWith(
				'message-transport: window not available (SSR mode)'
			);

			global.window = originalWindow;
			consoleWarn.mockRestore();
		});

		it('default transport addEventListener returns noop in SSR mode', () => {
			const originalWindow = global.window;
			delete global.window;

			const transport = _getCurrentTransport();
			const unsubscribe = transport.addEventListener(vi.fn());

			expect(unsubscribe).toBeTypeOf('function');
			expect(() => unsubscribe()).not.toThrow();

			global.window = originalWindow;
		});

		it('default transport handles postMessage error', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			vi.stubGlobal('window', {
				parent: {
					postMessage: vi.fn().mockImplementation(() => {
						throw new Error('PostMessage failed');
					})
				}
			});

			const transport = _getCurrentTransport();
			transport.postMessage({ test: true });

			expect(consoleError).toHaveBeenCalledWith(
				'message-transport: postMessage error:',
				expect.any(Error)
			);

			vi.unstubAllGlobals();
			consoleError.mockRestore();
		});

		it('default transport handles handler error in addEventListener', () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			let capturedListener;
			vi.stubGlobal('window', {
				parent: { postMessage: vi.fn() },
				addEventListener: (type, listener) => {
					capturedListener = listener;
				},
				removeEventListener: vi.fn()
			});

			const transport = _getCurrentTransport();
			transport.addEventListener(() => {
				throw new Error('Handler error');
			});

			capturedListener({ data: 'test' });

			expect(consoleError).toHaveBeenCalledWith(
				'message-transport: handler error:',
				expect.any(Error)
			);

			vi.unstubAllGlobals();
			consoleError.mockRestore();
		});
	});
});
