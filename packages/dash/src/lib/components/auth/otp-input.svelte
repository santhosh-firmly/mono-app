<script>
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input/index.js';

	/**
	 * @type {{
	 *   value?: string[],
	 *   error?: string,
	 *   disabled?: boolean,
	 *   autofocus?: boolean,
	 *   onchange?: (value: string) => void
	 * }}
	 */
	let {
		value = $bindable(['', '', '', '', '', '']),
		error = '',
		disabled = false,
		autofocus = true,
		onchange
	} = $props();

	onMount(() => {
		if (autofocus) {
			focus();
		}
	});

	let otpValue = $derived(value.join(''));
	let isComplete = $derived(otpValue.length === 6);

	function handleInput(index, event) {
		const inputValue = event.target.value;

		// Only allow digits
		if (inputValue && !/^\d$/.test(inputValue)) {
			event.target.value = value[index];
			return;
		}

		value[index] = inputValue;

		// Auto-focus next input
		if (inputValue && index < 5) {
			const nextInput = document.getElementById(`otp-${index + 1}`);
			if (nextInput) nextInput.focus();
		}

		onchange?.(value.join(''));
	}

	function handleKeydown(index, event) {
		// Handle backspace to go to previous input
		if (event.key === 'Backspace' && !value[index] && index > 0) {
			const prevInput = document.getElementById(`otp-${index - 1}`);
			if (prevInput) prevInput.focus();
		}
	}

	function handlePaste(event) {
		event.preventDefault();
		const pastedData = event.clipboardData.getData('text').slice(0, 6);

		if (!/^\d+$/.test(pastedData)) return;

		const digits = pastedData.split('');
		value = [...digits, ...Array(6 - digits.length).fill('')];

		// Focus the next empty input or the last one
		const nextEmptyIndex = value.findIndex((d) => !d);
		const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
		const input = document.getElementById(`otp-${focusIndex}`);
		if (input) input.focus();

		onchange?.(value.join(''));
	}

	export function focus() {
		const input = document.getElementById('otp-0');
		if (input) input.focus();
	}

	export function clear() {
		value = ['', '', '', '', '', ''];
		focus();
	}

	export { isComplete };
</script>

<div class="flex flex-col items-center gap-2">
	<div class="flex justify-center gap-2">
		{#each value as digit, index (index)}
			<Input
				id="otp-{index}"
				type="text"
				inputmode="numeric"
				maxlength="1"
				value={digit}
				oninput={(e) => handleInput(index, e)}
				onkeydown={(e) => handleKeydown(index, e)}
				onpaste={handlePaste}
				class="h-12 w-12 text-center text-lg font-mono"
				{disabled}
			/>
		{/each}
	</div>

	{#if error}
		<p class="text-sm text-red-500 text-center">{error}</p>
	{/if}
</div>
