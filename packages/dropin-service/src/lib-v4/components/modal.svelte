<script context="module">
	// @ts-nocheck
	// TODO: Add ARIA role to <div> with mousedown, mouseup handlers
	/* eslint-disable svelte/valid-compile */

	/**
	 * Create a Svelte component with props bound to it.
	 * @type {(component: Component, props: Record<string, any>) => Component}
	 */
	export function modalBind(Component, props = {}) {
		return function ModalComponent(options) {
			return new Component({
				...options,
				props: {
					...props,
					...options.props
				}
			});
		};
	}
</script>

<script>
	// @ts-nocheck

	import * as svelte from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { symModalKey } from '$lib-v4/browser/storage.js';
	import { MOBILE, NA, setContentStyle } from '$lib-v4/browser/layout.js';
	import { postCheckoutClosed, postOrderPlaced, postRefresh } from '$lib-v4/browser/cross.js';
	import { sSignedInOnThisSession } from '$lib-v4/browser/api-manager.js';

	/**
	 * Svelte component to be shown as the modal
	 * @type {Component | null}
	 */
	export let content = null;

	/**
	 * Close the modal and raise the respective postmessage as needed.
	 * @type {Component | null}
	 */
	export let orderUrl = null;

	/**
	 * Svelte context key to reference the simple modal context
	 * @type {string | Symbol}
	 */
	export let key = symModalKey;

	/**
	 * Accessibility label of the modal
	 * @see https://www.w3.org/TR/wai-aria-1.1/#aria-label
	 * @type {string | null}
	 */
	export let ariaLabel = null;

	/**
	 * Element ID holding the accessibility label of the modal
	 * @see https://www.w3.org/TR/wai-aria-1.1/#aria-labelledby
	 * @type {string | null}
	 */
	export let ariaLabelledBy = null;

	/**
	 * Whether to show a close button or not
	 * @type {Component | boolean}
	 */
	export let closeButton = true;

	/**
	 * Whether to close the modal on hitting the escape key or not
	 * @type {boolean}
	 */
	export let closeOnEsc = true;

	/**
	 * Whether to close the modal upon an outside mouse click or not
	 * @type {boolean}
	 */
	export let closeOnOuterClick = true;

	/**
	 * Do not apply default styles to the modal
	 * @type {boolean}
	 */
	export let unstyled = false;

	/**
	 * @type {(key: any, context: any) => void}
	 */
	export let setContext = svelte.setContext;

	/**
	 * Transition function for the background element
	 * @see https://svelte.dev/docs#transition_fn
	 * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
	 */
	export let transitionBg = fade;

	/**
	 * Parameters for the background element transition
	 * @type {BlurParams}
	 */
	export let transitionBgProps = { duration: 100 };

	/**
	 * Transition function for the window element
	 * @see https://svelte.dev/docs#transition_fn
	 * @type {(node: Element, parameters: BlurParams) => TransitionConfig}
	 */
	export let transitionWindow = fly;

	/**
	 * Parameters for the window element transition
	 * @type {BlurParams}
	 */
	export let transitionWindowProps = { y: 500, duration: 1000 };

	/**
	 * If `true` elements outside the modal can be focused
	 * @type {boolean}
	 */
	export let disableFocusTrap = false;

	export let modalOptions = {};

	const defaultState = {
		ariaLabel,
		ariaLabelledBy,
		closeButton,
		closeOnEsc,
		closeOnOuterClick,
		transitionBg,
		transitionBgProps,
		transitionWindow,
		transitionWindowProps,
		disableFocusTrap,
		unstyled
	};
	let state = { ...defaultState };

	let contentComponent = null;

	let background;
	let wrap;
	let modalWindow;
	let scrollY;
	let currentTransitionBg;
	let currentTransitionWindow;
	let prevBodyPosition;
	let prevBodyOverflow;
	let prevBodyWidth;
	let outerClickTarget;

	const isFunction = (f) => !!(f && f.constructor && f.call && f.apply);

	const updateStyleTransition = () => {
		currentTransitionBg = state.transitionBg;
		currentTransitionWindow = state.transitionWindow;
	};

	function onOpen() {
		doResize();
	}

	function onOpened() {}

	async function onClosed() {
		if (isIframed()) {
			// wait for any pending events to complete.
			await svelte.tick();
			if (orderUrl) {
				postOrderPlaced(orderUrl);
			} else {
				postCheckoutClosed();
			}
		}
	}

	function onClose() {}

	function open(NewComponent, options = {}) {
		contentComponent = NewComponent;
		state = { ...defaultState, ...modalOptions, ...options };
		updateStyleTransition();
		disableScroll();
	}

	function isIframed() {
		if (window) {
			return window.self != window.top;
		}

		return self != top;
	}

	async function close() {
		if (!contentComponent) return;
		contentComponent = null;
		enableScroll();
		if ($sSignedInOnThisSession) {
			sSignedInOnThisSession.set(false);
			postRefresh();
		}
	}

	async function handleOrderPlaced(url) {
		postOrderPlaced(url);
	}

	function handleKeydown(event) {
		if (state.closeOnEsc && contentComponent && event.key === 'Escape') {
			event.preventDefault();
			close();
		}

		if (contentComponent && event.key === 'Tab' && !state.disableFocusTrap) {
			// trap focus
			const nodes = modalWindow.querySelectorAll('*');
			const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);

			let index = tabbable.indexOf(document.activeElement);
			if (index === -1 && event.shiftKey) index = 0;

			index += tabbable.length + (event.shiftKey ? -1 : 1);
			index %= tabbable.length;

			tabbable[index].focus();
			event.preventDefault();
		}
	}

	function handleOuterMousedown(event) {
		if (state.closeOnOuterClick && (event.target === background || event.target === wrap))
			outerClickTarget = event.target;
	}

	function handleOuterMouseup(event) {
		if (state.closeOnOuterClick && event.target === outerClickTarget) {
			event.preventDefault();
			close();
		}
	}

	function disableScroll() {
		scrollY = window.scrollY;
		prevBodyPosition = document.body.style.position;
		prevBodyOverflow = document.body.style.overflow;
		prevBodyWidth = document.body.style.width;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollY}px`;
		document.body.style.overflow = 'hidden';
		document.body.style.width = '100%';
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'instant'
		});
	}

	function enableScroll() {
		document.body.style.position = prevBodyPosition || '';
		document.body.style.top = '';
		document.body.style.overflow = prevBodyOverflow || '';
		document.body.style.width = prevBodyWidth || '';
		window.scrollTo({
			top: scrollY,
			left: 0,
			behavior: 'instant'
		});
	}

	setContext(key, { open, close, handleOrderPlaced });

	let isMounted = false;

	$: {
		if (isMounted) {
			if (isFunction(content)) {
				open(content);
			} else {
				close();
			}
		}
	}

	svelte.onDestroy(() => {
		if (isMounted) close();
	});

	svelte.onMount(() => {
		onResize();
		isMounted = true;
	});

	let isRounded = false;

	function doResize() {
		if (contentComponent) {
			let options = {
				viewportWidth: window.innerWidth,
				viewportHeight: window.innerHeight,
				contentElement: modalWindow
			};
			const ret = setContentStyle(options, false);
			isRounded = ret.layout.name == MOBILE ? false : true;
			if (wrap) {
				wrap.style.display = ret.layout.name == NA ? 'none' : 'block';
				/*
				console.log(
					'in doResize',
					ret.layout.name,
					ret,
					wrap.style.display,
					window.innerWidth,
					window.innerHeight
				);*/
			} else {
				//console.log('in doResize', ret.layout.name, ret, window.innerWidth, window.innerHeight);
			}

			return ret;
		}
	}

	function onResize() {
		doResize();
	}
	// the pb-20 style on the modalwindow is to make sure we are able to scroll till the last button information in the mobile web browser.
</script>

<svelte:window on:keydown={handleKeydown} on:resize={onResize} />

{#if contentComponent}
	<div
		id="bg"
		class="fixed top-0 left-0 z-[2000] flex h-full w-screen flex-col justify-center scroll-smooth bg-black/50"
		on:mousedown={handleOuterMousedown}
		on:mouseup={handleOuterMouseup}
		bind:this={background}
		transition:currentTransitionBg={state.transitionBgProps}
	>
		<div bind:this={wrap} id="wrap" class="max-h-full max-w-full">
			<div
				class="bg-default fixed h-full w-full overflow-y-auto scroll-smooth"
				class:rounded-md={isRounded}
				id="checkoutWindow"
				role="dialog"
				aria-modal="true"
				aria-label={state.ariaLabelledBy ? null : state.ariaLabel || null}
				aria-labelledby={state.ariaLabelledBy || null}
				bind:this={modalWindow}
				transition:currentTransitionWindow={state.transitionWindowProps}
				on:introstart={onOpen}
				on:outrostart={onClose}
				on:introend={onOpened}
				on:outroend={onClosed}
			>
				{#if state.closeButton}
					{#if isFunction(state.closeButton)}
						<svelte:component this={state.closeButton} onClose={close} />
					{/if}
				{/if}
				<svelte:component this={contentComponent} />
			</div>
		</div>
	</div>
{/if}
<slot />
