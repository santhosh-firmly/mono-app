<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Monitor from 'lucide-svelte/icons/monitor';
	import { theme } from '$lib/stores/theme.svelte.js';

	let { user } = $props();

	// Avatar URL with cache busting if user has avatar
	let avatarUrl = $derived(
		user?.hasAvatar && user?.id ? `/api/profile/avatar?userId=${user.id}` : null
	);

	const themeOptions = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline" size="icon" class="overflow-hidden rounded-full ">
			<Avatar.Root class="h-6 w-6">
				{#if avatarUrl}
					<Avatar.Image src={avatarUrl} alt={user?.name || 'User'} />
				{/if}
				<Avatar.Fallback class="flex w-full items-center justify-center text-xs">
					{user?.name?.[0] || '?'}
				</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-40" align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm font-medium leading-none">{user?.name}</p>
				<p class="text-xs leading-none text-muted-foreground">{user?.email}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a href="/profile">Profile</a>
				<DropdownMenu.Shortcut>⇧⌘P</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<a href="/settings">Settings</a>
				<DropdownMenu.Shortcut>⌘S</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>
				{#if theme.preference === 'light'}
					<Sun class="mr-2 h-4 w-4" />
				{:else if theme.preference === 'dark'}
					<Moon class="mr-2 h-4 w-4" />
				{:else}
					<Monitor class="mr-2 h-4 w-4" />
				{/if}
				Theme
			</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				{#each themeOptions as option (option.value)}
					<DropdownMenu.Item
						onclick={() => theme.setTheme(option.value)}
						class={theme.preference === option.value ? 'bg-accent' : ''}
					>
						<svelte:component this={option.icon} class="mr-2 h-4 w-4" />
						{option.label}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>
			<a href="/auth/logout">Log out</a>
			<DropdownMenu.Shortcut>⇧⌘Q</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
