<script>
	import { SessionRecorder } from '@firmly/session-recorder';
	import Input from '$lib/components/input.svelte';
	import Button from '$lib/components/button.svelte';

	let { data } = $props();

	let todos = $state([
		{ id: 1, text: 'Record a session', completed: false },
		{ id: 2, text: 'Add some todos', completed: false },
		{ id: 3, text: 'View the replay', completed: false }
	]);

	let newTodoText = $state('');
	let recording = $state(false);
	let recorder = $state(null);
	let nextId = $state(4);

	function addTodo() {
		if (newTodoText.trim()) {
			todos.push({ id: nextId++, text: newTodoText.trim(), completed: false });
			newTodoText = '';
		}
	}

	function toggleTodo(id) {
		const todo = todos.find((t) => t.id === id);
		if (todo) todo.completed = !todo.completed;
	}

	function deleteTodo(id) {
		todos = todos.filter((t) => t.id !== id);
	}

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

<div class="py-16">
	<header class="mb-12 flex items-center justify-between">
		<div>
			<Button
				variant="ghost"
				onclick={() => (window.location.href = '/')}
				class="mb-3 inline-block">← Back</Button
			>
			<h1 class="font-serif text-2xl">Todo List</h1>
		</div>

		<Button
			onclick={handleToggleRecording}
			class="border-border hover:border-foreground border px-3 py-1.5"
		>
			{recording ? '● Stop' : '○ Record'}
		</Button>
	</header>

	{#if recording}
		<div class="border-accent mb-8 border-l-2 px-4 py-2">
			<p class="text-muted text-xs">Recording in progress</p>
		</div>
	{/if}

	<form
		onsubmit={(e) => {
			e.preventDefault();
			addTodo();
		}}
		class="mb-8"
	>
		<Input bind:value={newTodoText} placeholder="Add a task..." />
	</form>

	<div class="space-y-px">
		{#each todos as todo (todo.id)}
			<div class="hover:bg-hover flex items-center gap-4 px-4 py-3 transition-colors">
				<input
					type="checkbox"
					checked={todo.completed}
					onchange={() => toggleTodo(todo.id)}
					class="h-4 w-4"
				/>
				<span class="flex-1 text-sm {todo.completed ? 'text-muted line-through' : ''}">
					{todo.text}
				</span>
				<Button variant="ghost" onclick={() => deleteTodo(todo.id)}>Delete</Button>
			</div>
		{/each}

		{#if todos.length === 0}
			<div class="py-12 text-center">
				<p class="text-muted text-sm">No tasks yet</p>
			</div>
		{/if}
	</div>

	<div class="border-border text-muted mt-12 space-y-4 border-t pt-8 text-xs">
		<div>
			<p><strong>Masking Examples:</strong></p>
			<div class="mt-2 space-y-2">
				<div>
					<p class="text-xs font-medium">
						sensitive-data (text masking): <span
							class="sensitive-data inline-block border px-2 py-1 text-xs"
							>Sensitive information here</span
						>
					</p>
				</div>
				<div>
					<p class="text-xs font-medium">
						sensitive-data (element hiding): <span
							class="sensitive-data inline-block border px-2 py-1 text-xs"
							>This will be hidden</span
						>
					</p>
				</div>
			</div>
		</div>

		<div>
			<p><strong>How to test:</strong></p>
			<p>1. Click "Record" to start recording</p>
			<p>2. Add, complete, and delete tasks</p>
			<p>3. Click "Stop" when done</p>
			<p>
				4. Return to <Button
					variant="link"
					onclick={() => (window.location.href = '/')}
					class="inline">dashboard</Button
				> to view replay
			</p>
		</div>
	</div>
</div>
