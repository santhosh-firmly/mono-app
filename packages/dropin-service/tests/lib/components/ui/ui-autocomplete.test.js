import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import UiAutocomplete from '$lib/components/ui/autocomplete.svelte';

describe('UiAutocomplete', () => {
	afterEach(() => {
		cleanup();
	});

	const mockOptions = [
		{ id: '1', value: '123 Main St' },
		{ id: '2', value: '456 Oak Ave' },
		{ id: '3', value: '789 Pine Blvd' }
	];

	it('renders without options dropdown when closed', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: '',
				isOpen: false
			}
		});

		expect(container.querySelector('.absolute')).not.toBeInTheDocument();
	});

	it('renders options dropdown when open with sufficient value length', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'test',
				isOpen: true
			}
		});

		expect(container.querySelector('.absolute')).toBeInTheDocument();
	});

	it('does not render dropdown when value length is less than 3', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'ab',
				isOpen: true
			}
		});

		expect(container.querySelector('.absolute')).not.toBeInTheDocument();
	});

	it('does not render dropdown when no options available', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: [],
				value: 'test',
				isOpen: true
			}
		});

		expect(container.querySelector('.absolute')).not.toBeInTheDocument();
	});

	it('renders all options', () => {
		const { getByText } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'test',
				isOpen: true
			}
		});

		expect(getByText('123 Main St')).toBeInTheDocument();
		expect(getByText('456 Oak Ave')).toBeInTheDocument();
		expect(getByText('789 Pine Blvd')).toBeInTheDocument();
	});

	it('calls onSelect when an option is clicked', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();

		const { getByText } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'test',
				isOpen: true,
				onSelect
			}
		});

		await user.click(getByText('123 Main St'));
		expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
	});

	it('has combobox role when open', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'test',
				isOpen: true
			}
		});

		const combobox = container.querySelector('[role="combobox"]');
		expect(combobox).toBeInTheDocument();
	});

	it('has aria-expanded attribute when open', () => {
		const { container } = render(UiAutocomplete, {
			props: {
				options: mockOptions,
				value: 'test',
				isOpen: true
			}
		});

		const combobox = container.querySelector('[aria-expanded="true"]');
		expect(combobox).toBeInTheDocument();
	});

	describe('keyboard navigation', () => {
		it('opens dropdown on ArrowDown when closed', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: false
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });

			// isOpen should become true
			expect(container).toBeInTheDocument();
		});

		it('closes dropdown on Escape key', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'Escape' });

			expect(container).toBeInTheDocument();
		});

		it('navigates down with ArrowDown key', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });

			expect(container).toBeInTheDocument();
		});

		it('navigates up with ArrowUp key', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
			await fireEvent.keyDown(wrapper, { key: 'ArrowUp' });

			expect(container).toBeInTheDocument();
		});

		it('selects option on Enter key when item is selected', async () => {
			const onSelect = vi.fn();

			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true,
					onSelect
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });
			await fireEvent.keyDown(wrapper, { key: 'Enter' });

			expect(onSelect).toHaveBeenCalledWith(mockOptions[0]);
		});

		it('does not select on Enter when no item is selected', async () => {
			const onSelect = vi.fn();

			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true,
					onSelect
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'Enter' });

			expect(onSelect).not.toHaveBeenCalled();
		});

		it('ignores other keys when closed', async () => {
			const onSelect = vi.fn();

			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: false,
					onSelect
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'Enter' });

			expect(onSelect).not.toHaveBeenCalled();
		});
	});

	describe('click outside', () => {
		it('closes dropdown when clicking outside', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true
				}
			});

			await fireEvent.click(document.body);

			expect(container).toBeInTheDocument();
		});
	});

	describe('highlighting', () => {
		it('highlights selected option', async () => {
			const { container } = render(UiAutocomplete, {
				props: {
					options: mockOptions,
					value: 'test',
					isOpen: true
				}
			});

			const wrapper = container.firstChild;
			await fireEvent.keyDown(wrapper, { key: 'ArrowDown' });

			const highlightedOption = container.querySelector('.bg-gray-50');
			expect(highlightedOption).toBeInTheDocument();
		});
	});
});
