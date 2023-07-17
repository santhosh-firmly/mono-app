<script>
    import { Card } from "flowbite-svelte";
</script>

<!-- <Card class="m-8" size="xl"> -->
    <!-- <slot/> -->
<!-- </Card> -->

<div class="bg-white border border-gray-200 rounded-lg shadow-xl dark:border-gray-700 sm:p-6 dark:bg-gray-800 {$$restProps.class || ''}">
    <slot/>
</div>
