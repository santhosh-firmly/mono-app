<script module>
    import Modal from '$lib/components/common/modal.svelte';
    import { defineMeta } from '@storybook/addon-svelte-csf';

    const { Story } = defineMeta({
        title: 'Checkout V4/Common/Modal',
        component: Modal,
        tags: ['autodocs']
    });
</script>

<Story name="Simple Modal">
    <Modal isModalOpen={true}>
        <div class="p-3">
            <h1>Content</h1>
        </div>
    </Modal>
</Story>
