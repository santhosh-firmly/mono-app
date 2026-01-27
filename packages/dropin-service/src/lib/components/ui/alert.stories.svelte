<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import UiAlert from '$lib/components/ui/alert.svelte';

	const { Story } = defineMeta({
		title: 'UI/Alert',
		component: UiAlert,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<!-- Default Alert -->
<Story name="Default">This is an informational alert message</Story>

<!-- Alert with Bold Text -->
<Story name="With Bold Text">
	<b>Important:</b> Your payment information is secure and encrypted.
</Story>

<!-- Alert with Raw Content (no p wrapper) -->
<Story name="With Raw Content" raw={true}>
	<span class="relative">
		<span class="inline-block pr-6 leading-normal">
			By entering your email, you consent and direct firmly to send your information to
			<a
				href="https://www.mastercard.com/global/click-to-pay/en-us/privacy-notice.html"
				target="_blank"
				class="font-bold underline"
			>
				Click to Pay
			</a>
			to check if you have any saved cards
		</span>
		<span class="absolute top-0 right-0 z-10 flex flex-row justify-end">
			<button
				type="button"
				aria-label="Show more"
				class="rounded p-1 transition-colors hover:bg-gray-200"
			>
				<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
		</span>
	</span>
</Story>
