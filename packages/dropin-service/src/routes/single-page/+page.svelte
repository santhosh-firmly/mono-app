<script>
	import { onMount } from 'svelte';
	import SingleFlowView from '$lib/views/single-flow.svelte';
	import { start, data, dispatch } from '$lib/states/single-flow.svelte.js';

	let { data: serverData } = $props();

	onMount(() => start(serverData.apiId, serverData.cfServer));
</script>

<SingleFlowView {data} {dispatch} />
