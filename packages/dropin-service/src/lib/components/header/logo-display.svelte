<script>
    //@ts-nocheck

    /**
     * @typedef {Object} LogoDisplayProps
     * @property {string} merchantLogo - URL of the merchant's logo
     * @property {string} merchantName - Name of the merchant
     */

    /**
     * @type {LogoDisplayProps}
     */
    let { merchantLogo, merchantName } = $props();
</script>

<div>
    {#if merchantLogo}
        <img class="h-4" src={merchantLogo} alt="Merchant logo" />
    {:else}
        {merchantName}
    {/if}
</div>
