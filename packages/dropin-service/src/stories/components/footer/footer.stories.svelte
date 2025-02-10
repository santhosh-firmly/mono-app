<script module>
    // @ts-nocheck
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import Footer from '$lib/components/footer/footer.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Footer/Footer',
        tags: ['autodocs'],
        component: Footer,
    });
</script>

{#snippet template(args)}
    <Footer {...args} />
{/snippet}

<Story
    name="Default"
    args={{
        total: {
            currency: 'USD',
            value: 133.33,
        },
    }}
    children={template}
/>

<Story
    name="Zero dollar order"
    args={{
        total: {
            currency: 'USD',
            value: 0,
        },
    }}
    children={template}
/>

<Story
    name="Terms and Privacy Policy notice"
    args={{
        termsOfUse: 'termsOfUse',
        privacyPolicy: 'privacyPolicy',
        total: {
            currency: 'USD',
            value: 0,
        },
    }}
    children={template}
/>
