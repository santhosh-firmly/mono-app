import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import UiImage from '$lib/components/ui/image.svelte';

describe('UiImage', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders image with correct attributes', () => {
		const { getByAltText } = render(UiImage, {
			props: {
				src: 'https://via.placeholder.com/150',
				alt: 'Product image',
				title: 'Product',
				width: 80,
				height: 80
			}
		});

		const image = getByAltText('Product image');

		expect(image).toBeInTheDocument();
		expect(image).toHaveAttribute('src', 'https://via.placeholder.com/150');
		expect(image).toHaveAttribute('title', 'Product');
	});

	it('renders large image with custom dimensions', () => {
		const { getByAltText } = render(UiImage, {
			props: {
				src: 'https://via.placeholder.com/300',
				alt: 'Large image',
				width: 150,
				height: 150
			}
		});

		const image = getByAltText('Large image');

		expect(image).toHaveStyle({ width: '150px', height: '150px' });
	});

	it('handles broken image source', () => {
		const { getByAltText } = render(UiImage, {
			props: {
				src: 'https://invalid-url-that-will-fail.com/image.jpg',
				alt: 'Broken image',
				width: 80,
				height: 80
			}
		});

		// Image should be in the document initially
		const image = getByAltText('Broken image');
		expect(image).toBeInTheDocument();
	});

	it('uses default width and height when not provided', () => {
		const { getByAltText } = render(UiImage, {
			props: {
				src: 'https://via.placeholder.com/150',
				alt: 'Default size image'
			}
		});

		const image = getByAltText('Default size image');
		expect(image).toHaveStyle({ width: '80px', height: '80px' });
	});

	it('shows fallback on error', async () => {
		const { getByAltText, container, queryByAltText } = render(UiImage, {
			props: {
				src: 'https://invalid.com/broken.jpg',
				alt: 'Broken image',
				width: 100,
				height: 100
			}
		});

		const image = getByAltText('Broken image');
		await fireEvent.error(image);

		expect(queryByAltText('Broken image')).not.toBeInTheDocument();
		const fallbackDiv = container.querySelector('.bg-border');
		expect(fallbackDiv).toBeInTheDocument();
		expect(fallbackDiv).toHaveStyle({ width: '100px', height: '100px' });
	});
});
