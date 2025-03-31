<script>
	// @ts-nocheck
	import { bindEvent } from '$lib-v4/browser/dash.js';

	/**
	 * @type {any}
	 */
	export let title;
	/**
	 * @type {any}
	 */

	export let src;

	export let onAddToCart = (e) => {
		console.log(e);
	};

	if (typeof window !== 'undefined') {
		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'addToCart') {
					console.log('addToCart:', e);
					if (onAddToCart) {
						onAddToCart(data);
					}
				}
			} catch (ex) {
				console.log('message exception:', ex);
			}
		});
	}
</script>

<iframe {title} id={title} frameborder="0" scrolling="yes" {src} class="fixed h-full w-screen" />

<style>
	iframe {
		min-height: -webkit-fill-available;
	}
</style>
