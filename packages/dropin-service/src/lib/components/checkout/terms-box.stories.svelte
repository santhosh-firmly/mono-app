<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import TermsBox from './terms-box.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/TermsBox',
		component: TermsBox,
		parameters: {
			layout: 'centered'
		},
		args: {
			partnerName: 'USA Today',
			merchantName: 'Allbirds',
			anchors: [
				{ label: 'USA Today Terms of Service', url: 'https://www.usatoday.com/terms' },
				{
					label: 'USA Today Privacy Policy',
					url: 'https://www.usatoday.com/privacy-policy'
				},
				{
					label: 'Allbirds Terms of Service',
					url: 'https://www.allbirds.com/pages/terms-of-use'
				},
				{
					label: 'Allbirds Privacy Policy',
					url: 'https://www.allbirds.com/pages/privacy-policy'
				}
			]
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80">
		<TermsBox {...args} />
	</div>
{/snippet}

<Story name="Both Partner and Merchant" {template} />

<Story
	name="Merchant Only"
	args={{
		partnerName: '',
		anchors: [
			{
				label: 'Allbirds Terms of Service',
				url: 'https://www.allbirds.com/pages/terms-of-use'
			},
			{
				label: 'Allbirds Privacy Policy',
				url: 'https://www.allbirds.com/pages/privacy-policy'
			}
		]
	}}
	{template}
/>

<Story
	name="No Anchors"
	args={{
		anchors: []
	}}
	{template}
/>
