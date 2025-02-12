<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import ExistingCreditCard from '$lib/components/checkout/existing-credit-card.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Existing Credit Card',
        component: ExistingCreditCard,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <ExistingCreditCard {...args} />
{/snippet}

<Story
    name="Visa credit card"
    args={{
        number: '4111111111111111',
    }}
    children={template}
/>

<Story
    name="MasterCard credit card"
    args={{
        number: '5105105105105100',
    }}
/>

<Story
    name="American Express credit card"
    args={{
        number: '378282246310005',
    }}
    children={template}
/>

<Story
    name="Valid Visa credit card with bank issuer"
    args={{
        number: '4111111111111111',
        issuer: 'Chase Freedom Flex',
    }}
/>

<Story
    name="Unkown card brand"
    args={{
        number: '6331101999990016',
    }}
    children={template}
/>

<Story
    name="Loading state"
    args={{
        showSkeleton: true,
    }}
    children={template}
/>
