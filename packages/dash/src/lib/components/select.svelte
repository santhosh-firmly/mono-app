<script>
    const options = ['havaianas', 'youngrebelz', 'teddyblake'];
    let isOpen = false;
    let dropDownEl;
    let btnEl;

    const handleClickOutside = (ev) => {
        if (isOpen && dropDownEl && !dropDownEl.contains(event.target) && btnEl && !btnEl.contains(event.target) && !event.defaultPrevented) {
            console.log('clicked outside');
            isOpen = false;
        }
    };
</script>

<svelte:document on:click|capture={handleClickOutside} />

<div class="flex items-center justify-center flex-col p-4">
    <button
        bind:this={btnEl}
        class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        type="button"
        on:click={() => (isOpen = !isOpen)}
    >
        Filter by merchant
        <svg class="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    </button>
    <div class="flex justify-center min-w-full">
        {#if isOpen}
            <!-- Dropdown menu -->
            <div id="dropdown" bind:this={dropDownEl} class="absolute z-10 w-56 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Merchant</h6>
                <ul class="space-y-2 text-sm" aria-labelledby="dropdownDefault">
                    {#each options as option}
                        <li key={option} class="flex items-center">
                            <input
                                id={option}
                                type="checkbox"
                                value=""
                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                            />

                            <label for={option} class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100"> {option} </label>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>
