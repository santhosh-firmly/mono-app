<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import { afterUpdate } from 'svelte';

	// the list of items  the user can select from
	export let items = [];

	/**
	 * function to use to get all items (alternative to providing items)
	 * @type {boolean|function}
	 */
	export let searchFunction = false;

	// field of each item that's used for the labels in the list
	export let labelFieldName = undefined;
	export let keywordsFieldName = labelFieldName;
	export let valueFieldName = undefined;

	export let labelFunction = function (item) {
		if (item === undefined || item === null) {
			return '';
		}
		return labelFieldName ? item[labelFieldName] : item;
	};

	export let keywordsFunction = function (item) {
		if (item === undefined || item === null) {
			return '';
		}
		return keywordsFieldName ? item[keywordsFieldName] : labelFunction(item);
	};

	export let valueFunction = function (item, forceSingle = false) {
		if (item === undefined || item === null) {
			return item;
		}
		if (!multiple || forceSingle) {
			return valueFieldName ? item[valueFieldName] : item;
		} else {
			return item.map((i) => (valueFieldName ? i[valueFieldName] : i));
		}
	};

	export let keywordsCleanFunction = function (keywords) {
		return keywords;
	};

	export let textCleanFunction = function (userEnteredText) {
		return userEnteredText;
	};

	// events
	export let beforeChange = function () {
		return true;
	};
	export let onChange = function () {};
	export let onBlur = function () {};

	// Behaviour properties
	export let selectFirstIfEmpty = false;
	export let minCharactersToSearch = 1;
	export let maxItemsToShowInList = 0;
	export let multiple = false;

	// ignores the accents when matching items
	export let ignoreAccents = true;

	// all the input keywords should be matched in the item keywords
	export let matchAllKeywords = true;

	// sorts the items by the number of matchink keywords
	export let sortByMatchedKeywords = false;

	// allow users to use a custom item filter function
	export let itemFilterFunction = undefined;

	// allow users to use a custom item sort function
	export let itemSortFunction = undefined;

	// do not allow re-selection after initial selection
	export let lock = false;

	// delay to wait after a keypress to search for new items
	export let delay = 0;

	// true to perform local filtering of items, even if searchFunction is provided
	export let localFiltering = true;

	// true to perform local sortying of items
	export let localSorting = true;

	// true to clean the user entered text (removes spaces)
	export let cleanUserText = true;

	// true to lowercase the keywords derived from each item (lowercase)
	export let lowercaseKeywords = true;

	// true to close the dropdown when the component loses focus
	export let closeOnBlur = false;

	// UI properties

	// option to hide the dropdown arrow
	export let hideArrow = false;

	// option to show loading indicator when the async function is executed
	export let showLoadingIndicator = false;

	// text displayed when no items match the input text
	export let noResultsText = 'No results found';

	// text displayed when async data is being loaded
	export let loadingText = 'Loading results...';

	// text displayed when the user text matches a lot of items and we can not display them all in the dropdown
	export let moreItemsText = 'items not shown';

	// the text displayed when no option is selected
	export let placeholder = undefined;

	// HTML input UI properties
	// apply a id to the input control
	export let id = undefined;
	// generate an HTML input with this name
	export let name = undefined;
	// add the title to the HTML input
	export let title = undefined;

	export let label = null;

	// add tabindex support for the input
	// set standard to 0: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
	export let tabindex = 0;

	// --- Public State ----

	// selected item state
	export let selectedItem = multiple ? [] : undefined;
	export let value = undefined;
	export let highlightedItem = undefined;

	// --- Internal State ----
	const uniqueId = 'sautocomplete-' + Math.floor(Math.random() * 1000);

	// HTML elements
	let input;
	let list;
	let inputContainer;

	// UI state
	let opened = false;
	let loading = false;
	let highlightIndex = -1;
	export let text = undefined;
	let filteredTextLength = 0;

	// view model
	let filteredListItems;
	let listItems = [];

	// requests/responses counters
	let lastRequestId = 0;
	let lastResponseId = 0;

	// other state
	let inputDelayTimeout;

	let setPositionOnNextUpdate = false;

	// --- Lifecycle events ---

	afterUpdate(() => {
		if (setPositionOnNextUpdate) {
			setScrollAwareListPosition();
		}
		setPositionOnNextUpdate = false;
	});

	// --- Functions ---

	function safeFunction(theFunction, argument) {
		if (typeof theFunction !== 'function') {
			console.error('Not a function: ' + theFunction + ', argument: ' + argument);
			return undefined;
		}
		let result;
		try {
			result = theFunction(argument);
		} catch (error) {
			console.warn(
				'Error executing Autocomplete function on value: ' + argument + ' function: ' + theFunction
			);
		}
		return result;
	}

	function safeStringFunction(theFunction, argument) {
		let result = safeFunction(theFunction, argument);
		if (result === undefined || result === null) {
			result = '';
		}
		if (typeof result !== 'string') {
			result = result.toString();
		}
		return result;
	}

	function safeLabelFunction(item) {
		return safeStringFunction(labelFunction, item);
	}

	function safeKeywordsFunction(item) {
		const keywords = safeStringFunction(keywordsFunction, item);
		let result = safeStringFunction(keywordsCleanFunction, keywords);
		result = lowercaseKeywords ? result.toLowerCase().trim() : result;
		if (ignoreAccents) {
			result = removeAccents(result);
		}

		return result;
	}

	function prepareListItems() {
		if (!Array.isArray(items)) {
			console.warn('Autocomplete items / search function did not return array but', items);
			items = [];
		}

		const length = items ? items.length : 0;
		listItems = new Array(length);

		if (length > 0) {
			items.forEach((item, i) => {
				const listItem = getListItem(item);
				if (listItem === undefined) {
					console.log('Undefined item for: ', item);
				}
				listItems[i] = listItem;
			});
		}

		filteredListItems = listItems;
	}

	function getListItem(item) {
		return {
			// keywords representation of the item
			keywords: localFiltering ? safeKeywordsFunction(item) : [],
			// item label
			label: safeLabelFunction(item),
			// store reference to the origial item
			item: item
		};
	}

	// -- Reactivity --
	$: items, searchFunction || prepareListItems();

	function onSelectedItemChanged() {
		value = valueFunction(selectedItem);
		if (selectedItem && !multiple) {
			//text = safeLabelFunction(selectedItem);
			text = value;
		}

		filteredListItems = listItems;
		onChange(selectedItem);
	}

	$: selectedItem, onSelectedItemChanged();

	$: highlightedItem =
		filteredListItems &&
		highlightIndex &&
		highlightIndex >= 0 &&
		highlightIndex < filteredListItems.length
			? filteredListItems[highlightIndex].item
			: null;

	$: showList = opened && ((items && items.length > 0) || filteredTextLength > 0);

	$: hasSelection =
		(multiple && selectedItem && selectedItem.length > 0) || (!multiple && selectedItem);

	$: locked = lock && hasSelection;

	function prepareUserEnteredText(userEnteredText) {
		if (userEnteredText === undefined || userEnteredText === null) {
			return '';
		}

		if (!cleanUserText) {
			return userEnteredText;
		}

		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ').trim();

		const cleanUserEnteredText = safeStringFunction(textCleanFunction, textFiltered);
		const textTrimmed = lowercaseKeywords
			? cleanUserEnteredText.toLowerCase().trim()
			: cleanUserEnteredText.trim();

		return textTrimmed;
	}

	function numberOfMatches(listItem, searchWords) {
		if (!listItem) {
			return 0;
		}

		const itemKeywords = listItem.keywords;

		let matches = 0;
		searchWords.forEach((searchWord) => {
			if (itemKeywords.includes(searchWord)) {
				matches++;
			}
		});

		return matches;
	}

	async function search() {
		let textFiltered = prepareUserEnteredText(text);
		if (minCharactersToSearch > 1 && textFiltered.length < minCharactersToSearch) {
			textFiltered = '';
		}
		filteredTextLength = textFiltered.length;

		// if no search text load all items
		if (textFiltered === '') {
			if (searchFunction) {
				// we will need to rerun the search
				items = [];
			} else {
				filteredListItems = listItems;
			}
			if (closeIfMinCharsToSearchReached()) {
				return;
			}
		}

		if (!searchFunction) {
			// internal search
			processListItems(textFiltered);
		} else {
			// external search which provides items
			lastRequestId = lastRequestId + 1;
			const currentRequestId = lastRequestId;
			loading = true;

			// searchFunction is a generator
			if (searchFunction.constructor.name === 'AsyncGeneratorFunction') {
				for await (const chunk of searchFunction(textFiltered, maxItemsToShowInList)) {
					// a chunk of an old response: throw it away
					if (currentRequestId < lastResponseId) {
						return false;
					}

					// a chunk for a new response: reset the item list
					if (currentRequestId > lastResponseId) {
						items = [];
					}

					lastResponseId = currentRequestId;
					items = [...items, ...chunk];
					processListItems(textFiltered);
				}

				// there was nothing in the chunk
				if (lastResponseId < currentRequestId) {
					lastResponseId = currentRequestId;
					items = [];
					processListItems(textFiltered);
				}
			}

			// searchFunction is a regular function
			else {
				let result = await searchFunction(textFiltered, maxItemsToShowInList);

				// If a response to a newer request has been received
				// while responses to this request were being loaded,
				// then we can just throw away this outdated results.
				if (currentRequestId < lastResponseId) {
					return false;
				}

				lastResponseId = currentRequestId;
				items = result;
				processListItems(textFiltered);
			}

			loading = false;
		}
	}

	function defaultItemFilterFunction(listItem, searchWords) {
		const matches = numberOfMatches(listItem, searchWords);
		if (matchAllKeywords) {
			return matches >= searchWords.length;
		} else {
			return matches > 0;
		}
	}

	function defaultItemSortFunction(obj1, obj2, searchWords) {
		return numberOfMatches(obj2, searchWords) - numberOfMatches(obj1, searchWords);
	}

	function processListItems(textFiltered) {
		// cleans, filters, orders, and highlights the list items
		prepareListItems();

		const textFilteredWithoutAccents = ignoreAccents ? removeAccents(textFiltered) : textFiltered;
		const searchWords = textFilteredWithoutAccents.split(/\s+/g).filter((word) => word !== '');

		// local search
		let tempfilteredListItems;
		if (localFiltering) {
			if (itemFilterFunction) {
				tempfilteredListItems = listItems.filter((item) =>
					itemFilterFunction(item.item, searchWords)
				);
			} else {
				tempfilteredListItems = listItems.filter((item) =>
					defaultItemFilterFunction(item, searchWords)
				);
			}

			if (localSorting) {
				if (itemSortFunction) {
					tempfilteredListItems = tempfilteredListItems.sort((item1, item2) =>
						itemSortFunction(item1.item, item2.item, searchWords)
					);
				} else {
					if (sortByMatchedKeywords) {
						tempfilteredListItems = tempfilteredListItems.sort((item1, item2) =>
							defaultItemSortFunction(item1, item2, searchWords)
						);
					}
				}
			}
		} else {
			tempfilteredListItems = listItems;
		}

		const hlfilter = highlightFilter(searchWords, 'label');
		filteredListItems = tempfilteredListItems.map(hlfilter);
		closeIfMinCharsToSearchReached();
		return true;
	}

	function selectListItem(listItem) {
		if ('undefined' === typeof listItem) {
			return false;
		}

		if (locked) {
			return true;
		}

		const newSelectedItem = listItem.item;
		if (beforeChange(selectedItem, newSelectedItem)) {
			// simple selection
			if (!multiple) {
				selectedItem = undefined; // triggers change even if the the same item is selected
				selectedItem = newSelectedItem;
			}
			// first selection of multiple ones
			else if (!selectedItem) {
				selectedItem = [newSelectedItem];
			}
			// selecting something already selected => unselect it
			else if (selectedItem.includes(newSelectedItem)) {
				selectedItem = selectedItem.filter((i) => i !== newSelectedItem);
			}
			// adds the element to the selection
			else {
				selectedItem = [...selectedItem, newSelectedItem];
			}
		}
		return true;
	}

	function selectItem() {
		const listItem = filteredListItems[highlightIndex];
		if (selectListItem(listItem)) {
			close();
			if (multiple) {
				text = '';
				input.focus();
			}
		}
	}

	function up() {
		open();
		if (highlightIndex > 0) {
			highlightIndex--;
		}

		highlight();
	}

	function down() {
		open();
		if (highlightIndex < filteredListItems.length - 1) {
			highlightIndex++;
		}

		highlight();
	}

	function highlight() {
		const query = '.selected';

		/**
		 * @param {Element} el
		 */
		const el = list && list.querySelector(query);
		if (el) {
			if (typeof el.scrollIntoViewIfNeeded === 'function') {
				el.scrollIntoViewIfNeeded();
			} else if (el.scrollIntoView === 'function') {
				el.scrollIntoView();
			}
		}
	}

	function onListItemClick(listItem) {
		if (selectListItem(listItem)) {
			close();
			if (multiple) {
				text = '';
				input.focus();
			}
		}
	}

	function onDocumentClick(e) {
		if (e.composedPath().some((path) => path.classList && path.classList.contains(uniqueId))) {
			highlight();
		} else {
			close();
		}
	}

	function onKeyDown(e) {
		let key = e.key;
		if (key === 'Tab' && e.shiftKey) key = 'ShiftTab';
		const fnmap = {
			Tab: opened ? close : null,
			ShiftTab: opened ? close : null,
			ArrowDown: down.bind(this),
			ArrowUp: up.bind(this),
			Escape: onEsc.bind(this),
			Backspace: multiple && hasSelection && !text ? onBackspace.bind(this) : null
		};
		const fn = fnmap[key];
		if (typeof fn === 'function') {
			fn(e);
		}
	}

	function onKeyPress(e) {
		if (e.key === 'Enter') {
			onEnter(e);
		}
	}

	function onEnter(e) {
		if (opened) {
			e.preventDefault();
			selectItem();
		}
	}

	function onInput(e) {
		text = e.target.value;
		if (inputDelayTimeout) {
			clearTimeout(inputDelayTimeout);
		}

		if (document.activeElement == e.target) {
			if (delay) {
				inputDelayTimeout = setTimeout(processInput, delay);
			} else {
				processInput();
			}
		}
	}

	function unselectItem(tag) {
		selectedItem = selectedItem.filter((i) => i !== tag);
		input.focus();
	}

	function processInput() {
		if (search()) {
			highlightIndex = 0;
			open();
		}
	}

	function onInputClick() {
		resetListToAllItemsAndOpen();
	}

	function onEsc(e) {
		//if (text) return clear();
		e.stopPropagation();
		if (opened) {
			input.focus();
			close();
		}
	}

	function onBackspace() {
		unselectItem(selectedItem[selectedItem.length - 1]);
	}

	function onFocusInternal(e) {
		if (document.activeElement == e.target) {
			resetListToAllItemsAndOpen();
		}
	}

	function onBlurInternal() {
		if (closeOnBlur) {
			close();
		}

		onBlur();
	}

	function resetListToAllItemsAndOpen() {
		if (searchFunction && !listItems.length) {
			search();
		} else if (!text) {
			filteredListItems = listItems;
		}

		open();

		// find selected item
		if (selectedItem) {
			const index = findItemIndex(selectedItem, filteredListItems);
			if (index >= 0) {
				highlightIndex = index;
				highlight();
			}
		}
	}

	function findItemIndex(item, items) {
		let index = -1;
		for (let i = 0; i < items.length; i++) {
			const listItem = items[i];
			if ('undefined' === typeof listItem) {
				continue;
			}
			if (item === listItem.item) {
				index = i;
				break;
			}
		}

		return index;
	}

	function open() {
		// check if the search text has more than the min chars required
		if (locked || notEnoughSearchText()) {
			return;
		}

		setPositionOnNextUpdate = true;

		opened = true;
	}

	function close() {
		opened = false;
		loading = false;

		if (!text && selectFirstIfEmpty) {
			highlightIndex = 0;
			selectItem();
		}
	}

	function notEnoughSearchText() {
		return (
			minCharactersToSearch > 0 &&
			filteredTextLength < minCharactersToSearch &&
			// When no searchFunction is defined, the menu should always open when the input is focused
			(searchFunction || filteredTextLength > 0)
		);
	}

	function closeIfMinCharsToSearchReached() {
		if (notEnoughSearchText()) {
			close();
			return true;
		}
		return false;
	}

	export function highlightFilter(keywords, field) {
		return (item) => {
			let label = item[field];

			const newItem = Object.assign({ highlighted: undefined }, item);
			newItem.highlighted = label;

			const labelLowercase = label.toLowerCase();
			const labelLowercaseNoAc = ignoreAccents ? removeAccents(labelLowercase) : labelLowercase;

			if (keywords && keywords.length) {
				const positions = [];

				for (let i = 0; i < keywords.length; i++) {
					let keyword = keywords[i];
					if (ignoreAccents) {
						keyword = removeAccents(keyword);
					}
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

						const keywordPattern = labelLowercase.substring(pos1, pos2);
						keywordPatterns.add(keywordPattern);
					}
					for (let keywordPattern of keywordPatterns) {
						// FIXME pst: workarond for wrong replacement <b> tags
						if (keywordPattern === 'b') {
							continue;
						}
						const reg = new RegExp('(' + keywordPattern + ')', 'ig');

						const newHighlighted = newItem.highlighted.replace(reg, '<b>$1</b>');
						newItem.highlighted = newHighlighted;
					}
				}
			}

			return newItem;
		};
	}

	function removeAccents(str) {
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}

	function isConfirmed(listItem) {
		if (!selectedItem) {
			return false;
		}
		if (multiple) {
			return selectedItem.includes(listItem);
		} else {
			return listItem === selectedItem;
		}
	}

	function setScrollAwareListPosition() {
		const { height: viewPortHeight } = window.visualViewport;
		const { bottom: inputButtom, height: inputHeight } = inputContainer.getBoundingClientRect();
		const { height: listHeight } = list.getBoundingClientRect();

		if (inputButtom + listHeight > viewPortHeight) {
			list.style.top = `-${inputHeight + listHeight}px`;
		} else {
			list.style.top = '0px';
		}
	}
