import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Skeleton from '$lib/components/buy-now/skeleton.svelte';

describe('BuyNow Skeleton', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the skeleton container', () => {
		const { container } = render(Skeleton);

		const mainContainer = container.querySelector('.grid');
		expect(mainContainer).toBeInTheDocument();
	});

	it('renders product image skeleton', () => {
		const { container } = render(Skeleton);

		const imageSkeleton = container.querySelector('.aspect-square');
		expect(imageSkeleton).toBeInTheDocument();
		expect(imageSkeleton).toHaveClass('animate-pulse');
	});

	it('renders product title skeleton', () => {
		const { container } = render(Skeleton);

		const titleSkeleton = container.querySelector('.h-8.w-3\\/4');
		expect(titleSkeleton).toBeInTheDocument();
		expect(titleSkeleton).toHaveClass('animate-pulse');
	});

	it('renders price skeleton', () => {
		const { container } = render(Skeleton);

		const priceSkeleton = container.querySelector('.h-6.w-1\\/3');
		expect(priceSkeleton).toBeInTheDocument();
		expect(priceSkeleton).toHaveClass('animate-pulse');
	});

	it('renders description lines skeleton', () => {
		const { container } = render(Skeleton);

		const descriptionLines = container.querySelectorAll('.h-4.w-full');
		expect(descriptionLines.length).toBeGreaterThanOrEqual(2);
	});

	it('renders variant selector skeletons', () => {
		const { container } = render(Skeleton);

		const variantSelectors = container.querySelectorAll('.h-8.w-16');
		expect(variantSelectors.length).toBe(6);
	});

	it('renders add to cart button skeleton', () => {
		const { container } = render(Skeleton);

		const buttonSkeleton = container.querySelector('.h-12.w-full');
		expect(buttonSkeleton).toBeInTheDocument();
		expect(buttonSkeleton).toHaveClass('animate-pulse');
	});

	it('uses responsive grid layout', () => {
		const { container } = render(Skeleton);

		const grid = container.querySelector('.grid-cols-1');
		expect(grid).toBeInTheDocument();
		expect(grid).toHaveClass('@md:grid-cols-2');
	});
});
