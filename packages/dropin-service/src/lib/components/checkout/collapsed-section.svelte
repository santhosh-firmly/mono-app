<script>
	/**
	 * Collapsed Section Component
	 * Shows a summary of completed form data with an icon button to change
	 * Used to display email, shipping address, shipping method, and payment info
	 * when they are already filled/selected
	 *
	 * When `grouped` is true, the component renders without its own UiGroup wrapper,
	 * allowing it to be used inside a parent UiGroup for continuous styling.
	 *
	 * @param {string} icon - Icon to display: 'edit' for pen icon (email/address), 'switch' for switch icon (methods)
	 */
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';

	/**
	 * @type {{
	 *   children: import('svelte').Snippet,
	 *   onchange?: () => void,
	 *   class?: string,
	 *   grouped?: boolean,
	 *   icon?: 'edit' | 'switch'
	 * }}
	 */
	let {
		children,
		onchange = () => {},
		class: className = '',
		grouped = false,
		icon = 'edit'
	} = $props();

	let iconName = $derived(icon === 'switch' ? 'mdi:swap-horizontal' : 'mdi:pencil');
</script>

{#if grouped}
	<!-- When grouped, render without UiGroup wrapper for use inside a parent UiGroup -->
	<div class={['col-span-2 flex flex-row items-center justify-between bg-white p-4', className]}>
		<div class="w-full">
			{@render children()}
		</div>
		<button
			type="button"
			class="ml-4 flex shrink-0 cursor-pointer items-center justify-center self-start rounded-md border border-gray-300 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
			onclick={onchange}
		>
			<Icon icon={iconName} class="text-base" />
		</button>
	</div>
{:else}
	<!-- Default: render with UiGroup wrapper -->
	<UiGroup class={className}>
		<div class="col-span-2 flex flex-row items-center justify-between p-4">
			<div class="w-full">
				{@render children()}
			</div>
			<button
				type="button"
				class="ml-4 flex shrink-0 cursor-pointer items-center justify-center self-start rounded-md border border-gray-300 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
				onclick={onchange}
			>
				<Icon icon={iconName} class="text-base" />
			</button>
		</div>
	</UiGroup>
{/if}
