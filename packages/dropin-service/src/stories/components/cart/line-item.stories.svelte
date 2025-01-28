<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { http } from 'msw';

    import LineItem from '$lib/components/cart/line-item.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Cart/Line Item',
        component: LineItem,
        tags: ['autodocs'],
    });

    const defaultArgs = {
        description: 'Product Title',
        variantDescription: 'Variant Description',
        quantity: 2,
        editable: false,
        price: {
            currency: 'USD',
            value: 1380.2,
        },
        msrp: {
            currency: 'USD',
            value: 1380.2 / 2,
        },
        image: 'https://picsum.photos/id/96/600/600',
    };
</script>

{#snippet template(args)}
    <div class="w-[400px]">
        <LineItem {...{ ...defaultArgs, ...args }} />
    </div>
{/snippet}

<Story
    name="Portrait Image"
    args={{
        image: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
    }}
    children={template}
/>
<Story
    name="Square Image"
    args={{
        image: 'https://picsum.photos/id/96/600/600',
    }}
    children={template}
/>
<Story
    name="Long texts (Portrait)"
    args={{
        description: 'Super long long product description',
        variantDescription: 'Super long long long long variant description',
        image: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp',
    }}
    children={template}
/>
<Story
    name="Long texts (Square)"
    args={{
        description: 'Super long long product description',
        variantDescription: 'Super long long long long variant description',
        image: 'https://picsum.photos/id/96/600/600',
    }}
    children={template}
/>
<Story
    name="Strike through price"
    args={{
        image: 'https://picsum.photos/id/96/600/600',
        msrp: {
            currency: 'USD',
            value: 2000.3,
        },
    }}
    children={template}
/>
<Story
    name="Loading Image"
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
        image: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg',
    }}
    children={template}
/>
<Story
    name="Image Error"
    args={{
        image: 'https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/invalid.jpeg',
    }}
    children={template}
/>
<Story name="Skeleton">
    <div class="w-[400px]">
        <LineItem />
    </div>
</Story>
<Story
    name="Subscription"
    args={{
        quantity: '1',
        description: 'VIP Membership',
        variantDescription: 'Flexible monthly lingerie membership where you get first access and member-only discounts on exclusive monthly drops.',
        price: {
            currency: 'USD',
            value: 1,
        },
        recurringPeriod: 'monthly',
        allowChangeQuantity: false,
        image: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIiA/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMDgwIDEwODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZGVmcz4KPC9kZWZzPgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMTQ5LDAsMTA2KSI+PC9yZWN0Pgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgyNSAwIDAgMjUgNTQwIDU0MCkiPgo8cGF0aCBzdHlsZT0ic3Ryb2tlOiBub25lOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1kYXNoYXJyYXk6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiBidXR0OyBzdHJva2UtZGFzaG9mZnNldDogMDsgc3Ryb2tlLWxpbmVqb2luOiBtaXRlcjsgc3Ryb2tlLW1pdGVybGltaXQ6IDQ7IGZpbGw6IHJnYigyNTUsMjU1LDI1NSk7IGZpbGwtcnVsZTogbm9uemVybzsgb3BhY2l0eTogMTsiICB0cmFuc2Zvcm09IiB0cmFuc2xhdGUoLTEyLjU2LCAtOC4xKSIgZD0iTSAyMy4xNzI0IDAuMDk5NjA5NCBMIDE4LjM1OTggMTMuMTcwMSBMIDEyLjY5MTMgMC4wOTk2MDk0IEwgMTAuMjE1OCAwLjA5OTYwOTQgTCAxMC4yMTU4IDAuMTc5MjQ4IEMgMTAuNzYzNSAwLjY3ODUyIDExLjI5MjcgMS42Mzg0NyAxMS43NjMyIDIuNjcyNTUgTCAxNy41ODczIDE2LjA5OTYgTCAxNy43OTU1IDE2LjA5OTYgTCAyMy4yMDA2IDEuNzA2NDcgTCAyMy4yMDA2IDE1LjgzNzQgTCAyNS4xMTMxIDE1LjgzNzQgTCAyNS4xMTMxIDAuMDk5NjA5NCBMIDIzLjE3MjQgMC4wOTk2MDk0IFogTSAzLjIxMjUgOS42NTkzIEwgNi4yNjkzOSAyLjYwMDg3IEwgOS4zMzQ4NiA5LjY1OTMgTCAzLjIxMjUgOS42NTkzIFogTSA0Ljc1NjI2IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4xNzkyNDggQyA1LjI4MzEgMC42NDQ4MjcgNS42OTk2NyAxLjM4MzAyIDUuOTkzNzIgMS45OTEzMyBMIDAgMTUuODM3NCBMIDAuNTgzODEyIDE1LjgzNzQgTCAzLjAyOTk0IDEwLjE4ODYgTCA5LjU2MzM3IDEwLjE4ODYgTCAxMi4wMTQ0IDE1LjgzNzQgTCAxNC4wNTYyIDE1LjgzNzQgTCA3LjIzMTc5IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4wOTk2MDk0IFoiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9nPgo8L3N2Zz4K',
    }}
    children={template}
/>
<Story name="No Variant Description">
    <div class="w-[400px]">
        <LineItem {...defaultArgs} variantDescription={null} />
    </div>
</Story>
<Story name="No Border">
    <div class="w-[400px]">
        <LineItem
            {...defaultArgs}
            image="https://cdn11.bigcommerce.com/s-7vhg3hzp/products/5000/images/122265/WOODSKAN1-WAL-VC.TRANQUIL-3__60587.1689373224.285.365.jpg?c=2"
            showImageBorder={false}
        />
    </div>
</Story>
