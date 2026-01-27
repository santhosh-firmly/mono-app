import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import UiSkeleton from '$lib/components/ui/skeleton.svelte';

describe('UiSkeleton', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders with default text variant', () => {
		const { container } = render(UiSkeleton);

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toBeInTheDocument();
		expect(skeleton).toHaveClass('h-4', 'rounded');
	});

	it('renders with circle variant', () => {
		const { container } = render(UiSkeleton, {
			props: { variant: 'circle' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('rounded-full', 'aspect-square');
	});

	it('renders with rect variant', () => {
		const { container } = render(UiSkeleton, {
			props: { variant: 'rect' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('rounded-lg');
	});

	it('renders with button variant', () => {
		const { container } = render(UiSkeleton, {
			props: { variant: 'button' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('h-10', 'rounded-lg');
	});

	it('renders with input variant', () => {
		const { container } = render(UiSkeleton, {
			props: { variant: 'input' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('h-10', 'rounded-lg');
	});

	it('applies custom width', () => {
		const { container } = render(UiSkeleton, {
			props: { width: '200px' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveStyle({ width: '200px' });
	});

	it('applies custom height', () => {
		const { container } = render(UiSkeleton, {
			props: { height: '50px' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveStyle({ height: '50px' });
	});

	it('applies custom className', () => {
		const { container } = render(UiSkeleton, {
			props: { class: 'custom-class' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('custom-class');
	});

	it('has pulse animation by default', () => {
		const { container } = render(UiSkeleton);

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('animate-pulse');
	});

	it('disables animation when animate is false', () => {
		const { container } = render(UiSkeleton, {
			props: { animate: false }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).not.toHaveClass('animate-pulse');
	});

	it('has accessible loading text', () => {
		const { getByText } = render(UiSkeleton);

		expect(getByText('Loading...')).toHaveClass('sr-only');
	});

	it('has status role for accessibility', () => {
		const { container } = render(UiSkeleton);

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
	});

	it('falls back to text variant for invalid variant', () => {
		const { container } = render(UiSkeleton, {
			props: { variant: 'invalid-variant' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton).toHaveClass('h-4', 'rounded');
	});

	it('does not set width style when width is empty', () => {
		const { container } = render(UiSkeleton, {
			props: { width: '' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton.style.width).toBe('');
	});

	it('does not set height style when height is empty', () => {
		const { container } = render(UiSkeleton, {
			props: { height: '' }
		});

		const skeleton = container.querySelector('[role="status"]');
		expect(skeleton.style.height).toBe('');
	});
});
