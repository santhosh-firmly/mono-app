<script>
	// @ts-nocheck
	import '../../firmly-edge.postcss';

	import { version } from '$app/environment';
	import { PUBLIC_api_id } from '$lib/env.js';
	import {
		initialize,
		initializeAppVersion,
		initializeParentInfo
	} from '$lib/browser/api-firmly.js';
	import { postGetParentInfo } from '$lib/browser/cross.js';
	import { bindEvent } from '$lib/browser/dash.js';
	import { sModalContent, sModalOptions } from '$lib/browser/storage.js';
	import Modal from '$lib/components/modal.svelte';
	import { PUBLIC_cf_server } from '$lib/env.js';
	import { onMount } from 'svelte';

	onMount(() => {
		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'parentInfo') {
					delete data.action;
					initializeParentInfo(data);
				}
			} catch (ex) {
				console.log('message exception:', ex);
			}
		});
		postGetParentInfo();

		// Initialize the session in the background.
		initialize(PUBLIC_api_id, PUBLIC_cf_server);
		initializeAppVersion(version);
	});
</script>

<slot />

<Modal content={$sModalContent} modalOptions={$sModalOptions} />
