<script>
	// @ts-nocheck
	import './dynamo.postcss';

	import { version } from '$app/environment';
	import { PUBLIC_api_id } from '$lib/env.js';
	import { initialize, initializeAppVersion } from '$lib/browser/api-firmly.js';
	import { bootstrap } from '$lib/sdk/index.js';
	import { bindEvent } from '$lib/browser/dash.js';
	import { postGetDynamoInfo } from '$lib/browser/cross.js';
	import { onMount } from 'svelte';
	import { sCartHive, sDynamoConfig } from '$lib/browser/storage';
	import { getSLDomain } from '$lib/utils.js';

	let receivedConfigs = false;

	onMount(async () => {
		window.firmly.sdk.CartUI.hasAnimation = true;
		bindEvent(window, 'message', async (e) => {
			if (e.data?.action === 'firmly::dynamoInfo') {
				console.log('firmly - Received dynamo configs');
				delete e.data.action;
				sDynamoConfig.set(e.data.dynamo);
				await initialize(PUBLIC_api_id, e.data.dynamo.api_url);
				console.log('initialization complete');

				// TODO: Are we getting events for this product? If so, how to differentiate
				// initializeParentInfo(e.data);
				// Initialize the session in the background.
				initializeAppVersion(version);

				bootstrap();
				// Get cart and set it as part of the storage
				window.firmly.sdk.CartHive.subscribe((cartHive) => {
					sCartHive.set(cartHive);
				});

				receivedConfigs = true;
			}
		});
		if (window.parent === window) {
			await initialize(PUBLIC_api_id, `https://api${getSLDomain(window.location.hostname)}`);
			initializeAppVersion(version);

			bootstrap();
			// Get cart and set it as part of the storage
			window.firmly.sdk.CartHive.subscribe((cartHive) => {
				sCartHive.set(cartHive);
			});
		} else {
			console.log('firmly - Requesting dynamo configs');
			postGetDynamoInfo();

			setTimeout(() => {
				if (!receivedConfigs) {
					console.log('firmly - Requesting additional dynamo configs');
					postGetDynamoInfo();
				}
			}, 2000);
		}
	});
</script>

<slot />
