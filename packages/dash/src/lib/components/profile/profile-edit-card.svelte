<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import AvatarEditor from './avatar-editor.svelte';
	import Mail from 'lucide-svelte/icons/mail';
	import Building from 'lucide-svelte/icons/building-2';
	import Briefcase from 'lucide-svelte/icons/briefcase';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import Camera from 'lucide-svelte/icons/camera';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ConfirmationDialog from '$lib/components/ui/confirmation-dialog.svelte';

	let {
		user = {},
		onSave = async () => {},
		onAvatarChange = async () => {},
		isEditing = $bindable(false),
		isSaving = false,
		error = '',
		success = ''
	} = $props();

	// Avatar editor state
	let showAvatarEditor = $state(false);
	let avatarVersion = $state(Date.now());
	// Local state for hasAvatar to ensure reactivity after upload
	let hasAvatarLocal = $state(user?.hasAvatar || false);

	// Computed avatar URL with cache busting
	let avatarUrl = $derived(
		hasAvatarLocal ? `/api/profile/avatar?userId=${user.id}&v=${avatarVersion}` : null
	);

	async function handleAvatarSave(blob) {
		const formData = new FormData();
		formData.append('avatar', blob, 'avatar.webp');

		const response = await fetch('/api/profile/avatar', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const result = await response.json();
			throw new Error(result.message || 'Failed to upload avatar');
		}

		// Update local state to show avatar immediately
		hasAvatarLocal = true;
		avatarVersion = Date.now();
		await onAvatarChange();
	}

	let isRemovingAvatar = $state(false);
	let showRemoveConfirm = $state(false);
	let removeAvatarError = $state('');

	async function handleRemoveAvatarConfirm() {
		isRemovingAvatar = true;
		removeAvatarError = '';

		try {
			const response = await fetch('/api/profile/avatar', {
				method: 'DELETE'
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.message || 'Failed to remove avatar');
			}

			// Update local state to hide avatar immediately
			hasAvatarLocal = false;
			showRemoveConfirm = false;
			await onAvatarChange();
		} catch (err) {
			removeAvatarError = err.message || 'Failed to remove avatar';
		} finally {
			isRemovingAvatar = false;
		}
	}

	let formData = $state({
		name: user?.name || '',
		company: user?.company || '',
		title: user?.title || '',
		location: user?.location || ''
	});

	// Reset form when user changes or editing starts
	$effect(() => {
		if (!isEditing) {
			formData = {
				name: user?.name || '',
				company: user?.company || '',
				title: user?.title || '',
				location: user?.location || ''
			};
		}
	});

	function getInitials(name) {
		if (!name) return '?';
		const trimmed = name.trim();
		if (!trimmed) return '?';
		const parts = trimmed.split(' ').filter((p) => p.length > 0);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return trimmed[0].toUpperCase();
	}

	function startEditing() {
		formData = {
			name: user?.name || '',
			company: user?.company || '',
			title: user?.title || '',
			location: user?.location || ''
		};
		isEditing = true;
	}

	function cancelEditing() {
		formData = {
			name: user?.name || '',
			company: user?.company || '',
			title: user?.title || '',
			location: user?.location || ''
		};
		isEditing = false;
	}

	async function handleSave() {
		await onSave(formData);
	}
</script>

<AvatarEditor bind:open={showAvatarEditor} onSave={handleAvatarSave} currentAvatarUrl={avatarUrl} />

<ConfirmationDialog
	bind:open={showRemoveConfirm}
	title="Remove Avatar"
	description="Are you sure you want to remove your profile picture? Your initials will be displayed instead."
	confirmLabel="Remove Avatar"
	icon={Trash2}
	onConfirm={handleRemoveAvatarConfirm}
	isSubmitting={isRemovingAvatar}
	error={removeAvatarError}
/>

