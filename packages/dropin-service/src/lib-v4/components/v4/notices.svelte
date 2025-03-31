<script>
	// @ts-nocheck

	import { fade } from 'svelte/transition';
	import Notice from './notice.svelte';

	export let notices = [];

	function removeNotice(id) {
		notices = notices.filter((notice) => notice.id !== id);
	}

	$: {
		// Loop through notices and set a timer to remove each notice after its timeout
		notices.forEach((notice) => {
			setTimeout(() => {
				removeNotice(notice.id);
			}, notice.timeout || 10000);
		});
	}
</script>

<div
	class="flex @md:justify-around fixed bottom-10 @md:bottom-24 w-full z-[121] pointer-events-none"
>
	<div class="flex flex-col px-3 justify-center w-full @md:w-1/2 @md:max-w-[412px]">
		{#each notices as notice}
			<div transition:fade class="py-1 pointer-events-auto">
				<Notice text={notice.text} undoCallback={notice.undoCallback} closeable={notice.closeable}>
					<div slot="icon">
						{#if notice.image}
							<div
								class="h-8 aspect-square relative rounded bg-cover shadow bg-gray-300"
								style={`background-image: url("${notice.image}");`}
							/>
						{:else}
							<div
								class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200"
							>
								<svg
									class="w-5 h-5"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
									/>
								</svg>
								<span class="sr-only">Warning icon</span>
							</div>
						{/if}
					</div></Notice
				>
			</div>
		{/each}
	</div>
</div>
