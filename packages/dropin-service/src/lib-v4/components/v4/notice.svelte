<script>
	// @ts-nocheck

	import { fade } from 'svelte/transition';

	export let text = '';
	export let undoCallback;
	export let closeable = true;
	export let undoInProgress = false;

	let showNotice = true;

	function closeNotice() {
		showNotice = false;
	}

	async function undo() {
		undoInProgress = true;
		await undoCallback();
		undoInProgress = false;
		showNotice = false;
	}
</script>

{#if showNotice}
	<div
		transition:fade
		class="outline-fy-on-primary-subtle2 border-fy-primary col-span-2 flex items-center rounded-lg border-solid bg-white p-4 text-gray-500 shadow-lg outline outline-1 dark:bg-gray-800 dark:text-gray-400"
	>
		<slot name="icon" />

		<span class="ml-3 line-clamp-3 text-justify text-sm font-normal">{text}</span>
		<div class="ml-auto flex flex-shrink-0 flex-row items-center gap-1 pl-2">
			{#if undoCallback}
				<button
					disabled={undoInProgress}
					class="rounded-lg p-2 text-sm font-medium text-blue-600 hover:bg-blue-100 disabled:bg-gray-200 disabled:text-gray-400 dark:text-blue-500 dark:hover:bg-gray-700"
					on:click={undo}>Undo</button
				>
			{/if}

			{#if undoInProgress}
				<svg
					aria-hidden="true"
					class="fill-fy-on-action text-gray-fy-on-action-subtle m-1.5 h-6 w-6 animate-spin"
					viewBox="0 0 100 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
			{:else if closeable}
				<button
					type="button"
					on:click={() => closeNotice()}
					class="inline-flex items-center justify-center rounded-lg bg-white p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
					aria-label="Close"
				>
					<span class="sr-only">Close</span>
					<svg
						class="h-3 w-3"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 14 14"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}
