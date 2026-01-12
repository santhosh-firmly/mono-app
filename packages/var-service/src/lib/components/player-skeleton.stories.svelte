<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import PlayerSkeleton from './player-skeleton.svelte';
</script>

<Meta
	title="Components/PlayerSkeleton"
	component={PlayerSkeleton}
	parameters={{
		layout: 'fullscreen',
		backgrounds: {
			default: 'light',
			values: [{ name: 'light', value: '#fafafa' }]
		}
	}}
/>

<Story name="Default">
	<div class="mx-auto max-w-6xl py-16">
		<PlayerSkeleton />
	</div>
</Story>
