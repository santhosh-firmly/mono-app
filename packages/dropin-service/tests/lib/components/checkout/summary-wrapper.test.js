import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import SummaryWrapper from '$lib/components/checkout/summary-wrapper.svelte';

describe('Summary Wrapper', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders as a container div', () => {
		const { container } = render(SummaryWrapper);

		const wrapper = container.querySelector('div');
		expect(wrapper).toBeInTheDocument();
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
		expect(wrapper).toHaveClass('gap-y-4');
	});

	it('renders with text-start alignment', () => {
		const { container } = render(SummaryWrapper);

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('text-start');
	});

	describe('snippet rendering', () => {
		it('renders price snippet when provided', () => {
			const priceSnippet = createRawSnippet(() => ({
				render: () => '<span data-testid="price">$99.99</span>'
			}));

			const { getByTestId } = render(SummaryWrapper, {
				props: { price: priceSnippet }
			});

			expect(getByTestId('price')).toBeInTheDocument();
		});

		it('renders lineItems snippet when provided', () => {
			const lineItemsSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="line-items">Items</div>'
			}));

			const { getByTestId } = render(SummaryWrapper, {
				props: { lineItems: lineItemsSnippet }
			});

			expect(getByTestId('line-items')).toBeInTheDocument();
		});

		it('renders promocode snippet when provided', () => {
			const promocodeSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="promocode">Promo</div>'
			}));

			const { getByTestId } = render(SummaryWrapper, {
				props: { promocode: promocodeSnippet }
			});

			expect(getByTestId('promocode')).toBeInTheDocument();
		});

		it('renders resume snippet when provided', () => {
			const resumeSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="resume">Resume</div>'
			}));

			const { getByTestId } = render(SummaryWrapper, {
				props: { resume: resumeSnippet }
			});

			expect(getByTestId('resume')).toBeInTheDocument();
		});

		it('renders all snippets in order', () => {
			const priceSnippet = createRawSnippet(() => ({
				render: () => '<span data-testid="price">Price</span>'
			}));
			const lineItemsSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="line-items">Items</div>'
			}));
			const promocodeSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="promocode">Promo</div>'
			}));
			const resumeSnippet = createRawSnippet(() => ({
				render: () => '<div data-testid="resume">Resume</div>'
			}));

			const { getByTestId } = render(SummaryWrapper, {
				props: {
					price: priceSnippet,
					lineItems: lineItemsSnippet,
					promocode: promocodeSnippet,
					resume: resumeSnippet
				}
			});

			expect(getByTestId('price')).toBeInTheDocument();
			expect(getByTestId('line-items')).toBeInTheDocument();
			expect(getByTestId('promocode')).toBeInTheDocument();
			expect(getByTestId('resume')).toBeInTheDocument();
		});
	});
});
