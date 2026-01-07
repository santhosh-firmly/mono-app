<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PresentationSettings from './presentation-settings.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Presentation Settings',
		component: PresentationSettings,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockMerchant = {
		presentation: {
			theme: {
				colors: {
					primary: '#f8f9fa',
					action: '#007bff'
				},
				largeLogo:
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IndoaXRlIj5Mb2dvPC90ZXh0Pjwvc3ZnPg=='
			},
			privacyPolicy: 'https://example.com/privacy',
			termsOfUse: 'https://example.com/terms'
		}
	};

	const emptyMerchant = {
		presentation: {}
	};
</script>

{#snippet template(args)}
	<PresentationSettings {...args} />
{/snippet}

<Story name="Default" args={{ merchant: mockMerchant }} {template} />

<Story name="Empty Values" args={{ merchant: emptyMerchant }} {template} />

<Story
	name="Dark Theme"
	args={{
		merchant: {
			presentation: {
				theme: {
					colors: {
						primary: '#1a1a2e',
						action: '#e94560'
					}
				}
			}
		}
	}}
	{template}
/>
