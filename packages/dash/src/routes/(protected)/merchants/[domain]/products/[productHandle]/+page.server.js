/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const resp = await fetch(`https://api.firmly.work/api/v1/domains-products/${params.domain}/${params.productHandle}`);
    return {
        product: await resp.json()
    };
}
