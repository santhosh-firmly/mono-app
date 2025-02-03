<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { http } from 'msw';

    import CardStack from '$lib/components/cart/card-stack.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Cart/Card Stack',
        component: CardStack,
        tags: ['autodocs'],
        argTypes: {
            horizontalOffsetPx: {
                name: 'Horizontal Offset',
                control: {
                    type: 'range',
                    min: 1,
                    max: 100,
                    step: 1,
                },
            },
            verticalOffsetPx: {
                name: 'Vertical Offset',
                control: {
                    type: 'range',
                    min: 1,
                    max: 100,
                    step: 1,
                },
            },
        },
    });
</script>

{#snippet template(args)}
    <CardStack {...args} />
{/snippet}

<Story
    name="Single Product"
    args={{
        images: ['https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'],
    }}
    children={template}
/>
<Story
    name="Multiple Products"
    args={{
        images: [
            'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
            'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp',
        ],
    }}
    children={template}
/>
<Story
    name="Many Products"
    args={{
        images: [
            'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
            'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrr9en_cinthia-black/full.jpeg?format=webp',
            'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrqxs2_cinthia-black/full.jpeg?format=webp',
        ],
    }}
    children={template}
/>
<Story
    name="Single Product (Square)"
    args={{
        images: ['https://picsum.photos/id/96/600/600'],
    }}
    children={template}
/>
<Story
    name="Multiple Products (Square)"
    args={{
        images: ['https://picsum.photos/id/96/600/600', 'https://picsum.photos/id/111/600/600'],
    }}
/>
<Story
    name="Many Products (Square)"
    args={{
        images: ['https://picsum.photos/id/96/600/600', 'https://picsum.photos/id/111/600/600', 'https://picsum.photos/id/237/600/600'],
    }}
    children={template}
/>
<Story
    name="Multiple Products (Mix)"
    args={{
        images: ['https://picsum.photos/id/96/600/600', 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp'],
    }}
    children={template}
/>
<Story
    name="Multiple Products (alt)"
    args={{
        images: ['https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp', 'https://picsum.photos/id/96/600/600'],
    }}
    children={template}
/>
<Story
    name="Single Product Loading"
    parameters={{
        msw: {
            handlers: [
                http.get('*.jpeg', async (req, res, ctx) => {
                    return res(ctx.delay(1000 * 60 * 60 * 60), ctx.status(404));
                }),
            ],
        },
    }}
    args={{
        images: ['https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg'],
    }}
/>
<Story
    name="Multiple Product Loading"
    parameters={{
        msw: {
            handlers: [
                http.get('*.jpeg', async (req, res, ctx) => {
                    return res(ctx.delay(1000 * 60 * 60 * 60), ctx.status(404));
                }),
            ],
        },
    }}
    args={{
        images: [
            'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full2.jpeg',
            'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg',
        ],
    }}
    children={template}
/>
<Story
    name="Single Product Error"
    args={{
        images: ['invalid-url'],
    }}
    children={template}
/>
<Story
    name="Multiple Product Error"
    args={{
        images: ['invalid-url', 'invalid-url2'],
    }}
    children={template}
/>
<Story
    name="Partial Error"
    args={{
        images: [
            'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
            'invalid-url',
            'https://media-resize.adoreme.com/resize/1360/gallery/2021/6/5rdcrqxs2_cinthia-black/full.jpeg?format=webp',
        ],
    }}
    children={template}
/>
<Story name="Skeleton" children={template} />
