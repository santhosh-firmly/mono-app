import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';

describe('IconCcBrand', () => {
	afterEach(() => {
		cleanup();
	});

	describe('renders icon for supported card types', () => {
		it('renders for Visa cards starting with 4', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '4111' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for Mastercard cards starting with 51-55', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '5111' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for Mastercard cards starting with 55', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '5511' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for American Express cards starting with 34', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '3411' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for American Express cards starting with 37', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '3711' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for JCB cards starting with 35', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '3511' }
			});
			expect(container.firstChild).toBeTruthy();
		});

		it('renders for Mastercard cards starting with 22-27', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '2211' }
			});
			expect(container.firstChild).toBeTruthy();
		});
	});

	describe('renders nothing for unsupported card types', () => {
		it('renders nothing for Discover cards (6011) - not in template', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '6011' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});

		it('renders nothing for Diners Club cards (300-305) - not in template', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '3001' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});

		it('renders nothing for UnionPay cards (62) - not in template', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '6211' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});

		it('renders nothing for Maestro cards - not in template', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '5018' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});

		it('renders nothing for unknown card types', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '0000' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});

		it('renders nothing for invalid prefixes', () => {
			const { container } = render(IconCcBrand, {
				props: { first4: '1234' }
			});
			const svg = container.querySelector('svg');
			expect(svg).toBeNull();
		});
	});
});
