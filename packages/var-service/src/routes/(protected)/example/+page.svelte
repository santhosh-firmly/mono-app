<script>
	import { SessionRecorder } from '@firmly/session-recorder';
	import Example from '$lib/views/example.svelte';

	let { data } = $props();

	let recording = $state(false);
	let recorder = $state(null);

	async function handleToggleRecording() {
		if (recording && recorder) {
			await recorder.stop();
			recorder = null;
			recording = false;
			return;
		}

		// Create new recorder - uses privacy-first defaults from package
		recorder = new SessionRecorder({
			serviceUrl: data.dvrServiceUrl,
			enabled: true
			// Uses defaults: maskAllInputs: true, inlineStylesheet: true, etc.
		});
		recorder.start();
		recording = true;
	}
</script>

<Example {recording} onToggleRecording={handleToggleRecording} />
