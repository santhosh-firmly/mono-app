<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { value = '', readonly = false, onchange = () => {} } = $props();

	let CodeMirrorComponent = $state(null);
	let jsLang = $state(null);

	onMount(async () => {
		const [editorMod, langMod] = await Promise.all([
			import('svelte-codemirror-editor'),
			import('@codemirror/lang-javascript')
		]);
		CodeMirrorComponent = editorMod.default;
		jsLang = langMod.javascript();
	});
</script>

{#if browser && CodeMirrorComponent}
	<div class="h-full w-full overflow-hidden [&_.cm-editor]:h-full [&_.cm-editor]:text-sm">
		<svelte:component
			this={CodeMirrorComponent}
			{value}
			onchange={(newValue) => onchange(newValue)}
			lang={jsLang}
			useTab={true}
			tabSize={4}
			lineWrapping={false}
			editable={!readonly}
			{readonly}
		/>
	</div>
{:else}
	<div class="flex h-full items-center justify-center text-muted-foreground">
		<span>Loading editor...</span>
	</div>
{/if}
