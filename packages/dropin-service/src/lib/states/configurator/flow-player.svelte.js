import { tick } from 'svelte';
import {
	CHECKOUT_FLOWS,
	BUY_NOW_FLOWS,
	getAllFlows
} from '$lib/utils/configurator/checkout-flows.js';
import {
	sleep,
	typeIntoElement,
	clickElement,
	waitForElement,
	waitForText,
	findElementByText
} from '$lib/utils/configurator/dom-automation.js';

class FlowPlayer {
	isPlaying = $state(false);
	isConfiguringFeatures = $state(false);
	currentFlowId = $state(null);
	currentStepIndex = $state(0);
	error = $state(null);

	#abortController = null;
	#containerRef = null;
	#configurator = null;
	#onReload = null;
	#onCartStateChange = null;
	#onPdpEnabledChange = null;

	#allFlows = { ...CHECKOUT_FLOWS, ...BUY_NOW_FLOWS };

	currentFlow = $derived(this.currentFlowId ? this.#allFlows[this.currentFlowId] : null);

	totalSteps = $derived(this.currentFlow?.steps?.length || 0);

	progress = $derived(this.totalSteps > 0 ? (this.currentStepIndex / this.totalSteps) * 100 : 0);

	availableFlows = $derived(getAllFlows());

	isBuyNowFlow = $derived(this.currentFlow?.type === 'buyNow');

	setContainer(container) {
		this.#containerRef = container;
	}

	setConfigurator(configurator) {
		this.#configurator = configurator;
	}

	setOnReload(onReload) {
		this.#onReload = onReload;
	}

	setOnCartStateChange(onCartStateChange) {
		this.#onCartStateChange = onCartStateChange;
	}

	setOnPdpEnabledChange(onPdpEnabledChange) {
		this.#onPdpEnabledChange = onPdpEnabledChange;
	}

	async selectFlow(flowId) {
		if (this.isPlaying) return;
		this.currentFlowId = flowId;
		this.currentStepIndex = 0;
		this.error = null;

		const flow = flowId ? this.#allFlows[flowId] : null;

		if (flow && this.#configurator) {
			const targetProduct = flow.type === 'buyNow' ? 'buyNow' : 'checkout';
			if (this.#configurator.product !== targetProduct) {
				this.#configurator.setProduct(targetProduct);
			}

			if (flow.featureConfig) {
				this.isConfiguringFeatures = true;
				Object.entries(flow.featureConfig).forEach(([key, value]) => {
					this.#configurator.setFeature(key, value);
				});
				await tick();
				this.isConfiguringFeatures = false;
			}
		}

		if (this.#onPdpEnabledChange) {
			this.#onPdpEnabledChange(flow?.pdpEnabled || false);
		}

		if (this.#onCartStateChange) {
			this.#onCartStateChange(flow?.cartState || null);
		}

		if (flowId && this.#onReload) {
			this.#onReload();
		}
	}

	async play() {
		if (!this.currentFlow || this.isPlaying || !this.#configurator) return;

		this.isPlaying = true;
		this.error = null;
		this.currentStepIndex = 0;
		this.#abortController = new AbortController();

		if (this.#onReload) {
			this.#onReload();
		}

		await sleep(500);

		try {
			await this.#executeFlow();
		} catch (err) {
			if (err.name !== 'AbortError') {
				this.error = err.message || 'Unknown error';
				console.error(
					'[FlowPlayer] Error at step',
					this.currentStepIndex,
					':',
					err.message,
					err.stack
				);
			}
		} finally {
			this.isPlaying = false;
		}
	}

	stop() {
		if (this.#abortController) {
			this.#abortController.abort();
		}
		this.isPlaying = false;
		this.currentStepIndex = 0;
	}

	reset() {
		this.stop();
		this.currentFlowId = null;
		this.currentStepIndex = 0;
		this.error = null;
	}

	async #executeFlow() {
		const steps = this.currentFlow.steps;

		for (let i = 0; i < steps.length; i++) {
			if (this.#signal?.aborted) {
				const error = new Error('Aborted');
				error.name = 'AbortError';
				throw error;
			}

			this.currentStepIndex = i;
			await this.#executeStep(steps[i]);
		}

		this.currentStepIndex = steps.length;
	}

	async #executeStep(step) {
		const container = this.#containerRef || document;
		const signal = this.#signal;

		switch (step.action) {
			case 'type': {
				const el = await waitForElement(step.selector, {
					container,
					timeout: step.timeout || 5000,
					signal
				});
				this.#scrollIntoView(el);
				await sleep(100);
				await typeIntoElement(el, step.value, { delay: step.delay || 30, signal });
				break;
			}

			case 'click': {
				const el = await waitForElement(step.selector, {
					container,
					timeout: step.timeout || 5000,
					signal
				});
				this.#scrollIntoView(el);
				await sleep(100);
				clickElement(el);
				break;
			}

			case 'clickByText': {
				const el = findElementByText(container, step.tagName, step.text);
				if (!el) {
					throw new Error(`Element ${step.tagName} with text "${step.text}" not found`);
				}
				this.#scrollIntoView(el);
				await sleep(100);
				clickElement(el);
				break;
			}

			case 'wait': {
				await sleep(step.ms, signal);
				break;
			}

			case 'waitForElement': {
				await waitForElement(step.selector, {
					container,
					timeout: step.timeout || 5000,
					signal
				});
				break;
			}

			case 'waitForText': {
				await waitForText(step.text, { container, timeout: step.timeout || 5000, signal });
				break;
			}
		}
	}

	#scrollIntoView(element) {
		if (!element) return;
		element.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	get #signal() {
		return this.#abortController?.signal;
	}
}

let instance = null;

export function initializeFlowPlayer() {
	instance = new FlowPlayer();
	return instance;
}

export function resetFlowPlayer() {
	if (instance) {
		instance.reset();
	}
	instance = null;
}
