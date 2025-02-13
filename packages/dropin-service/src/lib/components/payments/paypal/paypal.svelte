<script>
    // @ts-nocheck
    import { onMount } from 'svelte';

    import { paypalApprove, paypalStart } from '$lib/browser/api-manager.js';

    /**
     * @typedef {Object} PaypalProps
     * @property {string} merchantId - The merchant ID
     * @property {string} clientId - The client ID
     * @property {string} label - The label
     * @property {string} currency - The currency
     * @property {string} intent - The intent
     * @property {string} integrationVersion - The integration version
     * @property {Function} onPaypalHandler - The handler for the PayPal event
     */
    /**
     * @type {PaypalProps}
     */
    let {
        merchantId = null,
        clientId = '',
        label = 'pay',
        currency = 'USD',
        intent = 'authorize',
        integrationVersion = 'v3',
        onPaypalHandler = () => {},
        class: className = '',
    } = $props();

    let scriptUrl = $state();

    onMount(() => {
        scriptUrl = new URL('https://www.paypal.com/sdk/js');
        scriptUrl.searchParams.set('client-id', clientId);
        if (merchantId) {
            scriptUrl.searchParams.set('merchant-id', merchantId);
        }
        scriptUrl.searchParams.set('commit', 'false');
        scriptUrl.searchParams.set('currency', currency);
        scriptUrl.searchParams.set('disable-funding', 'paylater,card');
        switch (integrationVersion) {
            case 'billing-aggreement-v1':
                scriptUrl.searchParams.set('vault', true);
                scriptUrl.searchParams.set('intent', 'tokenize');
                break;
            case 'v3':
            default:
                scriptUrl.searchParams.set('intent', intent);
                scriptUrl.searchParams.set('components', 'buttons');
                break;
        }
    });

    async function internalStart() {
        window.firmly?.telemetryButtonClick?.('ClickPaypal');
        const ret = await paypalStart();
        if (ret) {
            if (ret.payment_method && ret.payment_method.attributes && ret.payment_method.attributes.paypal_token) {
                return ret.payment_method.attributes.paypal_token;
            }
        }
        return null;
    }

    async function createBillingAgreement() {
        return internalStart();
    }

    async function createOrder() {
        return internalStart();
    }

    async function onApprove(data) {
        const ret = await paypalApprove({ payer_id: data.payerID });
        if (ret) {
            if (onPaypalHandler) {
                onPaypalHandler(ret);
            }
        }
    }

    async function onCancel() {
        console.log('paypal onCancel');
    }

    async function onError(err) {
        console.log('paypal onError:', err);
    }

    function scriptOnLoad() {
        let args = {
            style: {
                color: 'gold',
                shape: 'rect',
                layout: 'horizontal',
                label,
                height: 50,
                maxbuttons: 1,
                tagline: false,
            },
            onApprove: onApprove,
            onCancel: onCancel,
            onError: onError,
        };

        switch (integrationVersion) {
            case 'billing-aggreement-v1':
                args.createBillingAgreement = createBillingAgreement;
                break;
            case 'v3':
            default:
                args.createOrder = createOrder;
                break;
        }

        if (window.paypal) {
            window.paypal.Buttons(args).render('#paypal-button');
        }
    }

    function scriptOnError() {
        console.log('paypal not loaded');
    }
</script>

<svelte:head>
    <script src={scriptUrl} async defer onload={scriptOnLoad} onerror={scriptOnError}></script>
</svelte:head>

<div id="paypal-button" class="flex basis-full justify-center {className}"></div>
