<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import ShippingAddress from '$lib/components/checkout/shipping-address.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Shipping Address',
        component: ShippingAddress,
        tags: ['autodocs'],
    });

    const name = 'John Doe';
    const savedAddresses = [
        {
            first_name: 'testing',
            last_name: 'mock',
            phone: '1234567891',
            address1: '1 microsoft way',
            address2: '',
            city: 'redmond',
            state_or_province: 'wa',
            country: 'us',
            postal_code: '98052',
            email: 'john@doe.com',
        },
        {
            first_name: 'john',
            last_name: 'doe',
            phone: '2222222222',
            address1: 'address test',
            address2: '2',
            city: 'San Francisco',
            state_or_province: 'CA',
            country: 'us',
            postal_code: '11111',
            email: 'john@doe.com',
        },
        {
            first_name: 'mock',
            last_name: 'mocking',
            phone: '+123 (45) 123-456',
            address1: 'my address',
            address2: '',
            city: 'Los Angeles',
            state_or_province: 'CA',
            country: 'us',
            postal_code: '22222',
            email: 'mock@mocking.com',
        },
    ];

    const oneAddress = [
        {
            first_name: 'mateus',
            last_name: 'teste',
            phone: '1234567891',
            address1: '1 microsoft way',
            address2: '',
            city: 'redmond',
            state_or_province: 'wa',
            country: 'us',
            postal_code: '98052',
            email: 'mateus@firmly.ai',
        },
    ];

    const addressWithoutPhone = [
        {
            first_name: 'Frodo',
            last_name: 'Baggins',
            address1: '1 microsoft way',
            address2: '',
            city: 'redmond',
            state_or_province: 'wa',
            country: 'us',
            postal_code: '98052',
            email: 'frodo@firmly.ai',
        },
    ];
</script>

{#snippet template(args)}
    <ShippingAddress {...args} />
{/snippet}

<Story name="One saved address" args={{ savedAddresses: oneAddress, headerDisplay: 'email' }} children={template} />

<Story name="Multi addresses" args={{ savedAddresses, subheaderName: name }} children={template} />

<Story name="Multi addresses header with name" args={{ savedAddresses, headerDisplay: 'name' }} children={template} />

<Story name="Address without phone" args={{ savedAddresses: addressWithoutPhone, headerDisplay: 'name' }} children={template} />

<Story name="No address" children={template} />
