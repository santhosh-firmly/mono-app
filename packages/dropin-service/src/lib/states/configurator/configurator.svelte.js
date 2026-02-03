import { availableLanguageTags, languageTag, setLanguageTag } from '$lib/paraglide/runtime.js';

const VALID_LAYOUT_TYPES = ['sidebar', 'popup', 'bottomsheet', 'fullscreen'];
const VALID_PRODUCTS = ['checkout', 'buyNow'];

const THEME_PRESETS = {
	default: {
		id: 'default',
		name: 'Default',
		merchantName: 'The Firmly Store',
		largeLogo: null,
		smallLogo: null,
		primaryColor: '#ffffff',
		actionColor: '#333333'
	},
	liquidIv: {
		id: 'liquidIv',
		name: 'Liquid IV',
		merchantName: 'Liquid IV',
		largeLogo: 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png',
		smallLogo: null,
		primaryColor: '#e3f8f9',
		actionColor: '#35cad0'
	}
};

class Configurator {
	product = $state('buyNow');
	pdpEnabled = $state(true);
	pendingRequests = $state([]);
	requestHistory = $state([]);
	defaultDelay = $state(1000);
	autoAccept = $state(true);
	viewportWidth = $state(1200);
	layoutType = $state('sidebar');
	language = $state(languageTag());
	features = $state({
		promoCodes: true,
		paypal: true,
		clickToPay: true
	});
	theme = $state({
		merchantName: THEME_PRESETS.default.merchantName,
		largeLogo: THEME_PRESETS.default.largeLogo,
		smallLogo: THEME_PRESETS.default.smallLogo,
		primaryColor: THEME_PRESETS.default.primaryColor,
		actionColor: THEME_PRESETS.default.actionColor
	});

	availableLanguages = availableLanguageTags;
	themePresets = Object.values(THEME_PRESETS);

	#requestIdCounter = 0;
	#timeouts = {};

	get allRequests() {
		const pending = this.pendingRequests.map((r) => ({ ...r, status: 'pending' }));
		const completed = [...this.requestHistory].reverse();
		return [...pending, ...completed];
	}

	addRequest(type, data = {}) {
		const id = ++this.#requestIdCounter;
		const request = {
			id,
			type,
			url: data.url || '',
			method: data.method || 'GET',
			data,
			timestamp: Date.now(),
			remainingTime: this.defaultDelay
		};

		this.pendingRequests = [...this.pendingRequests, request];

		if (this.autoAccept) {
			this.#startCountdown(id);
		}

		return new Promise((resolve, reject) => {
			request.resolve = resolve;
			request.reject = reject;
		});
	}

	#startCountdown(id) {
		const updateInterval = setInterval(() => {
			this.pendingRequests = this.pendingRequests.map((req) => {
				if (req.id === id) {
					const elapsed = Date.now() - req.timestamp;
					const remaining = Math.max(0, this.defaultDelay - elapsed);
					return { ...req, remainingTime: remaining };
				}
				return req;
			});
		}, 100);

		this.#timeouts[id] = {
			interval: updateInterval,
			timeout: setTimeout(() => {
				clearInterval(updateInterval);
				this.acceptRequest(id);
			}, this.defaultDelay)
		};
	}

	acceptRequest(id) {
		const request = this.pendingRequests.find((r) => r.id === id);
		if (!request) return;

		this.#clearRequestTimers(id);
		this.pendingRequests = this.pendingRequests.filter((r) => r.id !== id);

		const duration = ((Date.now() - request.timestamp) / 1000).toFixed(1);

		this.requestHistory = [
			...this.requestHistory,
			{
				...request,
				status: 'accepted',
				duration: `${duration}s`,
				completedAt: Date.now()
			}
		];

		if (request.resolve) {
			request.resolve({ success: true, data: request.data });
		}
	}

	rejectRequest(id, error = 'Request rejected') {
		const request = this.pendingRequests.find((r) => r.id === id);
		if (!request) return;

		this.#clearRequestTimers(id);
		this.pendingRequests = this.pendingRequests.filter((r) => r.id !== id);

		const duration = ((Date.now() - request.timestamp) / 1000).toFixed(1);

		this.requestHistory = [
			...this.requestHistory,
			{
				...request,
				status: 'rejected',
				duration: `${duration}s`,
				completedAt: Date.now(),
				error
			}
		];

		if (request.reject) {
			request.reject(new Error(error));
		}
	}

	#clearRequestTimers(id) {
		if (this.#timeouts[id]) {
			clearInterval(this.#timeouts[id].interval);
			clearTimeout(this.#timeouts[id].timeout);
			delete this.#timeouts[id];
		}
	}

	setDelay(ms) {
		this.defaultDelay = Math.max(1000, Math.min(30000, ms));
	}

	setProduct(product) {
		if (VALID_PRODUCTS.includes(product)) {
			this.product = product;
		}
	}

	setPdpEnabled(enabled) {
		this.pdpEnabled = enabled;
	}

	setLayoutType(type) {
		if (VALID_LAYOUT_TYPES.includes(type)) {
			this.layoutType = type;
		}
	}

	setFeature(feature, enabled) {
		this.features = { ...this.features, [feature]: enabled };
	}

	setLanguage(lang) {
		this.language = lang;
		setLanguageTag(lang);
	}

	setTheme(key, value) {
		this.theme = { ...this.theme, [key]: value };
	}

	applyPreset(presetId) {
		const preset = THEME_PRESETS[presetId];
		if (preset) {
			this.theme = {
				merchantName: preset.merchantName,
				largeLogo: preset.largeLogo,
				smallLogo: preset.smallLogo,
				primaryColor: preset.primaryColor,
				actionColor: preset.actionColor
			};
		}
	}

	reset() {
		Object.keys(this.#timeouts).forEach((id) => this.#clearRequestTimers(id));
		this.pendingRequests.forEach((req) => {
			if (req.reject) {
				req.reject(new Error('Configurator reset'));
			}
		});
		this.pendingRequests = [];
		this.requestHistory = [];
	}

	clearHistory() {
		this.requestHistory = [];
	}
}

let instance = null;

export function initializeConfigurator() {
	instance = new Configurator();
	return instance;
}

export function resetConfigurator() {
	if (instance) {
		instance.reset();
	}
	instance = null;
}
