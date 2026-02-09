import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TermsBox from '$lib/components/checkout/terms-box.svelte';

const defaultProps = {
	partnerName: 'Partner Co',
	merchantName: 'Merchant Inc',
	anchors: [
		{ label: 'Partner Co Terms of Service', url: 'https://partner.com/terms' },
		{ label: 'Partner Co Privacy Policy', url: 'https://partner.com/privacy' },
		{ label: 'Merchant Inc Terms of Service', url: 'https://merchant.com/terms' },
		{ label: 'Merchant Inc Privacy Policy', url: 'https://merchant.com/privacy' }
	]
};

describe('TermsBox', () => {
	afterEach(() => {
		cleanup();
	});

	describe('rendering', () => {
		it('renders the alert container', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			const alert = container.querySelector('[class*="bg-"]');
			expect(alert).toBeInTheDocument();
		});

		it('renders partner and merchant names', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			const boldElements = container.querySelectorAll('.font-bold');
			expect(boldElements).toHaveLength(2);
			expect(boldElements[0].textContent).toBe('Partner Co');
			expect(boldElements[1].textContent).toBe('Merchant Inc');
		});

		it('renders the terms consent text', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			expect(container.textContent).toContain(
				'By placing this order, you agree to the Terms of Service and Privacy Policy'
			);
		});

		it('renders expand button when anchors are provided', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			expect(button).toBeInTheDocument();
		});

		it('does not render expand button when no anchors are provided', () => {
			const { container } = render(TermsBox, {
				props: { ...defaultProps, anchors: [] }
			});

			const button = container.querySelector('button[aria-expanded]');
			expect(button).not.toBeInTheDocument();
		});

		it('has aria-expanded set to false by default', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('does not render anchor links when collapsed', () => {
			const { container } = render(TermsBox, { props: defaultProps });

			const links = container.querySelectorAll('a[target="_blank"]');
			expect(links).toHaveLength(0);
		});
	});

	describe('expand/collapse behavior', () => {
		it('expands when button is clicked', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			await user.click(button);

			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('shows anchor links when expanded', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			await user.click(button);

			const links = container.querySelectorAll('a[target="_blank"]');
			expect(links).toHaveLength(4);
		});

		it('renders anchors with correct attributes', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			await user.click(button);

			const links = container.querySelectorAll('a[target="_blank"]');
			links.forEach((link) => {
				expect(link).toHaveAttribute('rel', 'noopener noreferrer');
				expect(link).toHaveAttribute('target', '_blank');
			});
		});

		it('renders anchors with correct URLs and labels', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');
			await user.click(button);

			const links = container.querySelectorAll('a[target="_blank"]');
			expect(links[0]).toHaveAttribute('href', 'https://partner.com/terms');
			expect(links[0].textContent.trim()).toBe('Partner Co Terms of Service');
			expect(links[1]).toHaveAttribute('href', 'https://partner.com/privacy');
			expect(links[1].textContent.trim()).toBe('Partner Co Privacy Policy');
			expect(links[2]).toHaveAttribute('href', 'https://merchant.com/terms');
			expect(links[2].textContent.trim()).toBe('Merchant Inc Terms of Service');
			expect(links[3]).toHaveAttribute('href', 'https://merchant.com/privacy');
			expect(links[3].textContent.trim()).toBe('Merchant Inc Privacy Policy');
		});

		it('collapses when button is clicked again', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: defaultProps });

			const button = container.querySelector('button[aria-expanded]');

			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');

			await user.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});
	});

	describe('merchant-only mode', () => {
		const merchantOnlyProps = {
			merchantName: 'Merchant Inc',
			anchors: [
				{ label: 'Merchant Inc Terms of Service', url: 'https://merchant.com/terms' },
				{ label: 'Merchant Inc Privacy Policy', url: 'https://merchant.com/privacy' }
			]
		};

		it('renders only merchant name when partnerName is not provided', () => {
			const { container } = render(TermsBox, { props: merchantOnlyProps });

			const boldElements = container.querySelectorAll('.font-bold');
			expect(boldElements).toHaveLength(1);
			expect(boldElements[0].textContent).toBe('Merchant Inc');
		});

		it('renders only merchant name when partnerName is empty', () => {
			const { container } = render(TermsBox, {
				props: { ...merchantOnlyProps, partnerName: '' }
			});

			const boldElements = container.querySelectorAll('.font-bold');
			expect(boldElements).toHaveLength(1);
			expect(boldElements[0].textContent).toBe('Merchant Inc');
		});

		it('shows only merchant anchors when expanded', async () => {
			const user = userEvent.setup();
			const { container } = render(TermsBox, { props: merchantOnlyProps });

			const button = container.querySelector('button[aria-expanded]');
			await user.click(button);

			const links = container.querySelectorAll('a[target="_blank"]');
			expect(links).toHaveLength(2);
			expect(links[0]).toHaveAttribute('href', 'https://merchant.com/terms');
			expect(links[1]).toHaveAttribute('href', 'https://merchant.com/privacy');
		});
	});

});
