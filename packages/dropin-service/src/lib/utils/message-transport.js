/**
 * Message Transport Utility
 *
 * Abstraction for cross-window messaging (iframe communication).
 */

const defaultTransport = {
	postMessage(data, origin = '*') {
		if (typeof window === 'undefined') {
			console.warn('message-transport: window not available (SSR mode)');
			return;
		}

		try {
			window.parent.postMessage(JSON.stringify(data), origin);
		} catch (error) {
			console.error('message-transport: postMessage error:', error);
		}
	},

	addEventListener(handler) {
		if (typeof window === 'undefined') {
			return () => {};
		}

		const listener = (event) => {
			try {
				handler(event);
			} catch (error) {
				console.error('message-transport: handler error:', error);
			}
		};

		window.addEventListener('message', listener);
		return () => window.removeEventListener('message', listener);
	}
};

let currentTransport = defaultTransport;

export function setTransport(transport) {
	currentTransport = transport;
}

export function resetTransport() {
	currentTransport = defaultTransport;
}

export function _getCurrentTransport() {
	return currentTransport;
}

// Outgoing Messages

export function postCheckoutClosed(domain) {
	currentTransport.postMessage({
		action: 'firmly::CheckoutClosed',
		domain
	});
}

export function postOrderPlaced(url, session) {
	currentTransport.postMessage({
		action: 'firmly::OrderPlaced',
		url,
		session
	});
}

export function postQuantityUpdated(totalQuantity) {
	currentTransport.postMessage({
		action: 'firmly::QuantityUpdated',
		totalQuantity
	});
}

export function postCartUpdated(cart) {
	currentTransport.postMessage({
		action: 'firmly::CartUpdated',
		cart
	});
}

export function postError(error, context = {}) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	currentTransport.postMessage({
		action: 'firmly::Error',
		error: errorMessage,
		context
	});
}

export function postUpdateCart() {
	currentTransport.postMessage({
		action: 'cartUpdate'
	});
}

export function postGetParentInfo() {
	currentTransport.postMessage({
		action: 'getParentInfo'
	});
}

export function postGetDynamoInfo() {
	currentTransport.postMessage({
		action: 'firmly::getDynamoInfo'
	});
}

export function postSignIn(cookies) {
	currentTransport.postMessage({
		action: 'firmlySignIn',
		cookies
	});
}

export function postRefresh() {
	currentTransport.postMessage({
		action: 'firmlyRefresh'
	});
}

// Incoming Messages

export function onParentMessage(handler) {
	return currentTransport.addEventListener((event) => {
		try {
			const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
			handler(data, event);
		} catch (error) {
			if (error instanceof SyntaxError) return;
			console.error('onParentMessage: handler error:', error);
		}
	});
}

export function onMessageAction(action, handler) {
	return onParentMessage((data) => {
		if (data?.action === action) {
			handler(data);
		}
	});
}
