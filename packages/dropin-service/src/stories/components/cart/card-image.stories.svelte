<script module>
    import CardImage from '$lib/components/cart/card-image.svelte';
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { http } from 'msw';

    const { Story } = defineMeta({
        title: 'Checkout V4/Cart/Card Image',
        component: CardImage,
        tags: ['autodocs']
    });
</script>

{#snippet template(args, parameters)}
    <CardImage {...args} {parameters} } />
{/snippet}

<Story
    name="Portrait"
    args={{
        src: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'
    }}
    children={template}
/>
<Story
    name="Square"
    args={{
        src: 'https://picsum.photos/id/96/600/600'
    }}
    children={template}
/>
<Story
    name="Loading"
    parameters={{
        msw: {
            handlers: [
                http.get('*.jpeg', async (req, res, ctx) => {
                    return res(ctx.delay(1000 * 60 * 60 * 60), ctx.status(404));
                })
            ]
        }
    }}
    args={{
        src: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg'
    }}
    children={template}
/>
<Story
    name="Error"
    args={{
        src: 'invalid-url'
    }}
    children={template}
/>
