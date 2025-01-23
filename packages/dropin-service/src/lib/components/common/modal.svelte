<script>
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    const dispatch = createEventDispatcher();

    let { children, isModalOpen, canCloseModal = true } = $props();

    $effect(() => {
        if (typeof document !== 'undefined') {
            if (isModalOpen) {
                document.body.style.overflow = 'hidden';
                document.body.style.height = '100%';
            } else {
                document.body.style.overflow = 'auto';
                document.body.style.height = 'auto';
            }
        }
    });

    function close() {
        if (canCloseModal) {
            isModalOpen = false;
            dispatch('modalClosed');
        }
    }
</script>

<svelte:window
    on:keydown={(ev) => {
        if (isModalOpen && ev.key === 'Escape') {
            close();
        }
    }}
/>

{#if isModalOpen}
    <div class="fixed left-0 top-0 z-[999] flex h-full w-full flex-col items-center overflow-y-auto backdrop-blur-sm">
        <button
            class="fixed left-0 top-0 h-full w-full cursor-default bg-[#d9d9d9] opacity-20"
            type="button"
            aria-label="Close Modal"
            data-testid="close-modal-button"
            onclick={close}
        ></button>
        <div class="pointer-events-none relative z-[1000] flex min-h-full items-center justify-center py-4" transition:fade={{ duration: 150 }}>
            <div class="pointer-events-auto my-auto overflow-auto rounded-lg border border-[#e0e0e0] bg-fy-surface shadow">
                {@render children?.()}
            </div>
        </div>
    </div>
{/if}
