<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import Helper from '$lib/components/vendor/helper.svelte';
	import { OTPValidation } from '$lib/browser/localization.js';

	// Input to the this component
	export const otpLength = 6;
	export const autoSubmitWhenPasting = true;
	export const autoSubmitWhenTyping = false;

	// Callbacks from this component
	export let onOTPComplete;

	const otpInput = Array(otpLength);

	/**
	 * This function distributes the pasted or inputted OTP value across all available
	 * elements. Even though the focus may not be in the first box, this function will
	 * ALWAYS distrubute the elements from the first box.
	 *
	 * If the content is smaller than the number of boxes, the focus will remain on the first
	 * empty box.
	 *
	 * If the content is larger than the number of boxes, the content will be truncated
	 *
	 * @param data Input string to be distributed across the elements
	 */
	function onOTPMultiInsert(data) {
		const pin = data.replace(/\s/g, '').replace(/\D/g, '');
		const ch = [...pin];
		let lastCharIndex = 0;
		otpInput.forEach((el, i) => {
			if (ch[i]) {
				lastCharIndex = i;
				el.value = ch[i] ?? '';
				el.focus();
			}
		});

		if (otpInput[lastCharIndex + 1] && otpInput[lastCharIndex].value !== '') {
			otpInput[lastCharIndex + 1].focus();
		}

		if (lastCharIndex === otpInput.length - 1 && autoSubmitWhenPasting) {
			otpInput[lastCharIndex].blur();
			handleSubmit();
		}
	}

	/**
	 * Handle the paste even and get the clipboard even before distributing the content across the elements
	 * in the screen.
	 *
	 * @param ev Paste event
	 */
	function onOTPPaste(ev) {
		const data = ev.clipboardData.getData('text');
		ev.preventDefault();
		onOTPMultiInsert(data);
	}

	/**
	 * Some keyboards on mobile phone will input all the data in a single input element of the HTML page.
	 * This function handles such even and distributes the contents of the even across the entire OTP elements.
	 *
	 * @param ev Input event
	 */
	function onotpInput(ev) {
		const data = ev.data;
		if (data) {
			ev.preventDefault();
			onOTPMultiInsert(ev.data);
		}
	}

	/**
	 * This function creates a handler for keyDown events.
	 * Based on the index of the OTP elements, it will automatically move to the next element
	 * or it will submit the OTP to the server (if the callback is not null).
	 *
	 * This function also handles Backspace and special keys
	 *
	 * @param index Index of the current OTP input element
	 */
	function onOTPKeydown(index) {
		return (ev) => {
			if (typeof ev.key == 'undefined' && typeof ev.keyCode == 'undefined') {
				//paste in safari
				ev.preventDefault(); // this is not working during the testing.
				return;
			}
			if (ev.key === 'Backspace') {
				if (otpInput[index].value !== '') {
					ev.preventDefault();
					otpInput[index].value = '';
				} else if (index !== 0) {
					otpInput[index - 1].value = '';
					otpInput[index - 1].focus();
				}
			} else if (ev.key === 'Enter') {
				if (otpInput[index].value.length == otpLength) {
					onOTPMultiInsert(otpInput[index].value);
				} else {
					handleSubmit();
				}
			} else {
				if (ev.metaKey || ev.ctrlKey) {
					return true;
				}

				if ((ev.keyCode > 47 && ev.keyCode < 58) || (ev.keyCode > 95 && ev.keyCode < 106)) {
					otpInput[index].value = ev.key;
				}

				if (otpInput[index].value !== '') {
					if (index !== otpInput.length - 1) {
						otpInput[index + 1].focus();
					} else if (autoSubmitWhenTyping) {
						otpInput[index].blur();
						handleSubmit();
					}
				}
				ev.preventDefault();
			}
		};
	}

	/**
	 * To guarantee the sanity during the use of the OTP input elements, this function will move the focus always to the first empty element.
	 * If all elements are populated, the focus will remain in the last element.
	 *
	 * @param index Index of the current OTP element
	 */
	function onOTPFocus() {
		return (ev) => {
			ev?.preventDefault?.();

			let firstEmpty = otpInput.length - 1;
			for (let i = otpInput.length - 1; i >= 0; i--) {
				if (otpInput[i].value === '') {
					firstEmpty = i;
				}
			}
			otpInput[firstEmpty].focus();

			// Tab behavior patch to behave as a single input element.
			otpInput.forEach((el) => el.setAttribute('tabindex', -1));
			otpInput[firstEmpty].removeAttribute('tabindex');
		};
	}

	function onOTPTextInput(ev) {
		if (ev.data.length <= 1) {
			ev.preventDefault();
		}
	}

	let error;

	/**
	 * Handles the form submission
	 */
	export function handleSubmit() {
		const otpComplete = otpInput.every((el) => el.value !== '');
		if (!otpComplete) {
			error = OTPValidation;
			onOTPFocus(0).apply();
		} else {
			error = null;
			const otpValue = otpInput.map((el) => el.value).join('');
			onOTPComplete(otpValue);
		}
	}

	onMount(() => {
		// Immetiately focus on the OTP fields.
		otpInput[0].focus();
	});
</script>

<form on:submit={handleSubmit} class="flex flex-col gap-2 px-1 py-4">
	<div class="flex flex-row gap-2 justify-center">
		<!-- eslint-disable-next-line no-empty-pattern -->
		{#each Array(otpLength) as { }, index (index)}
			<input
				id="otp{index}"
				bind:this={otpInput[index]}
				class="border rounded w-10 h-10 text-center"
				type="text"
				autocomplete="one-time-code"
				tabindex="-1"
				inputmode="numeric"
				pattern="[0-9]"
				on:paste={onOTPPaste}
				on:input={onotpInput}
				on:keydown={onOTPKeydown(index)}
				on:focus={onOTPFocus(index)}
				on:textInput={onOTPTextInput}
			/>
		{/each}
	</div>
	{#if error}
		<Helper
			color="red"
			helperClass="text-xs font-light italic text-gray-500 dark:text-gray-300 text-center"
		>
			{error}
		</Helper>
	{/if}
</form>
