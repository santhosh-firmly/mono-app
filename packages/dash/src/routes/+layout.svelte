<script>
    import '../app.postcss';
    import { setUserContext } from '../lib/auth';
    import Header from '../lib/layouts/Header.svelte';
    import Sidebar from '../lib/layouts/Sidebar.svelte';
    export let data;
    const user = data.authInfo;

    setUserContext(user);
</script>

<div class="h-screen flex flex-col">
    <Header />
    <div class="flex flex-row grow basis-full">
        {#if !!user}
            <Sidebar />
        {/if}
        <main class="primary-container grow basis-full flex">
            <slot />
        </main>
    </div>
</div>

<style>
    .primary-container {
        margin-top: 70px;
    }
</style>