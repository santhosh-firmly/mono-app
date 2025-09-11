<script>
	// @ts-nocheck

	import FooterLinks from './footer-links.svelte';
	import PaymentButton from './payment-button.svelte';

	/**
	 * Footer component props
	 * @param {Array|null} terms - Array of terms/disclaimers to display
	 * @param {string} buttonText - Text for the payment button
	 * @param {Function} onclick - Click handler for payment button
	 * @param {Object} total - Total amount object
	 * @param {boolean} disabled - Whether payment button is disabled
	 * @param {boolean} inProgress - Whether payment is in progress
	 * @param {boolean} isOrderPlaced - Whether order has been placed
	 */
	let {
		terms = null,
		buttonText = 'Place Order',
		onclick,
		total,
		disabled,
		inProgress,
		isOrderPlaced
	} = $props();

	/**
	 * Validates if a URL is safe to use
	 * @param {string} url - The URL to validate
	 * @returns {boolean} - Whether the URL is safe
	 */
	function isValidUrl(url) {
		if (!url || typeof url !== 'string') return false;

		try {
			const urlObj = new URL(url);
			// Only allow http and https protocols
			return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
		} catch {
			return false;
		}
	}

	/**
	 * Escapes HTML characters to prevent XSS
	 * @param {string} text - Text to escape
	 * @returns {string} - Escaped text
	 */
	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Creates safe HTML for terms text with proper link replacements
	 * @param {Object} term - Term object with text and optional links
	 * @returns {string} - Safe HTML string with proper links
	 */
	function createTermHTML(term) {
		if (!term || !term.text) {
			return '';
		}

		let htmlText = escapeHtml(term.text);

		// Only process links if they exist
		if (term.links) {
			// Replace Terms of Service
			if (term.links.termsOfService && isValidUrl(term.links.termsOfService)) {
				const escapedUrl = escapeHtml(term.links.termsOfService);
				htmlText = htmlText.replace(
					/Terms of Service/g,
					`<a class="underline" target="_blank" rel="noopener noreferrer" href="${escapedUrl}">Terms of Service</a>`
				);
			}

			// Replace Terms of Use
			if (term.links.termsOfUse && isValidUrl(term.links.termsOfUse)) {
				const escapedUrl = escapeHtml(term.links.termsOfUse);
				htmlText = htmlText.replace(
					/Terms of Use/g,
					`<a class="underline" target="_blank" rel="noopener noreferrer" href="${escapedUrl}">Terms of Use</a>`
				);
			}

			// Replace Privacy Policy
			if (term.links.privacyPolicy && isValidUrl(term.links.privacyPolicy)) {
				const escapedUrl = escapeHtml(term.links.privacyPolicy);
				htmlText = htmlText.replace(
					/Privacy Policy/g,
					`<a class="underline" target="_blank" rel="noopener noreferrer" href="${escapedUrl}">Privacy Policy</a>`
				);
			}

			// Replace FTC compliance policy if link is provided
			if (term.links.ftcCompliance && isValidUrl(term.links.ftcCompliance)) {
				const escapedUrl = escapeHtml(term.links.ftcCompliance);
				htmlText = htmlText.replace(
					/FTC compliance policy/g,
					`<a class="underline" target="_blank" rel="noopener noreferrer" href="${escapedUrl}">FTC compliance policy</a>`
				);
			}
		}

		return htmlText;
	}
</script>

<div class="flex flex-col gap-4 pt-4 text-center">
	{#if terms && terms.length > 0}
		<div class="flex flex-col gap-2">
			{#each terms as term}
				<span class="text-fy-on-primary-subtle p-2 text-xs">
					{@html createTermHTML(term)}
				</span>
			{/each}
		</div>
	{/if}
	<PaymentButton {onclick} {total} {disabled} {inProgress} {isOrderPlaced} {buttonText} />
	<span
		class="text-fy-on-primary-subtle flex flex-row items-start justify-center gap-2 text-xs leading-normal"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="11"
			height="16"
			viewBox="0 0 11 16"
			fill="none"
		>
			<path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M5.50087 0C4.6463 0 3.82674 0.396186 3.22247 1.1014C2.6182 1.80662 2.27872 2.76309 2.27872 3.76042V5.90923C1.7904 5.90923 1.32208 6.13562 0.976782 6.5386C0.631486 6.94158 0.4375 7.48814 0.4375 8.05804V12.8929C0.4375 13.4628 0.631486 14.0093 0.976782 14.4123C1.32208 14.8153 1.7904 15.0417 2.27872 15.0417H8.72301C9.21133 15.0417 9.67966 14.8153 10.025 14.4123C10.3703 14.0093 10.5642 13.4628 10.5642 12.8929V8.05804C10.5642 7.48814 10.3703 6.94158 10.025 6.5386C9.67966 6.13562 9.21133 5.90923 8.72301 5.90923V3.76042C8.72301 1.68323 7.28072 0 5.50087 0ZM7.8024 5.90923V3.76042C7.8024 3.04804 7.55992 2.36484 7.1283 1.86112C6.69668 1.35739 6.11127 1.0744 5.50087 1.0744C4.89046 1.0744 4.30506 1.35739 3.87344 1.86112C3.44182 2.36484 3.19934 3.04804 3.19934 3.76042V5.90923H7.8024Z"
				fill="#A3A3A3"
			/>
		</svg>
		Payments are secure and encrypted
	</span>
	<span class="text-fy-on-primary-subtle mt-6 text-xs @md:hidden">
		<FooterLinks />
	</span>
</div>
