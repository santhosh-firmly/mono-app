<script>
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import Modal from './modal.svelte';
	import ExistingCreditCard from './existing-credit-card.svelte';
	import MastercardC2pLogo from '../common/svg/mastercard-c2p-logo.svelte';
	import SpinnerIcon from '../common/svg/spinner-icon.svelte';

	const dispatch = createEventDispatcher();

	export let isModalOpen = false;
	export let card = null;
	export let cvvValue = '';
	export let error = '';
	export let loading = false;
	export let buttonText = 'Place Order';

	let cvvInputRef;

	$: if (isModalOpen && cvvInputRef) {
		setTimeout(() => cvvInputRef?.focus(), 100);
	}

	$: cvvValue = cvvValue?.replace(/\D/g, '');

	function handleSubmit() {
		if (cvvValue.length < 3) {
			error = 'Please enter a valid CVV';
			return;
		}
		error = '';
		dispatch('submit', { cvv: cvvValue });
	}

	function handleCancel() {
		dispatch('cancel');
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !loading) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<Modal bind:isModalOpen canCloseModal={!loading} on:modalClosed={handleCancel}>
	<div
		class="flex w-[320px] flex-col gap-4 p-6"
		in:fly={{ y: -20, duration: 300 }}
		role="dialog"
		aria-labelledby="cvv-modal-title"
	>
		<h2 id="cvv-modal-title" class="sr-only">Confirm CVV</h2>

		<div class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
			{#if card?.wallet === 'c2p'}
				<MastercardC2pLogo />
				<div class="mx-1 h-6 w-px bg-gray-300"></div>
			{/if}
			<ExistingCreditCard
				number="**** {card?.last_four}"
				type={card?.card_type}
				customArtUrl={card?.art}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<span class="text-fy-on-surface-subtle text-xs">Enter CVV to confirm</span>
			<div class="relative">
				<input
					bind:this={cvvInputRef}
					bind:value={cvvValue}
					on:keydown={handleKeydown}
					class="border-fy-on-primary-subtle placeholder:text-fy-on-primary-subtle sensitive-data w-full rounded-lg border p-3 pr-12 disabled:bg-gray-100"
					class:error={!!error}
					disabled={loading}
					data-testid="cvv-confirmation-modal-input"
					data-sensitive
					placeholder="CVV"
					autocomplete="cc-csc"
					maxlength="4"
					inputmode="numeric"
					aria-describedby={error ? 'cvv-error' : null}
				/>
				<div class="absolute top-0 right-0 z-10 mr-3 flex h-full flex-col justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 44 44"
					>
						<g fill="none" fill-rule="evenodd">
							<path d="M0 0h44v44H0z" />
							<path
								class="stroke-fy-on-surface-subtle"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M39.493 6.5a4.01 4.01 0 0 1 4.007 4.005v22.99a4.005 4.005 0 0 1-4.007 4.005H4.507A4.01 4.01 0 0 1 .5 33.495v-22.99A4.005 4.005 0 0 1 4.507 6.5h34.986z"
							/>
							<circle cx="27.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<circle cx="31.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<circle cx="35.5" cy="27.5" r="1" class="stroke-fy-on-surface-subtle" />
							<path
								class="fill-fy-on-surface-subtle"
								d="M1 11h42v1H1zM1 15h42v1H1z"
							/>
							<path
								class="stroke-fy-action"
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M33.497 21.5a6.006 6.006 0 0 1 6.003 6c0 3.314-2.678 6-6.003 6h-3.994a6.006 6.006 0 0 1-6.003-6c0-3.314 2.678-6 6.003-6h3.994z"
							/>
						</g>
					</svg>
				</div>
			</div>
			{#if error}
				<span id="cvv-error" class="text-fy-alert text-xs" role="alert">
					{error}
				</span>
			{/if}
		</div>

		<button
			type="button"
			class="bg-fy-action text-fy-on-action flex w-full items-center justify-center rounded-lg p-4 font-semibold shadow transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={loading || !cvvValue}
			on:click={handleSubmit}
			data-testid="cvv-confirmation-submit"
		>
			{#if loading}
				<SpinnerIcon class="mr-2 h-5 w-5" />
			{/if}
			{buttonText}
		</button>

		<button
			type="button"
			on:click={handleCancel}
			disabled={loading}
			class="text-fy-on-surface-subtle cursor-pointer px-4 py-2 text-center text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-50"
			data-testid="cvv-confirmation-cancel"
		>
			Use a different card
		</button>
	</div>
</Modal>

<style>
	input.error {
		color: var(--color-fy-alert);
		box-shadow: var(--color-fy-form-element-input-error);
	}

	input:focus {
		border: 0 !important;
		outline: 0 !important;
		box-shadow: var(--color-fy-form-element-input-focus);
		transition-property: box-shadow, color, filter;
	}
</style>