<Card.Root>
	<Card.Header class="pb-2 text-center">
		<div class="mb-4 flex justify-center">
			<div class="group relative">
				{#key hasAvatarLocal}
					<Avatar.Root class="h-24 w-24 border-4 border-white shadow-lg">
						{#if avatarUrl}
							<Avatar.Image src={avatarUrl} alt={user?.name || 'Avatar'} />
						{/if}
						<Avatar.Fallback class="bg-purple-100 text-2xl font-medium text-purple-700">
							{getInitials(isEditing ? formData.name : user?.name)}
						</Avatar.Fallback>
					</Avatar.Root>
				{/key}
				<!-- Change avatar button -->
				<button
					type="button"
					onclick={() => (showAvatarEditor = true)}
					class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-purple-600 text-white shadow-md transition-transform hover:scale-110 hover:bg-purple-700"
					aria-label="Change avatar"
				>
					<Camera class="h-4 w-4" />
				</button>
				<!-- Remove avatar button (only shown when avatar exists) -->
				{#if hasAvatarLocal}
					<button
						type="button"
						onclick={() => (showRemoveConfirm = true)}
						class="absolute bottom-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-md transition-transform hover:scale-110 hover:bg-red-600"
						aria-label="Remove avatar"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				{/if}
			</div>
		</div>
		{#if isEditing}
			<div class="mx-auto max-w-xs">
				<Input
					bind:value={formData.name}
					placeholder="Your name"
					class="text-center text-lg font-semibold"
				/>
			</div>
		{:else}
			<Card.Title class="text-2xl">{user?.name}</Card.Title>
			<Card.Description>{user?.title}</Card.Description>
		{/if}
	</Card.Header>

	<Card.Content class="space-y-4 pt-4">
		{#if error}
			<div class="rounded-md bg-red-50 p-3 text-sm text-red-700">
				{error}
			</div>
		{/if}

		{#if success}
			<div class="rounded-md bg-green-50 p-3 text-sm text-green-700">
				{success}
			</div>
		{/if}

		<div class="divide-y">
			<!-- Email (read-only) -->
			<div class="flex items-center gap-4 py-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
					<Mail class="h-5 w-5 text-gray-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-500">Email</p>
					<p class="text-sm text-gray-900">{user?.email}</p>
				</div>
			</div>

			<!-- Company -->
			<div class="flex items-center gap-4 py-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
					<Building class="h-5 w-5 text-gray-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-500">Company</p>
					{#if isEditing}
						<Input
							bind:value={formData.company}
							placeholder="Company name"
							class="mt-1"
						/>
					{:else}
						<p class="text-sm text-gray-900">{user?.company || '-'}</p>
					{/if}
				</div>
			</div>

			<!-- Title -->
			<div class="flex items-center gap-4 py-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
					<Briefcase class="h-5 w-5 text-gray-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-500">Title</p>
					{#if isEditing}
						<Input bind:value={formData.title} placeholder="Job title" class="mt-1" />
					{:else}
						<p class="text-sm text-gray-900">{user?.title || '-'}</p>
					{/if}
				</div>
			</div>

			<!-- Location -->
			<div class="flex items-center gap-4 py-4">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
					<MapPin class="h-5 w-5 text-gray-600" />
				</div>
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-500">Location</p>
					{#if isEditing}
						<Input
							bind:value={formData.location}
							placeholder="City, Country"
							class="mt-1"
						/>
					{:else}
						<p class="text-sm text-gray-900">{user?.location || '-'}</p>
					{/if}
				</div>
			</div>
		</div>
	</Card.Content>

	<Card.Footer class="flex justify-center gap-3 border-t pt-6">
		{#if isEditing}
			<Button variant="outline" onclick={cancelEditing} disabled={isSaving}>
				<X class="mr-2 h-4 w-4" />
				Cancel
			</Button>
			<Button onclick={handleSave} disabled={isSaving}>
				{#if isSaving}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					<Check class="mr-2 h-4 w-4" />
					Save Changes
				{/if}
			</Button>
		{:else}
			<Button variant="outline" onclick={startEditing}>
				<Pencil class="mr-2 h-4 w-4" />
				Edit Profile
			</Button>
		{/if}
	</Card.Footer>
</Card.Root>
