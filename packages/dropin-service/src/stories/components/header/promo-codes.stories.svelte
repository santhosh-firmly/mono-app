<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect } from '@storybook/jest';
    import { userEvent, waitFor, within } from '@storybook/testing-library';

    import PromoCodes from '$lib/components/header/promo-codes.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Header/Promo Codes',
        component: PromoCodes,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <div class="adoreme-dark rounded-lg bg-fy-primary p-8">
        <PromoCodes {...args} />
    </div>
{/snippet}

<Story
    name="Default"
    args={{
        addPromoCodeCallback: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000); // 2000 milliseconds = 2 seconds
            });
        },
        clearPromoCodesCallback: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000); // 2000 milliseconds = 2 seconds
            });
        },
    }}
    children={template}
/>

<Story
    name="Add promo code"
    args={{
        addPromoCodeCallback: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000); // 2000 milliseconds = 2 seconds
            });
        },
        clearPromoCodesCallback: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000); // 2000 milliseconds = 2 seconds
            });
        },
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Insert valid promocode', async () => {
            const addPromoCodeButton = canvas.getByTestId('add-promo-code-button');
            await userEvent.click(addPromoCodeButton);

            let promoCodeInput;

            await waitFor(() => {
                promoCodeInput = canvas.getByTestId('promo-code-input');
                expect(promoCodeInput).toBeInTheDocument();
            });

            await userEvent.keyboard('VALID_PROMO_CODE');

            const applyPromoCodeButton = canvas.getByTestId('apply-promo-code-button');
            await userEvent.click(applyPromoCodeButton);
        });
    }}
    children={template}
/>

<Story
    name="Clear promo codes"
    args={{
        clearPromoCodesCallback: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 1000); // 1000 milliseconds = 1 seconds
            });
        },
        coupons: ['VALID_PROMO_CODE'],
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Remove promo code', async () => {
            await waitFor(() => expect(canvas.getByTestId('remove-promo-codes-button')).toBeInTheDocument(), {
                timeout: 4000,
            });

            const removePromoCodesButton = canvas.getByTestId('remove-promo-codes-button');
            await userEvent.click(removePromoCodesButton);
        });
    }}
    children={template}
/>

<Story
    name="Insert invalid promo code"
    args={{
        addPromoCodeCallback: () => {
            throw Error();
        },
        clearPromoCodesCallback: () => {
            throw Error();
        },
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Insert wrong promocode', async () => {
            const addPromoCodeButton = canvas.getByTestId('add-promo-code-button');
            await userEvent.click(addPromoCodeButton);

            let promoCodeInput;

            await waitFor(() => {
                promoCodeInput = canvas.getByTestId('promo-code-input');
                expect(promoCodeInput).toBeInTheDocument();
            });

            await userEvent.keyboard('WRONG_PROMO_CODE');

            const applyPromoCodeButton = canvas.getByTestId('apply-promo-code-button');
            await userEvent.click(applyPromoCodeButton);

            expect(canvas.getByTestId('promo-code-error')).toBeInTheDocument();
        });
    }}
    children={template}
/>

<Story
    name="Single Promo code applied"
    args={{
        coupons: ['coupon1'],
    }}
    children={template}
/>

<Story
    name="Several Promo codes applied"
    args={{
        coupons: ['coupon1', 'coupon2', 'coupon3', 'coupon4', 'coupon5', 'coupon6', 'coupon7'],
    }}
    children={template}
/>

<Story
    name="Clearing promo codes"
    args={{
        coupons: ['coupon1', 'coupon2', 'coupon3', 'coupon4', 'coupon5', 'coupon6', 'coupon7'],
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Clear promo codes', async () => {
            await waitFor(() => expect(canvas.getByTestId('remove-promo-codes-button')).toBeInTheDocument(), {
                timeout: 4000,
            });

            const removePromoCodesButton = canvas.getByTestId('remove-promo-codes-button');
            await userEvent.click(removePromoCodesButton);
        });
    }}
    children={template}
/>
