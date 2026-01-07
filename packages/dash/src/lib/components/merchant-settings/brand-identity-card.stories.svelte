<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BrandIdentityCard from './brand-identity-card.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Settings/Brand Identity Card',
		component: BrandIdentityCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			displayName: { control: 'text' },
			primaryColor: { control: 'color' },
			actionColor: { control: 'color' },
			largeLogo: { control: 'text' },
			disabled: { control: 'boolean' },
			logoProxyUrl: { control: 'text' }
		}
	});
</script>

<script>
	let displayName = $state('Acme Store');
	let primaryColor = $state('#f8f4ff');
	let actionColor = $state('#7c3aed');
	let largeLogo = $state('');

	let emptyDisplayName = $state('');
	let emptyPrimaryColor = $state('#ffffff');
	let emptyActionColor = $state('#000000');
	let emptyLargeLogo = $state('');

	let disabledDisplayName = $state('Read Only Store');
	let disabledPrimaryColor = $state('#fef3c7');
	let disabledActionColor = $state('#d97706');
	let disabledLargeLogo = $state('');

	let withLogoDisplayName = $state("Jerome's Store");
	let withLogoPrimaryColor = $state('#ecfdf5');
	let withLogoActionColor = $state('#059669');
	let withLogoLargeLogo = $state(
		'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="40" fill="%23059669"/%3E%3Ctext x="50" y="60" font-size="30" text-anchor="middle" fill="white"%3EJS%3C/text%3E%3C/svg%3E'
	);
</script>

<Story
	name="Default"
	args={{
		displayName: displayName,
		primaryColor: primaryColor,
		actionColor: actionColor,
		largeLogo: largeLogo,
		disabled: false,
		logoProxyUrl: '/api/logo-proxy'
	}}
>
	{#snippet template(args)}
		<BrandIdentityCard
			bind:displayName
			bind:primaryColor
			bind:actionColor
			bind:largeLogo
			disabled={args.disabled}
			logoProxyUrl={args.logoProxyUrl}
		/>
	{/snippet}
</Story>

<Story name="Empty State">
	{#snippet template()}
		<BrandIdentityCard
			bind:displayName={emptyDisplayName}
			bind:primaryColor={emptyPrimaryColor}
			bind:actionColor={emptyActionColor}
			bind:largeLogo={emptyLargeLogo}
			disabled={false}
			logoProxyUrl="/api/logo-proxy"
		/>
	{/snippet}
</Story>

<Story name="With Logo">
	{#snippet template()}
		<BrandIdentityCard
			bind:displayName={withLogoDisplayName}
			bind:primaryColor={withLogoPrimaryColor}
			bind:actionColor={withLogoActionColor}
			bind:largeLogo={withLogoLargeLogo}
			disabled={false}
			logoProxyUrl="/api/logo-proxy"
		/>
	{/snippet}
</Story>

<Story name="Disabled">
	{#snippet template()}
		<BrandIdentityCard
			bind:displayName={disabledDisplayName}
			bind:primaryColor={disabledPrimaryColor}
			bind:actionColor={disabledActionColor}
			bind:largeLogo={disabledLargeLogo}
			disabled={true}
			logoProxyUrl="/api/logo-proxy"
		/>
	{/snippet}
</Story>
