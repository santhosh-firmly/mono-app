<script>
	/**
	 * @typedef {Object} OtpInputProps
	 * @property {number} length - Number of OTP digits (default: 6)
	 * @property {string} value - Current OTP value (bindable)
	 * @property {string} error - Error message to display
	 * @property {boolean} disabled - Whether inputs are disabled
	 * @property {Function} onComplete - Called with full OTP when all digits entered
	 * @property {Function} onClearError - Called when user starts typing after error
	 */

	/** @type {OtpInputProps} */
	let {
		length = 6,
		value = $bindable(''),
		error = '',
		disabled = false,
		onComplete = () => {},
		onClearError = () => {}
	} = $props();

	let inputs = $state([]);
	let digitValues = $state(Array(6).fill(''));

	$effect(() => {
		if (digitValues.length !== length) {
			digitValues = Array(length).fill('');
		}
	});

	$effect(() => {
		value = digitValues.join('');
		if (value.length === length && !disabled) {
			onComplete(value);
		}
	});

	function handleInput(index, event) {
		const inputValue = event.target.value;
		const lastChar = inputValue.slice(-1);

		if (/^\d$/.test(lastChar)) {
			digitValues[index] = lastChar;
			if (error) onClearError();

			if (index < length - 1) {
				inputs[index + 1]?.focus();
			}
		} else if (inputValue === '') {
			digitValues[index] = '';
		}
	}

	function handleKeyDown(index, event) {
		if (event.key === 'Backspace') {
			event.preventDefault();
			if (digitValues[index]) {
				digitValues[index] = '';
			} else if (index > 0) {
				digitValues[index - 1] = '';
				inputs[index - 1]?.focus();
			}
		} else if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			inputs[index - 1]?.focus();
		} else if (event.key === 'ArrowRight' && index < length - 1) {
			event.preventDefault();
			inputs[index + 1]?.focus();
		} else if (event.key === 'Enter' && value.length === length) {
			onComplete(value);
		}
	}

	function handlePaste(event) {
		event.preventDefault();
		const pastedData = event.clipboardData.getData('text').replace(/\D/g, '');
		const pastedDigits = pastedData.slice(0, length).split('');

		pastedDigits.forEach((digit, idx) => {
			if (idx < length) {
				digitValues[idx] = digit;
			}
		});

		if (error) onClearError();

		const nextEmptyIndex = pastedDigits.length < length ? pastedDigits.length : length - 1;
		inputs[nextEmptyIndex]?.focus();
	}
</script>

<div class="flex flex-row justify-center gap-2">
	{#each digitValues as digitValue, index (index)}
		<input
			bind:this={inputs[index]}
			type="text"
			inputmode="numeric"
			pattern="[0-9]"
			maxlength="1"
			autocomplete="one-time-code"
			value={digitValue}
			{disabled}
			oninput={(e) => handleInput(index, e)}
			onkeydown={(e) => handleKeyDown(index, e)}
			onpaste={index === 0 ? handlePaste : null}
			class="h-11 w-10 rounded-lg border text-center shadow-md {error
				? 'border-red-600'
				: 'border-gray-300'} disabled:bg-gray-100"
			data-testid="otp-field-{index}"
			aria-label="OTP digit {index + 1}"
		/>
	{/each}
</div>

{#if error}
	<div class="text-center text-xs font-light text-gray-500 italic" data-testid="otp-error">
		{error}
	</div>
{/if}
