import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import SummaryImagesPreview from '$lib/components/checkout/summary-images-preview.svelte';

describe('Summary Images Preview', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders image from images array', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', 'https://via.placeholder.com/128');
	});

	it('renders all images in stack when multiple images provided', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: [
					'https://via.placeholder.com/128/first',
					'https://via.placeholder.com/128/second'
				]
			}
		});

		const imgs = container.querySelectorAll('img');
		expect(imgs.length).toBe(2);
	});

	it('limits images to maxImages prop', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: [
					'https://via.placeholder.com/128/1',
					'https://via.placeholder.com/128/2',
					'https://via.placeholder.com/128/3',
					'https://via.placeholder.com/128/4'
				],
				maxImages: 2
			}
		});

		const imgs = container.querySelectorAll('img');
		expect(imgs.length).toBe(2);
	});

	it('renders image stack container', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: [
					'https://via.placeholder.com/128/first',
					'https://via.placeholder.com/128/second'
				]
			}
		});

		const stack = container.querySelector('[data-testid="image-stack"]');
		expect(stack).toBeInTheDocument();
	});

	it('applies custom class', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128'],
				class: 'custom-class'
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('custom-class');
	});

	it('renders with flex column layout', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('flex');
		expect(wrapper).toHaveClass('flex-col');
	});

	it('renders with centered alignment', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('items-center');
		expect(wrapper).toHaveClass('justify-center');
	});

	it('renders with full width', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('w-full');
	});

	it('renders with vertical padding', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('py-10');
	});

	it('renders with gap between elements', () => {
		const { container } = render(SummaryImagesPreview, {
			props: {
				images: ['https://via.placeholder.com/128']
			}
		});

		const wrapper = container.querySelector('div');
		expect(wrapper).toHaveClass('gap-y-8');
	});
});
