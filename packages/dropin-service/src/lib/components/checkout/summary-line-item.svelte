<script>
	import { toCurrency } from '$lib/utils/currency.js';
	import { useAnimatedValue } from '$lib/composables/animated-value.svelte.js';
	import UiQuantitySelector from '$lib/components/ui/quantity.svelte';
	import UiImage from '$lib/components/ui/image.svelte';
	import UiSpinner from '$lib/components/ui/spinner.svelte';
	import * as m from '$lib/paraglide/messages';
	import { fly } from 'svelte/transition';

	let {
		image,
		title,
		description,
		price,
		quantity,
		onQuantityChange,
		onUndo,
		disabled = false,
		hideQuantity = false,
		pendingRemoval = false,
		isUndoing = false,
		removalCountdown = 0,
		error = ''
	} = $props();

	const animatedPrice = useAnimatedValue(() => price);
</script>

<div
	class={[
		'line-item-container flex gap-x-4 rounded-lg border p-3 transition-all duration-200',
		{
			'border-dashed': pendingRemoval,
			'-m-3 border-transparent bg-transparent': !pendingRemoval
		}
	]}
>
	<div
		class={[
			'size-16 shrink-0 overflow-hidden rounded transition-opacity duration-200',
			{ 'opacity-40': pendingRemoval }
		]}
	>
		<UiImage src={image} alt={title} {title} />
	</div>

	<div class="line-item-content relative flex flex-1 overflow-hidden">
		{#if pendingRemoval}
			<div class="flex flex-1 items-center" in:fly={{ x: 20, duration: 200, delay: 100 }}>
				<div class="flex flex-1 flex-col gap-1">
					<p class="text-muted text-sm">{m.item_removed()}</p>
					<p class="text-muted line-clamp-1 text-xs opacity-70">{title}</p>
				</div>
				<div class="flex h-8 shrink-0 items-center justify-center gap-2">
					{#if isUndoing}
						<UiSpinner width={16} height={16} class="text-muted" />
					{:else}
						{#if removalCountdown > 0}
							<span class="countdown text-muted text-xs tabular-nums"
								>{removalCountdown}s</span
							>
						{/if}
						<button
							type="button"
							onclick={onUndo}
							class="undo-button cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
						>
							{m.undo()}
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<span
				class="flex flex-1 flex-col gap-y-4"
				in:fly={{ x: -20, duration: 200, delay: 100 }}
			>
				<span>
					<p class="text-text text-sm font-bold">{title}</p>
					{#if description}
						<p class="text-muted text-xs">{description}</p>
					{/if}
				</span>
				{#if !hideQuantity}
					{#if onQuantityChange}
						<UiQuantitySelector
							delay={500}
							{quantity}
							onChange={(qty) => onQuantityChange(qty)}
							{disabled}
						/>
					{:else}
						<p class="text-muted text-xs">Qty: {quantity}</p>
					{/if}
				{/if}
				{#if error}
					<p class="text-danger text-xs">{error}</p>
				{/if}
			</span>
			<p
				class="text-text text-sm font-semibold"
				in:fly={{ x: -20, duration: 200, delay: 100 }}
			>
				{toCurrency(animatedPrice.value)}
			</p>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference '../../../app.css';

	.line-item-container {
		border-color: var(--color-border);
		background-color: color-mix(in srgb, var(--color-background) 95%, var(--color-text) 5%);
	}

	.line-item-container.-m-3 {
		border-color: transparent;
		background-color: transparent;
	}

	.line-item-content {
		min-height: 4rem;
	}

	.undo-button {
		color: var(--color-primary);
	}

	.undo-button:hover {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
	}
</style>
