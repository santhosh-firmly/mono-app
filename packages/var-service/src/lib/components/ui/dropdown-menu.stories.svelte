<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DropdownMenu from './dropdown-menu.svelte';

	const { Story } = defineMeta({
		title: 'Components/UI/DropdownMenu',
		component: DropdownMenu,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<DropdownMenu
			items={[
				{ label: 'Profile', onSelect: () => console.log('Profile') },
				{ label: 'Settings', onSelect: () => console.log('Settings') },
				{ label: 'Logout', onSelect: () => console.log('Logout'), destructive: true }
			]}
		>
			{#snippet trigger()}
				<button class="rounded bg-gray-800 px-4 py-2 text-white">Open Menu</button>
			{/snippet}
		</DropdownMenu>
	{/snippet}
</Story>

<Story name="With Separator">
	{#snippet template()}
		<DropdownMenu
			items={[
				{ label: 'Profile', onSelect: () => console.log('Profile') },
				{ label: 'Settings', onSelect: () => console.log('Settings') },
				{ separator: true },
				{ label: 'Logout', onSelect: () => console.log('Logout'), destructive: true }
			]}
		>
			{#snippet trigger()}
				<button class="rounded bg-gray-800 px-4 py-2 text-white">Open Menu</button>
			{/snippet}
		</DropdownMenu>
	{/snippet}
</Story>

<Story name="With Disabled Item">
	{#snippet template()}
		<DropdownMenu
			items={[
				{ label: 'Edit', onSelect: () => console.log('Edit') },
				{ label: 'Delete', onSelect: () => console.log('Delete'), disabled: true },
				{ label: 'Share', onSelect: () => console.log('Share') }
			]}
		>
			{#snippet trigger()}
				<button class="rounded bg-gray-800 px-4 py-2 text-white">Actions</button>
			{/snippet}
		</DropdownMenu>
	{/snippet}
</Story>

<Story name="Align Start">
	{#snippet template()}
		<DropdownMenu
			items={[
				{ label: 'Option 1', onSelect: () => console.log('Option 1') },
				{ label: 'Option 2', onSelect: () => console.log('Option 2') },
				{ label: 'Option 3', onSelect: () => console.log('Option 3') }
			]}
			align="start"
		>
			{#snippet trigger()}
				<button class="rounded bg-gray-800 px-4 py-2 text-white">Align Start</button>
			{/snippet}
		</DropdownMenu>
	{/snippet}
</Story>
