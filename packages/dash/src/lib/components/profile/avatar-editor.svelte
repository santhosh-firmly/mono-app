<script>
	import { onDestroy } from 'svelte';
	import Cropper from 'cropperjs';
	// import 'cropperjs/dist/cropper.css';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Upload from 'lucide-svelte/icons/upload';
	import X from 'lucide-svelte/icons/x';
	import Check from 'lucide-svelte/icons/check';
	import RotateCcw from 'lucide-svelte/icons/rotate-ccw';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import ZoomIn from 'lucide-svelte/icons/zoom-in';
	import ZoomOut from 'lucide-svelte/icons/zoom-out';
	import Sun from 'lucide-svelte/icons/sun';
	import Contrast from 'lucide-svelte/icons/contrast';
	import Palette from 'lucide-svelte/icons/palette';

	let { open = $bindable(false), onSave = async () => {} } = $props();

	// State
	let imageElement = $state(null);
	let previewUrl = $state(null);
	let isDragging = $state(false);
	let isSaving = $state(false);
	let error = $state('');

	// Non-reactive cropper instance (not $state to avoid infinite loops)
	let cropper = null;
	// Track last initialized URL to prevent re-initialization
	let lastInitializedUrl = null;

	// Color adjustments (percentages from -50 to 50)
	let brightness = $state(0);
	let contrastValue = $state(0);
	let saturation = $state(0);

	// Computed CSS filter
	let filterStyle = $derived(() => {
		const b = 100 + brightness;
		const c = 100 + contrastValue;
		const s = 100 + saturation;
		return `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
	});

	function resetAdjustments() {
		brightness = 0;
		contrastValue = 0;
		saturation = 0;
	}

	function handleFileSelect(event) {
		const file = event.target.files?.[0];
		if (file) processFile(file);
	}

	function handleDrop(event) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (file) processFile(file);
	}

	function handleDragOver(event) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function processFile(file) {
		error = '';

		// Validate type
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file';
			return;
		}

		// Validate size (2MB)
		if (file.size > 2 * 1024 * 1024) {
			error = 'Image must be less than 2 MB';
			return;
		}

		previewUrl = URL.createObjectURL(file);
		resetAdjustments();
	}

	function initCropper(element) {
		if (cropper) {
			cropper.destroy();
		}

		cropper = new Cropper(element, {
			aspectRatio: 1,
			viewMode: 1,
			dragMode: 'move',
			autoCropArea: 1,
			cropBoxMovable: false,
			cropBoxResizable: false,
			toggleDragModeOnDblclick: false,
			minContainerWidth: 280,
			minContainerHeight: 280,
			ready() {
				// Circular mask via CSS is applied in the container
			}
		});
	}

	function handleZoomIn() {
		cropper?.zoom(0.1);
	}

	function handleZoomOut() {
		cropper?.zoom(-0.1);
	}

	async function handleSave() {
		if (!cropper) return;

		isSaving = true;
		error = '';

		try {
			// Get cropped canvas
			const croppedCanvas = cropper.getCroppedCanvas({
				width: 256,
				height: 256,
				imageSmoothingEnabled: true,
				imageSmoothingQuality: 'high'
			});

			// Apply color adjustments by drawing to a new canvas with filters
			const finalCanvas = document.createElement('canvas');
			finalCanvas.width = 256;
			finalCanvas.height = 256;
			const ctx = finalCanvas.getContext('2d');

			// Apply filter
			ctx.filter = filterStyle();
			ctx.drawImage(croppedCanvas, 0, 0);

			// Convert to WebP blob
			const blob = await new Promise((resolve) => {
				finalCanvas.toBlob(resolve, 'image/webp', 0.9);
			});

			await onSave(blob);
			handleClose();
		} catch (err) {
			error = err.message || 'Failed to save avatar';
		} finally {
			isSaving = false;
		}
	}

	function handleClose() {
		if (cropper) {
			cropper.destroy();
			cropper = null;
		}
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = null;
		lastInitializedUrl = null;
		error = '';
		resetAdjustments();
		open = false;
	}

	// Initialize cropper when image element and URL are ready
	$effect(() => {
		if (imageElement && previewUrl && previewUrl !== lastInitializedUrl) {
			lastInitializedUrl = previewUrl;
			// Use setTimeout to ensure image is fully loaded
			setTimeout(() => {
				if (imageElement) {
					initCropper(imageElement);
				}
			}, 100);
		}
	});

	// Cleanup on unmount
	onDestroy(() => {
		if (cropper) {
			cropper.destroy();
		}
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
	});
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
	<Dialog.Content class="max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit Avatar</Dialog.Title>
			<Dialog.Description>
				Upload and adjust your profile picture. Drag to reposition, use controls to adjust.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-4">
			{#if error}
				<div class="rounded-md bg-red-50 p-3 text-sm text-red-700">
					{error}
				</div>
			{/if}

			{#if !previewUrl}
				<!-- File upload dropzone -->
				<div
					class="relative rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
						? 'border-purple-500 bg-purple-50'
						: 'border-gray-300 hover:border-gray-400'}"
					ondrop={handleDrop}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					role="button"
					tabindex="0"
				>
					<Upload class="mx-auto h-12 w-12 text-gray-400" />
					<p class="mt-2 text-sm text-gray-600">
						Drag and drop an image, or click to select
					</p>
					<p class="mt-1 text-xs text-gray-500">JPEG, PNG, WebP or GIF. Max 2 MB.</p>
					<input
						type="file"
						accept="image/*"
						class="absolute inset-0 cursor-pointer opacity-0"
						onchange={handleFileSelect}
					/>
				</div>
			{:else}
				<!-- Image editor -->
				<div class="space-y-4">
					<!-- Cropper container with circular mask -->
					<div
						class="relative mx-auto h-72 w-72 overflow-hidden rounded-full"
						style="filter: {filterStyle()}"
					>
						<div class="absolute inset-0">
							<img
								bind:this={imageElement}
								src={previewUrl}
								alt="Avatar preview"
								class="block max-w-full"
							/>
						</div>
					</div>

					<!-- Zoom controls -->
					<div class="flex items-center justify-center gap-2">
						<Button variant="outline" size="icon" onclick={handleZoomOut}>
							<ZoomOut class="h-4 w-4" />
						</Button>
						<span class="text-sm text-gray-500">Zoom</span>
						<Button variant="outline" size="icon" onclick={handleZoomIn}>
							<ZoomIn class="h-4 w-4" />
						</Button>
					</div>

					<!-- Color adjustments -->
					<div class="space-y-3 rounded-lg border p-4">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-medium">Color Adjustments</h4>
							<Button variant="ghost" size="sm" onclick={resetAdjustments}>
								<RotateCcw class="mr-1 h-3 w-3" />
								Reset
							</Button>
						</div>

						<!-- Brightness -->
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<Sun class="h-4 w-4 text-gray-500" />
								<Label class="text-xs">Brightness</Label>
								<span class="ml-auto text-xs text-gray-500">{brightness}%</span>
							</div>
							<input
								type="range"
								min="-50"
								max="50"
								bind:value={brightness}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
							/>
						</div>

						<!-- Contrast -->
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<Contrast class="h-4 w-4 text-gray-500" />
								<Label class="text-xs">Contrast</Label>
								<span class="ml-auto text-xs text-gray-500">{contrastValue}%</span>
							</div>
							<input
								type="range"
								min="-50"
								max="50"
								bind:value={contrastValue}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
							/>
						</div>

						<!-- Saturation -->
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<Palette class="h-4 w-4 text-gray-500" />
								<Label class="text-xs">Saturation</Label>
								<span class="ml-auto text-xs text-gray-500">{saturation}%</span>
							</div>
							<input
								type="range"
								min="-50"
								max="50"
								bind:value={saturation}
								class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
							/>
						</div>
					</div>

					<!-- Change image button -->
					<div class="text-center">
						<Button
							variant="link"
							onclick={() => {
								if (previewUrl) URL.revokeObjectURL(previewUrl);
								previewUrl = null;
								if (cropper) {
									cropper.destroy();
									cropper = null;
								}
							}}
						>
							Choose a different image
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={handleClose} disabled={isSaving}>
				<X class="mr-2 h-4 w-4" />
				Cancel
			</Button>
			{#if previewUrl}
				<Button onclick={handleSave} disabled={isSaving}>
					{#if isSaving}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						<Check class="mr-2 h-4 w-4" />
						Save Avatar
					{/if}
				</Button>
			{/if}
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Custom range slider styling */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #7c3aed;
		cursor: pointer;
	}

	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #7c3aed;
		cursor: pointer;
		border: none;
	}

	/* Cropper.js customization for circular crop */
	:global(.cropper-view-box),
	:global(.cropper-face) {
		border-radius: 50%;
	}

	:global(.cropper-view-box) {
		box-shadow: 0 0 0 1px #39f;
		outline: 0;
	}

	:global(.cropper-dashed) {
		display: none;
	}
</style>
