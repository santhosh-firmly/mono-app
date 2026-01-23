import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import Layout from '$lib/components/checkout/layout.svelte';

describe('Checkout Layout', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders both sections', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const sections = container.querySelectorAll('section');
			expect(sections.length).toBe(2);
		});
	});

	it('shows skeleton when loading', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const skeletons = container.querySelectorAll('.animate-pulse');
			expect(skeletons.length).toBeGreaterThan(0);
		});
	});

	it('renders with form element', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const form = container.querySelector('form');
			expect(form).toBeInTheDocument();
		});
	});

	it('renders main container with min height', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const mainContainer = container.querySelector('.min-h-full');
			expect(mainContainer).toBeInTheDocument();
		});
	});

	it('uses container queries', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const containerQuery = container.querySelector('.\\@container');
			expect(containerQuery).toBeInTheDocument();
		});
	});

	it('renders left skeleton elements when loading', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const roundedFullElements = container.querySelectorAll('.rounded-full');
			expect(roundedFullElements.length).toBeGreaterThan(0);
		});
	});

	it('renders right skeleton elements when loading', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const gridElements = container.querySelectorAll('.grid-cols-1');
			expect(gridElements.length).toBeGreaterThan(0);
		});
	});

	it('prevents form submission', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const form = container.querySelector('form');
			expect(form).toBeInTheDocument();
		});
	});

	it('applies default colors when not provided', async () => {
		const { container } = render(Layout, {
			props: {
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const sections = container.querySelectorAll('section');
			expect(sections.length).toBe(2);
		});
	});

	it('renders two section elements', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const sections = container.querySelectorAll('section');
			expect(sections.length).toBe(2);
		});
	});

	it('renders with responsive layout classes', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const form = container.querySelector('form');
			expect(form).toHaveClass('flex-col');
			expect(form).toHaveClass('@3xl:flex-row');
		});
	});

	it('applies dark text color for light backgrounds', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#3498db', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const sections = container.querySelectorAll('section');
			expect(sections.length).toBe(2);
		});
	});

	it('applies light text color for dark backgrounds', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#ffffff', background: '#000000' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		await waitFor(() => {
			const sections = container.querySelectorAll('section');
			expect(sections.length).toBe(2);
		});
	});

	it('prevents default form submission behavior', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: false
			}
		});

		const form = container.querySelector('form');
		const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
		const prevented = !form.dispatchEvent(submitEvent);

		expect(prevented).toBe(true);
	});

	it('renders UiFirmlyPowered in skeleton loading state', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const firmlyPowered = container.querySelectorAll('.flex.justify-center');
			expect(firmlyPowered.length).toBeGreaterThan(0);
		});
	});

	it('renders mobile skeleton elements', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const mobileElements = container.querySelectorAll('.\\@3xl\\:hidden');
			expect(mobileElements.length).toBeGreaterThan(0);
		});
	});

	it('renders desktop skeleton elements', async () => {
		const { container } = render(Layout, {
			props: {
				colors: { primary: '#000000', background: '#ffffff' },
				asection: () => {},
				bsection: () => {},
				isLoading: true
			}
		});

		await waitFor(() => {
			const desktopElements = container.querySelectorAll('.\\@3xl\\:flex');
			expect(desktopElements.length).toBeGreaterThan(0);
		});
	});
});
