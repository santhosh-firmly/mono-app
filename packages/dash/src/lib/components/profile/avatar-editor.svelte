<script>
	import { onDestroy, onMount } from 'svelte';
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
	// Cropper class (loaded dynamically to avoid SSR issues)
	let CropperClass = $state(null);
	// Track last initialized URL to prevent re-initialization
	let lastInitializedUrl = null;
	// Container element for cropper
	let cropperContainer = $state(null);

	// Load Cropper.js dynamically on mount (client-side only)
	onMount(async () => {
		const module = await import('cropperjs');
		CropperClass = module.default;
	});

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
		if (!CropperClass) return; // Not loaded yet

		if (cropper) {
			cropper.destroy();
		}

		// Cropper.js v2 uses Web Components with a template
		// For avatar: fixed selection, movable/zoomable image
		cropper = new CropperClass(element, {
			container: cropperContainer,
			template: `
				<cropper-canvas background style="width: 100%; height: 100%;">
					<cropper-image translatable scalable></cropper-image>
					<cropper-shade hidden></cropper-shade>
					<cropper-handle action="move" plain></cropper-handle>
					<cropper-handle action="scale" plain></cropper-handle>
					<cropper-selection
						initial-coverage="0.85"
						aspect-ratio="1"
						outlined
					>
						<cropper-handle action="move" plain></cropper-handle>
					</cropper-selection>
				</cropper-canvas>
			`
		});

		// Center and fit the image after cropper is ready
		requestAnimationFrame(() => {
			const image = cropper?.getCropperImage?.();
			const canvas = cropper?.getCropperCanvas?.();
			if (image && canvas) {
				// Use 'cover' to ensure image fills the entire selection (no blank areas)
				image.$center?.('cover');

				// Save initial transform as valid after a short delay
				setTimeout(() => {
					lastValidTransform = image.$getTransform?.();
				}, 100);

				// Listen for action events to constrain image
				canvas.addEventListener('actionend', () => constrainImageToSelection());
				canvas.addEventListener('action', () => constrainImageToSelection());
			}
		});
	}

	// Store last valid transform to revert if needed
	let lastValidTransform = null;

	// Constrain image so it always covers the selection (no blank areas)
	function constrainImageToSelection() {
		const image = cropper?.getCropperImage?.();
		const selection = cropper?.getCropperSelection?.();

		if (!image || !selection) return;

		const imageRect = image.getBoundingClientRect();
		const selectionRect = selection.getBoundingClientRect();

		// Check if current position is valid (image covers selection)
		const isValid =
			imageRect.left <= selectionRect.left + 2 &&
			imageRect.right >= selectionRect.right - 2 &&
			imageRect.top <= selectionRect.top + 2 &&
			imageRect.bottom >= selectionRect.bottom - 2 &&
			imageRect.width >= selectionRect.width - 2 &&
			imageRect.height >= selectionRect.height - 2;

		if (isValid) {
			// Save current transform as valid
			lastValidTransform = image.$getTransform?.();
		} else if (lastValidTransform) {
			// Revert to last valid transform
			image.$setTransform?.(lastValidTransform);
		} else {
			// No valid transform saved, reset to cover
			image.$center?.('cover');
			lastValidTransform = image.$getTransform?.();
		}
	}

	function handleZoomIn() {
		const image = cropper?.getCropperImage?.();
		if (image?.$scale) {
			// v2: scale the image (1.1 = 10% larger)
			image.$scale(1.1, 1.1);
		}
	}

	function handleZoomOut() {
		const image = cropper?.getCropperImage?.();
		if (image?.$scale) {
			// v2: scale the image (0.9 = 10% smaller)
			image.$scale(0.9, 0.9);
			// Ensure image still covers selection after zoom out
			requestAnimationFrame(() => constrainImageToSelection());
		}
	}

	async function handleSave() {
		if (!cropper) return;

		isSaving = true;
		error = '';

		try {
			let croppedCanvas;

			// Cropper.js v2: use $toCanvas on the selection element
			const selection = cropper.getCropperSelection?.();
			if (selection?.$toCanvas) {
				croppedCanvas = await selection.$toCanvas({
					width: 256,
					height: 256
				});
			} else if (cropper.getCroppedCanvas) {
				// Fallback for v1 API
				croppedCanvas = cropper.getCroppedCanvas({
					width: 256,
					height: 256,
					imageSmoothingEnabled: true,
					imageSmoothingQuality: 'high'
				});
			} else {
				throw new Error('Unable to get cropped canvas');
			}

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
		lastValidTransform = null;
		error = '';
		resetAdjustments();
		open = false;
	}

	// Initialize cropper when image element, container, URL, and CropperClass are ready
	$effect(() => {
		if (
			CropperClass &&
			imageElement &&
			cropperContainer &&
			previewUrl &&
			previewUrl !== lastInitializedUrl
		) {
			lastInitializedUrl = previewUrl;

			const doInit = () => {
				// Small delay to ensure DOM is ready
				setTimeout(() => initCropper(imageElement), 50);
			};

			// Wait for image to be fully loaded
			if (imageElement.complete && imageElement.naturalWidth > 0) {
				doInit();
			} else {
				imageElement.onload = doInit;
			}
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
					<!-- Cropper container -->
					<div
						bind:this={cropperContainer}
						class="cropper-wrapper mx-auto overflow-hidden rounded-lg"
						style="width: 288px; height: 288px; filter: {filterStyle()}"
					>
						<img
							bind:this={imageElement}
							src={previewUrl}
							alt="Avatar preview"
							class="block max-w-full"
							style="opacity: 0; position: absolute;"
						/>
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
								lastValidTransform = null;
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

	/* Cropper.js v2 container */
	.cropper-wrapper {
		background: #1f2937;
		position: relative;
	}

	/* Cropper.js v2 Web Components styling */
	:global(.cropper-wrapper cropper-canvas) {
		display: block;
		width: 288px !important;
		height: 288px !important;
	}

	:global(.cropper-wrapper cropper-image) {
		cursor: move;
	}

	/* Circular selection for avatar */
	:global(.cropper-wrapper cropper-selection) {
		border-radius: 50% !important;
		overflow: hidden;
	}

	/* Hide the grid inside selection for cleaner look */
	:global(.cropper-wrapper cropper-grid) {
		display: none;
	}

	/* Style the crosshair */
	:global(.cropper-wrapper cropper-crosshair) {
		opacity: 0.5;
	}

	/* Selection outline - circular */
	:global(.cropper-wrapper cropper-selection[outlined]::after) {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.8);
		pointer-events: none;
	}
</style>
