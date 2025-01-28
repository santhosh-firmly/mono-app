<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import QuantityController from '$lib/components/cart/quantity-controller.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Cart/Quantity Controller',
        component: QuantityController,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <div class="adoreme-dark">
        <QuantityController {...args} />
    </div>
{/snippet}

<Story
    name="Default"
    args={{
        quantity: 2,
    }}
    children={template}
/>

<Story
    name="With Remove Button"
    args={{
        quantity: 1,
    }}
    children={template}
/>

<Story
    name="Disabled"
    args={{
        quantity: 4,
        disabled: true,
    }}
    children={template}
/>
