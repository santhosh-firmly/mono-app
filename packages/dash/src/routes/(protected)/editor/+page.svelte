<script>
	import { onDestroy, onMount } from 'svelte';
	import monaco from '$lib/components/custom/editor.js';

	let editor;
	let editorContainer;

	onMount(async () => {
		// Import our 'monaco.ts' file here
		// (onMount() will only be executed in the browser, which is what we want)

		// Your monaco instance is ready, let's display some code!
		const editor = monaco.editor.create(editorContainer, {
			// theme: 'vs-dark'
		});
		const model = monaco.editor.createModel(
			"console.log('Hello from Monaco! (the editor, not the city...)')",
			'javascript'
		);
		editor.setModel(model);
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});
</script>

<div class="rounded-lg overflow-hidden">
	<div class="container" bind:this={editorContainer} />
</div>

<style>
	.container {
		width: 100%;
		height: 600px;
        padding: 0;
	}
</style>
