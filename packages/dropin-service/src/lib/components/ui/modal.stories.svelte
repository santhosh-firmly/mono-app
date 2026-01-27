<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import Modal from '$lib/components/ui/modal.svelte';
	import UiButton from '$lib/components/ui/button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Modal',
		component: Modal,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			show: true,
			loading: false,
			useAbsolutePosition: true
		},
		argTypes: {
			show: {
				control: 'boolean',
				description: 'Whether the modal is visible'
			},
			loading: {
				control: 'boolean',
				description: 'Prevents closing when true'
			},
			useAbsolutePosition: {
				control: 'boolean',
				description: 'Use absolute positioning instead of fixed (for embedded contexts)'
			},
			ariaLabelledby: {
				control: 'text',
				description: 'ID of the element that labels the modal'
			},
			onClose: {
				action: 'closed',
				description: 'Called when modal is closed'
			}
		}
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<div class="relative h-125 w-full bg-gray-100">
			<Modal {...args}>
				<div class="p-6">
					<h2 class="mb-4 text-lg font-semibold">Modal Title</h2>
					<p class="text-gray-600">
						This is the modal content. Click outside or press Escape to close.
					</p>
				</div>
			</Modal>
		</div>
	{/snippet}
</Story>

<Story name="With Form Content">
	{#snippet template(args)}
		<div class="relative h-125 w-full bg-gray-100">
			<Modal {...args} ariaLabelledby="form-modal-title">
				<div class="p-6">
					<h2 id="form-modal-title" class="mb-4 text-lg font-semibold">Confirm CVV</h2>
					<div class="mb-4 flex items-center gap-3">
						<div class="flex size-10 items-center justify-center rounded bg-gray-100">
							<span class="text-xs font-bold">AMEX</span>
						</div>
						<div>
							<p class="font-medium">American Express **** 1234</p>
							<p class="text-sm text-gray-500">Enter CVV to confirm</p>
						</div>
					</div>
					<input
						type="text"
						placeholder="CVV"
						class="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
					/>
					<UiButton class="w-full">Place order</UiButton>
					<button
						type="button"
						class="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700"
					>
						Use a different card
					</button>
				</div>
			</Modal>
		</div>
	{/snippet}
</Story>

<Story name="Loading State" args={{ loading: true }}>
	{#snippet template(args)}
		<div class="relative h-125 w-full bg-gray-100">
			<Modal {...args}>
				<div class="p-6">
					<h2 class="mb-4 text-lg font-semibold">Processing</h2>
					<p class="text-gray-600">Please wait while we process your request...</p>
					<p class="mt-2 text-sm text-gray-400">Modal cannot be closed while loading.</p>
				</div>
			</Modal>
		</div>
	{/snippet}
</Story>

<Story name="Hidden" args={{ show: false }}>
	{#snippet template(args)}
		<div class="relative flex h-125 w-full items-center justify-center bg-gray-100">
			<p class="text-gray-500">Modal is hidden (show: false)</p>
			<Modal {...args}>
				<div class="p-6">
					<h2 class="mb-4 text-lg font-semibold">Hidden Modal</h2>
					<p>This content is not visible.</p>
				</div>
			</Modal>
		</div>
	{/snippet}
</Story>

<Story name="Custom Width">
	{#snippet template(args)}
		<div class="relative h-125 w-full bg-gray-100">
			<Modal {...args} class="max-w-md">
				<div class="p-6">
					<h2 class="mb-4 text-lg font-semibold">Wider Modal</h2>
					<p class="text-gray-600">This modal has a custom max-width class applied.</p>
				</div>
			</Modal>
		</div>
	{/snippet}
</Story>
