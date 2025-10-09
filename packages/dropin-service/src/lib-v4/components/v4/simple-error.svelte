<script>
	// @ts-nocheck

	let { errorMessage, onBack } = $props();
</script>

<div class="bg-fy-primary flex h-full w-full flex-col items-center justify-center gap-8 px-6">
	<div class="flex max-w-md flex-col items-center justify-center gap-6">
		<span class="text-fy-on-primary text-center text-4xl font-medium"> Oops! </span>
		<span class="text-fy-on-primary-subtle text-center text-base font-normal">
			{errorMessage}
		</span>
		<button class="text-sm underline" onclick={onBack}> Back </button>
	</div>
</div>