</script>

<div
	class="autocomplete relative align-top inline-block w-full {uniqueId}"
	class:hide-arrow={hideArrow || opened}
	class:is-loading={showLoadingIndicator && loading}
>
	<div class="input-container relative" bind:this={inputContainer}>
		<input
			type="text"
			class="px-2.5 pb-2.5 pt-4 block w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none dark:text-white focus:outline-none focus:ring-0 peer border-gray-300 dark:border-gray-600 dark:focus:border-blue-500 focus:border-blue-600"
			id={id ? id : ''}
			{placeholder}
			{name}
			{title}
			{tabindex}
			bind:this={input}
			bind:value={text}
			on:input={onInput}
			on:focus={onFocusInternal}
			on:blur={onBlurInternal}
			on:keydown={onKeyDown}
			on:click={onInputClick}
			on:keypress={onKeyPress}
			on:change
			{...$$restProps}
		/>
		<label
			for={id}
			class="absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1 text-gray-500 dark:text-gray-400 peer-focus:text-blue-600 peer-focus:dark:text-blue-500"
		>
			{label}
		</label>
	</div>
	<div
		class="autocomplete-list flex flex-col relative w-fullbg-white overflow-y-auto z-[99] py-2.5 rounded-lg border border-solid border-[#999] select-none {showList
			? ''
			: 'invisible hidden'} "
		bind:this={list}
	>
		{#if filteredListItems && filteredListItems.length > 0}
			<slot name="dropdown-header" nbItems={filteredListItems.length} {maxItemsToShowInList} />

			{#each filteredListItems as listItem, i}
				{#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
					<span
						role="button"
						tabindex="0"
						aria-roledescription="test"
						class="text-start py-1 px-4 leading-none cursor-pointer text-[#333] {i ===
						highlightIndex
							? 'text-white bg-[#2e69e2]'
							: ''} {isConfirmed(listItem.item) ? 'text-white bg-[#789fed]' : ''}"
						on:click={() => onListItemClick(listItem)}
						on:keypress={(e) => {
							e.key == 'Enter' && onListItemClick(listItem);
						}}
						on:pointerenter={() => {
							highlightIndex = i;
						}}
					>
						<slot
							name="item"
							item={listItem.item}
							label={listItem.highlighted ? listItem.highlighted : listItem.label}
						>
							{#if listItem.highlighted}
								{@html listItem.highlighted}
							{:else}
								{@html listItem.label}
							{/if}
						</slot>
					</span>
				{/if}
			{/each}

			<slot name="dropdown-footer" nbItems={filteredListItems.length} {maxItemsToShowInList}>
				{#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
					{#if moreItemsText}
						<div class="py-1 px-4 bg-secondary leading-none">
							...{filteredListItems.length - maxItemsToShowInList}
							{moreItemsText}
						</div>
					{/if}
				{/if}
			</slot>
		{:else if loading && loadingText}
			<div class="py-1 px-4 leading-none">
				<slot name="loading" {loadingText}>{loadingText}</slot>
			</div>
		{:else if noResultsText}
			<div class="py-1 px-4 leading-none bg-secondary">
				<slot name="no-results" {noResultsText}>{noResultsText}</slot>
			</div>
		{/if}
	</div>
</div>

<svelte:window on:click={onDocumentClick} on:scroll={() => (setPositionOnNextUpdate = true)} />

<style>
	.autocomplete {
		min-width: 200px;
	}

	.autocomplete:not(.hide-arrow):not(.is-loading)::after {
		border: 3px solid;
		border-radius: 2px;
		border-right: 0;
		border-top: 0;
		content: ' ';
		display: block;
		height: 0.625em;
		margin-top: -0.4375em;
		pointer-events: none;
		position: absolute;
		top: 50%;
		-webkit-transform: rotate(-45deg);
		transform: rotate(-45deg);
		-webkit-transform-origin: center;
		transform-origin: center;
		width: 0.625em;
		border-color: #3273dc;
		right: 1.125em;
		z-index: 4;
	}

	.autocomplete * {
		box-sizing: border-box;
	}

	.autocomplete-list {
		max-height: calc(15 * (1rem + 10px) + 15px);
	}
</style>
