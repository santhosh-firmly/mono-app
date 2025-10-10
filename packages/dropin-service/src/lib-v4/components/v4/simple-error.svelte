<script lang="ts">
	interface Props {
		errorMessage: string;
		errorDetails?: string;
		onBack?: () => void;
	}

	let { errorMessage, errorDetails, onBack }: Props = $props();
</script>

<div
	class="bg-fy-primary flex h-full w-full flex-col items-center justify-center gap-8 px-6"
	role="alert"
	aria-live="assertive"
>
	<div class="flex max-w-md flex-col items-center justify-center gap-6">
		<span class="text-fy-on-primary text-center text-4xl font-medium" aria-label="Error">
			Oops!
		</span>
		<span class="text-fy-on-primary-subtle text-center text-base font-normal">
			{errorMessage}
		</span>
		{#if errorDetails}
			<span class="text-fy-on-primary-subtle text-center text-sm font-normal opacity-75">
				{errorDetails}
			</span>
		{/if}
		{#if onBack}
			<button class="text-sm underline" onclick={onBack} aria-label="Go back">
				Go Back
			</button>
		{/if}
	</div>
</div>
