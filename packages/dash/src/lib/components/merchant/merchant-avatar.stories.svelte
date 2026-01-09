<script context="module">
	import MerchantAvatar from './merchant-avatar.svelte';
	export const meta = {
		title: 'Foundations/Iconography/Merchant Avatar',
		component: MerchantAvatar,
		parameters: {
			layout: 'centered',
			docs: {
				description: {
					component:
						"Displays a merchant's favicon fetched from Google's favicon service. Falls back to a building icon if the favicon cannot be loaded."
				}
			}
		},
		argTypes: {
			domain: {
				control: 'text',
				description: 'The merchant domain to fetch the favicon for'
			},
			size: {
				control: 'select',
				options: ['sm', 'md', 'lg'],
				description: 'Size of the avatar'
			},
			class: {
				control: 'text',
				description: 'Additional CSS classes to apply'
			}
		}
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story name="Default">
	<MerchantAvatar domain="github.com" />
</Story>

<Story name="All Sizes">
	<div class="flex items-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="google.com" size="sm" />
			<span class="text-xs text-gray-500">sm</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="google.com" size="md" />
			<span class="text-xs text-gray-500">md</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="google.com" size="lg" />
			<span class="text-xs text-gray-500">lg</span>
		</div>
	</div>
</Story>

<Story name="Various Domains">
	<div class="flex items-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="github.com" size="lg" />
			<span class="text-xs text-gray-500">github.com</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="stripe.com" size="lg" />
			<span class="text-xs text-gray-500">stripe.com</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="shopify.com" size="lg" />
			<span class="text-xs text-gray-500">shopify.com</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="amazon.com" size="lg" />
			<span class="text-xs text-gray-500">amazon.com</span>
		</div>
	</div>
</Story>

<Story name="Fallback (Invalid Domain)">
	<div class="flex items-center gap-4">
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="invalid-domain-that-does-not-exist.xyz" size="sm" />
			<span class="text-xs text-gray-500">sm</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="invalid-domain-that-does-not-exist.xyz" size="md" />
			<span class="text-xs text-gray-500">md</span>
		</div>
		<div class="flex flex-col items-center gap-2">
			<MerchantAvatar domain="invalid-domain-that-does-not-exist.xyz" size="lg" />
			<span class="text-xs text-gray-500">lg</span>
		</div>
	</div>
</Story>

<Story name="With Custom Class">
	<div class="flex items-center gap-4">
		<MerchantAvatar
			domain="google.com"
			size="lg"
			class="ring-2 ring-purple-500 ring-offset-2"
		/>
		<MerchantAvatar domain="google.com" size="lg" class="shadow-lg" />
		<MerchantAvatar domain="google.com" size="lg" class="border-2 border-gray-200" />
	</div>
</Story>
