<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import HeaderContainer from '$lib/components/header/header-container.svelte';
	import HeaderGoback from '$lib/components/header/header-goback.svelte';

	const { Story } = defineMeta({
		title: 'Components/Header/Container',
		component: HeaderContainer,
		args: {
			itemsQuantity: 1,
			totalPrice: 100,
			className: ''
		}
	});
</script>

{#snippet template(args)}
	<HeaderContainer {...args}>
		{#snippet backButton()}
			<HeaderGoback logoUrl={args.logoUrl} storeName="Storybook" onclick={args.onclick} />
		{/snippet}
		{#snippet summary()}
			<p>Summary will be rendered here!</p>
		{/snippet}
	</HeaderContainer>
{/snippet}

<Story name="Default" children={template} />
