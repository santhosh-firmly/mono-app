<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import { debounce } from '$lib-v4/browser/dash';
	import { createEventDispatcher } from 'svelte';
	import Group from './group.svelte';

	export let address;

	let autocompleteSelectedIdx = 0;

	let predictions = [];

	const dispatch = createEventDispatcher();

	async function updateSearch() {
		const searchResponse = await window.firmly.searchAddress(address);
		if (searchResponse.status !== 200) {
			return;
		}
		({ predictions } = await searchResponse.data);

		for (const prediction of predictions) {
			const searchWords = address.split(/\s+/g).filter((word) => word !== '');

			let label = prediction.address;

			prediction.highlighted = label;

			const labelLowercaseNoAc = label.toLowerCase();

			if (searchWords && searchWords.length) {
				const positions = [];

				for (let i = 0; i < searchWords.length; i++) {
					let keyword = searchWords[i];
					const keywordLen = keyword.length;

					let pos1 = 0;
					do {
						pos1 = labelLowercaseNoAc.indexOf(keyword, pos1);
						if (pos1 >= 0) {
							let pos2 = pos1 + keywordLen;
							positions.push([pos1, pos2]);
							pos1 = pos2;
						}
					} while (pos1 !== -1);
				}

				if (positions.length > 0) {
					const keywordPatterns = new Set();
					for (let i = 0; i < positions.length; i++) {
						const pair = positions[i];
						const pos1 = pair[0];
						const pos2 = pair[1];

						const keywordPattern = labelLowercaseNoAc.substring(pos1, pos2);
						keywordPatterns.add(keywordPattern);
					}
					for (let keywordPattern of keywordPatterns) {
						const reg = new RegExp('(' + keywordPattern + ')', 'ig');

						const newHighlighted = prediction.highlighted.replace(reg, '<b>$1</b>');
						prediction.highlighted = newHighlighted;
					}
				}
			}
		}
		predictions = predictions;
	}

	const debUpdate = debounce(async () => {
		updateSearch();
	}, 150);

	$: {
		debUpdate(address);
	}

	async function addressOnClick(id) {
		const response = await window.firmly.getAddress(id);
		if (response.status !== 200) {
			return;
		}

		dispatch('on-address-selected', response.data);
	}

	export const autoCompleteNext = () => {
		if (++autocompleteSelectedIdx > predictions.length) {
			autocompleteSelectedIdx = 0;
		}
	};

	export function autoCompletePrevious() {
		if (--autocompleteSelectedIdx < 0) {
			autocompleteSelectedIdx = predictions.length;
		}
	}

	export function selectCurrentAddress() {
		if (autocompleteSelectedIdx === predictions.length) {
			dispatch('on-address-selected', { manual: true });
		} else {
			addressOnClick(predictions[autocompleteSelectedIdx].id);
		}
	}
</script>

<div class="relative z-[900] flex w-full justify-center">
	<div class="absolute top-1 w-full px-3" data-testid="address-autocomplete-dropdown">
		<Group>
			<div class="col-span-2 w-full rounded p-2 shadow-lg">
				{#each predictions as prediction, index}
					<button
						data-testid="address-prediction-{index}"
						type="button"
						class="w-full rounded p-1 text-left text-sm"
						class:bg-fy-on-primary-subtle2={index === autocompleteSelectedIdx}
						on:mouseover={() => (autocompleteSelectedIdx = index)}
						on:focus={() => (autocompleteSelectedIdx = index)}
						on:click={() => addressOnClick(prediction.id)}
						data-sensitive
					>
						{@html prediction.highlighted}
					</button>
				{/each}
				{#if predictions.length > 0}
					<hr class="mt-0.5" />
				{/if}
				<button
					data-testid="enter-manually"
					type="button"
					class="text-fy-on-surface-subtle w-full rounded p-1 text-left text-xs underline"
					class:bg-fy-on-primary-subtle2={predictions.length === autocompleteSelectedIdx}
					on:mouseover={() => (autocompleteSelectedIdx = predictions.length)}
					on:focus={() => (autocompleteSelectedIdx = predictions.length)}
					on:click={() => {
						dispatch('on-address-selected', { manual: true });
					}}
				>
					Enter manually
				</button>
			</div>
		</Group>
	</div>
</div>
