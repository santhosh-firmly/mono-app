<script module>
    import Checkbox from '$lib/components/common/checkbox.svelte';
    import { defineMeta } from '@storybook/addon-svelte-csf';

    const title = 'This is the title text.';
    const subtitle = 'This is the subtitle text.';
    const isChecked = true;

    const { Story } = defineMeta({
        title: 'Checkout V4/Common/Checkbox',
        component: Checkbox,
        tags: ['autodocs']
    });
</script>

{#snippet template(args)}
    <Checkbox {...args} />
{/snippet}

<Story name="With Title and Subtitle" args={{ title, subtitle }} children={template} />
<Story name="With only Title" args={{ title }} children={template} />
<Story name="With Checkbox already Checked" args={{ title, subtitle, isChecked }} children={template} />
<Story name="With Title Snippet">
    <Checkbox>
        {#snippet titleSnippet()}
            <span class="text-fy-on-secondary text-sm font-medium text-red-500">This is the title text using snippet.</span>
        {/snippet}
    </Checkbox>
</Story>
