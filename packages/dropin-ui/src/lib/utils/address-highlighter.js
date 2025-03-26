/**
 * Highlights parts of an address that match the search query
 *
 * @param {string} address - The full address to highlight
 * @param {string} searchQuery - The search query to match against
 * @returns {string} - Address with HTML highlight tags
 */
export function highlightAddress(address, searchQuery) {
	if (!searchQuery.trim()) {
		return address;
	}

	const searchWords = searchQuery.split(/\s+/g).filter((word) => word !== '');
	let highlighted = address;
	const labelLowercase = address.toLowerCase();

	if (searchWords && searchWords.length) {
		const positions = [];

		for (let i = 0; i < searchWords.length; i++) {
			let keyword = searchWords[i].toLowerCase();
			const keywordLen = keyword.length;

			let pos1 = 0;
			do {
				pos1 = labelLowercase.indexOf(keyword, pos1);
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
				const reg = new RegExp('(' + keywordPattern + ')', 'ig');
				highlighted = highlighted.replace(reg, '<b>$1</b>');
			}
		}
	}

	return highlighted;
}

/**
 * Process address predictions to add highlighting
 *
 * @param {Array} predictions - Array of address prediction objects
 * @param {string} searchQuery - The search query to highlight matches
 * @returns {Array} - Array of predictions with highlighting added
 */
export function processPredictions(predictions, searchQuery) {
	return predictions.map((prediction) => {
		return {
			...prediction,
			highlighted: highlightAddress(prediction.address, searchQuery)
		};
	});
}
