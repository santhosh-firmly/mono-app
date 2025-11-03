<script>
	// @ts-nocheck
	import PoweredByFirmly from './powered-by-firmly.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
</script>

<Meta title="Checkout V4/Checkout/PoweredByFirmly" component={PoweredByFirmly} tags={['autodocs']} />

<Template let:args>
	<PoweredByFirmly {...args} />
</Template>

<Story name="Default" />

<Story name="Below Logo - Centered">
	<div class="flex flex-col items-center gap-1">
		<div class="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-500 text-sm">
			[Logo]
		</div>
		<PoweredByFirmly />
	</div>
</Story>

<Story name="Below Logo - Left Aligned">
	<div class="flex flex-col gap-1">
		<div class="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-500 text-sm">
			[Logo]
		</div>
		<PoweredByFirmly />
	</div>
</Story>

<Story name="Header Example - Compact">
	<div class="bg-white p-4 shadow-sm">
		<div class="flex flex-col items-center gap-1">
			<div class="bg-gray-200 h-10 w-28 rounded flex items-center justify-center text-gray-500 text-xs">
				[Logo]
			</div>
			<PoweredByFirmly />
		</div>
	</div>
</Story>

<Story name="Header Example - With Spacing">
	<div class="bg-white p-6 shadow-sm">
		<div class="flex flex-col items-center gap-2">
			<div class="bg-gray-200 h-12 w-32 rounded flex items-center justify-center text-gray-500 text-sm">
				[Logo]
			</div>
			<PoweredByFirmly />
		</div>
	</div>
</Story>

<Story name="Header Example - Dark Background">
	<div class="bg-gray-900 p-6">
		<div class="flex flex-col items-center gap-2">
			<div class="bg-gray-700 h-12 w-32 rounded flex items-center justify-center text-gray-300 text-sm">
				[Logo]
			</div>
			<div class="text-white">
				<PoweredByFirmly />
			</div>
		</div>
	</div>
</Story>

<Story name="Inline with Logo">
	<div class="flex items-center gap-3">
		<div class="bg-gray-200 h-10 w-24 rounded flex items-center justify-center text-gray-500 text-xs">
			[Logo]
		</div>
		<PoweredByFirmly />
	</div>
</Story>
