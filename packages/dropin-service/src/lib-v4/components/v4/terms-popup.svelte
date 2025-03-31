<script>
	/* eslint-disable svelte/no-at-html-tags */
	// Disabling the rule above to be able to render Adore Me terms.

	import Modal from './modal.svelte';
	import { slide } from 'svelte/transition';

	/**
	 * Title of the modal window
	 */
	export let title = '';

	/**
	 * Controls whether of not the popup window is open
	 */
	export let isModalOpen = false;

	/**
	 * Holds the terms and conditions content. If empty, loading graphics will be shown
	 * {@type string}
	 */
	let termsAndConditions = '';

	let loadingTerms = false;

	async function loadTermsAndConditions() {
		// This is hard coded for Adoreme. When the content service is ready, let's generalize this and make it work for all merchants.
		loadingTerms = true;
		const result = await fetch('https://www.adoreme.com/v7/pages/text-terms-conditions');
		const termsMetaData = await result.json();
		const doc = new DOMParser().parseFromString(termsMetaData.body[0].html, 'text/html');
		termsAndConditions = doc.documentElement.textContent || '';
		loadingTerms = false;
	}

	$: {
		if (isModalOpen && !termsAndConditions && !loadingTerms) {
			loadTermsAndConditions();
		}
	}
</script>

<Modal bind:isModalOpen>
	<div class="flex h-full max-w-[720px] min-w-[300px] flex-col">
		<div class="flex flex-row items-center justify-between p-4 pb-3">
			<span class="text-lg leading-none font-bold"> {title} </span>
			<button on:click={() => (isModalOpen = false)}>
				<svg
					class="ml-2"
					xmlns="http://www.w3.org/2000/svg"
					width={13}
					height={13}
					viewBox="0 0 13 13"
					fill="none"
				>
					<path
						class="fill-gray-400"
						d="M12.5051 12.5538C12.1943 12.8347 11.7728 12.9926 11.3333 12.9926C10.8938 12.9926 10.4724 12.8347 10.1616 12.5538L6.50069 8.77095L2.8398 12.5525C2.68638 12.6935 2.5036 12.8056 2.30202 12.8824C2.10043 12.9592 1.88402 12.9992 1.66527 13C1.44651 13.0008 1.22975 12.9624 1.02748 12.8871C0.825206 12.8118 0.641428 12.701 0.486745 12.5612C0.332063 12.4214 0.209537 12.2552 0.126235 12.0723C0.0429333 11.8895 0.000503849 11.6935 0.00139459 11.4957C0.00228533 11.298 0.0464784 11.1023 0.131425 10.9201C0.216371 10.7378 0.34039 10.5726 0.496327 10.4339L4.30498 6.50125L0.494946 2.5661C0.339009 2.4274 0.21499 2.26216 0.130044 2.07991C0.0450976 1.89767 0.000904477 1.70202 1.3739e-05 1.50425C-0.000876999 1.30649 0.0415525 1.11052 0.124854 0.927654C0.208156 0.744788 0.330682 0.578641 0.485364 0.438799C0.640047 0.298957 0.823825 0.188186 1.0261 0.112876C1.22837 0.037566 1.44513 -0.000792861 1.66389 1.24209e-05C1.88264 0.000817702 2.09905 0.0407709 2.30064 0.117568C2.50222 0.194364 2.685 0.306485 2.83842 0.447461L6.50069 4.23155L10.1616 0.447461C10.315 0.306485 10.4978 0.194364 10.6994 0.117568C10.901 0.0407709 11.1174 0.000817702 11.3361 1.24209e-05C11.5549 -0.000792861 11.7716 0.037566 11.9739 0.112876C12.1762 0.188186 12.36 0.298957 12.5146 0.438799C12.6693 0.578641 12.7918 0.744788 12.8751 0.927654C12.9584 1.11052 13.0009 1.30649 13 1.50425C12.9991 1.70202 12.9549 1.89767 12.87 2.07991C12.785 2.26216 12.661 2.4274 12.5051 2.5661L8.6964 6.50125L12.5051 10.4339C12.6591 10.573 12.7814 10.7383 12.8648 10.9201C12.9481 11.102 12.9911 11.297 12.9911 11.4938C12.9911 11.6907 12.9481 11.8857 12.8648 12.0675C12.7814 12.2494 12.6591 12.4146 12.5051 12.5538Z"
					/>
				</svg>
			</button>
		</div>
		<hr />
		<div class="w-full shrink overflow-scroll p-4 pt-3 text-justify text-sm">
			{#if !termsAndConditions}
				<div transition:slide class="w-full text-center">
					<svg
						aria-hidden="true"
						class="text-gray inline h-6 w-6 animate-spin fill-white"
						viewBox="0 0 100 101"
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
				</div>
			{:else}
				{@html termsAndConditions}
			{/if}
		</div>
	</div>
</Modal>
