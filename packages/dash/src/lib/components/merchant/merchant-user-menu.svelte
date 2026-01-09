<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import User from 'lucide-svelte/icons/user';
	import LogOut from 'lucide-svelte/icons/log-out';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Monitor from 'lucide-svelte/icons/monitor';
	import { theme } from '$lib/stores/theme.svelte.js';

	let { user } = $props();

	// Avatar URL if user has avatar
	let avatarUrl = $derived(
		user?.hasAvatar && user?.id ? `/api/profile/avatar?userId=${user.id}` : null
	);

	function getInitials(name) {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name[0].toUpperCase();
	}

	const themeOptions = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<button
			class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
		>
			<Avatar.Root class="h-9 w-9 border border-border">
				{#if avatarUrl}
					<Avatar.Image src={avatarUrl} alt={user?.name || 'Avatar'} />
				{/if}
				<Avatar.Fallback class="bg-primary/10 text-primary text-sm font-medium">
					{getInitials(user?.name)}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col items-start text-left">
				<span class="text-sm font-medium text-foreground">{user?.name || 'User'}</span>
				<span class="text-xs text-muted-foreground">{user?.email || ''}</span>
			</div>
			<ChevronDown class="h-4 w-4 text-muted-foreground" />
		</button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm font-medium leading-none">{user?.name}</p>
				<p class="text-xs leading-none text-muted-foreground">{user?.email}</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item>
				<a href="/profile" class="flex w-full items-center gap-2">
					<User class="h-4 w-4" />
					Profile
				</a>
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
			<a href="/api/auth/logout" class="flex w-full items-center gap-2 text-red-600">
				<LogOut class="h-4 w-4" />
				Sign out
			</a>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
