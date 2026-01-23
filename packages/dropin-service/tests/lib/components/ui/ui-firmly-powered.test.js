import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import UiFirmlyPowered from '$lib/components/ui/firmly-powered.svelte';

describe('UiFirmlyPowered', () => {
	it('renders firmly branding and links', () => {
		const { getByText, getByRole } = render(UiFirmlyPowered);

		// Check for the "firmly" brand text
		const brandText = getByText('firmly');
		expect(brandText).toBeInTheDocument();
		expect(brandText).toHaveClass('font-josefin');

		// Check for Terms link
		const termsLink = getByRole('link', { name: /terms/i });
		expect(termsLink).toHaveAttribute('href', 'https://www.firmly.ai/terms');
		expect(termsLink).toHaveAttribute('target', '_blank');

		// Check for Privacy link
		const privacyLink = getByRole('link', { name: /privacy/i });
		expect(privacyLink).toHaveAttribute('href', 'https://www.firmly.ai/privacy');
		expect(privacyLink).toHaveAttribute('target', '_blank');
	});
});
