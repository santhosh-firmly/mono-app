<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import Notice from '$lib/components/common/notice.svelte';

    async function undo() {
        return new Promise((resolve) => {
            setTimeout(resolve, 3000);
        });
    }

    const { Story } = defineMeta({
        title: 'Checkout V4/Common/Notice',
        component: Notice,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <Notice {...args}>
        {#snippet icon()}
            <div class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
                <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                </svg>
                <span class="sr-only">Warning icon</span>
            </div>
        {/snippet}
    </Notice>
{/snippet}

<Story
    name="Default"
    args={{
        text: 'Cart has changed. Please review the cart.',
        closeable: true,
    }}
    children={template}
/>

<Story
    name="With Undo"
    args={{
        text: 'Item removed from the cart.',
        undoCallback: undo,
        closeable: true,
    }}
    children={template}
/>

<Story name="Undo in Progress">
    <Notice text="Item removed from the cart." undoCallback={() => {}} closeable={true} undoInProgress={true}></Notice>
</Story>

<Story name="With Custom Image">
    <Notice text="Item removed from the cart." undoCallback={undo} closeable={true}>
        {#snippet icon()}
            <div
                class="relative aspect-square h-8 rounded bg-gray-300 bg-cover shadow"
                style={`background-image: url("https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp");`}
            ></div>
        {/snippet}
    </Notice>
</Story>

<Story name="With Long Text">
    <Notice
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc convallis purus quis aliquet vulputate. Duis nulla turpis, elementum ut augue sit amet, consequat malesuada nisl. Nunc purus nunc, scelerisque eu laoreet id, posuere nec felis. Donec porttitor commodo rutrum. Nullam suscipit lectus lectus, a mollis sapien tempor euismod. Etiam congue iaculis auctor. Vivamus lobortis ut ante nec interdum. Pellentesque finibus arcu ut iaculis suscipit. Donec ante ex, gravida quis fringilla ut, ultrices ut augue."
        undoCallback={undo}
        closeable={true}
    ></Notice>
</Story>

<Story name="With Long Text and image">
    <Notice
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc convallis purus quis aliquet vulputate. Duis nulla turpis, elementum ut augue sit amet, consequat malesuada nisl. Nunc purus nunc, scelerisque eu laoreet id, posuere nec felis. Donec porttitor commodo rutrum. Nullam suscipit lectus lectus, a mollis sapien tempor euismod. Etiam congue iaculis auctor. Vivamus lobortis ut ante nec interdum. Pellentesque finibus arcu ut iaculis suscipit. Donec ante ex, gravida quis fringilla ut, ultrices ut augue."
        undoCallback={undo}
        closeable={true}
    >
        {#snippet icon()}
            <div
                class="relative aspect-square h-8 rounded bg-gray-300 bg-cover shadow"
                style={`background-image: url("https://media-resize.adoreme.com/resize/1360/bundle/10/4/104828/gallery/5jk0zod9o_cinthia-black/full.jpeg?format=webp");`}
            ></div>
        {/snippet}
    </Notice>
</Story>
