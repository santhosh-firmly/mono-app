/**
 * Adapter blueprint definition.
 * Defines the canonical file structure that all merchant adapters follow.
 * Each file has a path, whether it's required (cannot be deleted), and default content.
 * The tests/ directory is excluded — merchants cannot see or edit test files.
 */

const DEFAULT_CONTENT = {
	'index.js': `export * from './lib/session.js';
export * from './lib/cart.js';
export * from './lib/checkout/checkout.js';
export * from './lib/payment.js';
export * from './lib/order.js';
export * from './firmly.config.js';
export * from './lib/checkout/shipping.js';
export * from './lib/catalog.js';
`,

	'firmly.config.js': `export const firmlyConfig = {
    priceCheckSkip: {
        // overwrite priceCheckSkip configs here
    },
    priceCheckStrategies: {
        // overwrite priceCheckStrategies configs here
    },
};
`,

	'lib/cart.js': `import { ErrorInvalidFulfillmentType, ErrorStoreUnavailable } from 'foundation/errors.js';
import { getLogger } from 'foundation/utils/log.js';

import { addLineItemCall, clearCartCall, getInternalCart, updateLineItemCall } from './client.js';
import { mapCart } from './data-transform/data-transform.js';

/**
 * checkPickupAvailability -> Should check if the cart has any pickup in store items
 * @param {json} context
 * @param {json} cart
 */
function checkPickupAvailability(context, cart) {
    const hasPickup = cart?.cartGetQuote ?? cart?.checkoutGetQuote?.items?.some((item) => item.pickUpDay);
    if (hasPickup) {
        context.tracer?.addData?.({
            pickup_in_store: true,
        });
        throw ErrorInvalidFulfillmentType.extend({ description: 'Some cart items have a non supported delivery option selected: pickup in store' });
    }
}

/**
 * Get Cart -> Should retrieve cart information
 * It cannot create a new cart
 */
export async function getCart(context) {
    try {
        const response = await getInternalCart(context);
        checkPickupAvailability(context, response);

        return await mapCart(context, response);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Cart\`).unmappedError(context, 'getCart', 'Failed trying to get cart', e, ErrorStoreUnavailable);
    }
}

/**
 * addLineItem -> Should add a new item named 'productId' with a given 'quantity'
 * It will create a new cart if the session was not transfered
 * @param {json} context
 * @param {string} productId
 * @param {number} quantity
 */
export async function addLineItem(context, productId, quantity) {
    try {
        const response = await addLineItemCall(context, productId, quantity);

        return mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Cart\`).unmappedError(context, 'addLineItem', 'Failed trying to add line item', e, ErrorStoreUnavailable);
    }
}

/**
 * updateLineItem -> Should update new item named 'productId' with a given 'quantity'
 * Cannot add new items
 * @param {json} context
 * @param {string} productId
 * @param {number} quantity
 */
export async function updateLineItem(context, productId, quantity) {
    try {
        const response = await updateLineItemCall(context, productId, quantity);

        return mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Cart\`).unmappedError(context, 'updateLineItem', 'Failed trying to update line item', e, ErrorStoreUnavailable);
    }
}

/**
 * clearCart -> Should remove all items, shipping and coupons from the cart
 * It will create a new cart if that does not exist
 * @param {json} context
 */
export async function clearCart(context) {
    try {
        const response = await clearCartCall(context);

        return mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Cart\`).unmappedError(context, 'clearCart', 'Failed trying to clear cart', e, ErrorStoreUnavailable);
    }
}
`,

	'lib/catalog.js': `import { getCatalogTransformProduct } from './catalog-product-map.js';

/* eslint-disable-next-line no-unused-vars */
async function fetchSiteMapUrl(context, config, robotsUrl) {
    return [\`\${context.shopConfig.base_url}/sitemap.xml\`];
}

export async function getAllProducts(context) {
    return context.allProductsStrategies.robotsStrategy(context, { fetchSiteMapUrl });
}

export async function getProductByHandle(context, handle) {
    const url = context.shopConfig.base_url + '/' + decodeURIComponent(handle);
    return getProductByUrl(context, url);
}

export async function getProductByUrl(context, pdpUrl) {
    const productInfo = await context.pdpStrategies.applicationLoadStrategy(context, { url: pdpUrl.split('?')[0], getCatalogTransformProduct });
    productInfo.pdp_url = pdpUrl;
    return productInfo;
}
`,

	'lib/catalog-product-map.js': `import toCurrency from 'foundation/utils/currency.js';
import { filterObjectBy } from 'foundation/utils/dash.js';

const mapProduct = {
    base_sku_full_path: 'Product.sku',
    title_full_path: 'Product.name',
    handle_full_path: 'Product.url',
    description_full_path: 'Product.description',
    short_description_full_path: null,
    tags_full_path: ['Product.category'],
    product_type_full_path: 'Product.category',
    pdp_url_full_path: 'Product.url',
    images_full_path: 'Product.image',
    product_images_handle_function: function (context, data, images) {
        const imageList = images[0];
        if (!imageList || imageList.length === 0) return [];
        if (Array.isArray(imageList)) {
            return imageList.map((image) => ({ url: image, type: 'default' })) || [];
        }
    },
    properties: {
        vendor_full_path: 'Product.brand.name',
        product_family_full_path: 'Product.category',
    },
    reviews: {
        total_reviews_full_path: 'Product.aggregateRating.reviewCount',
        average_rating_full_path: 'Product.aggregateRating.ratingValue',
        review_list_url_full_path: null,
        review_list_full_path: 'Product.review',
        rating_list_full_path: null,
        rating_list_item_rating_relative_path: null,
        rating_list_item_count_relative_path: null,
        rating_list_item_percentage_relative_path: null,
        review_list_item_reviewer_name_relative_path: 'author.name',
        review_list_item_review_date_relative_path: 'datePublished',
        review_list_item_rating_relative_path: 'reviewRating.ratingValue',
        review_list_item_review_title_relative_path: 'name',
        review_list_item_review_text_relative_path: 'reviewBody',
        review_list_item_verified_purchase_relative_path: null,
        review_list_item_helpful_votes_relative_path: null,
    },
};

export function getCatalogTransformProduct(context, data) {
    const mappedProduct = context.catalogStrategies.mapProductDescription(context, data, mapProduct);
    mappedProduct.variant_option_values = [];
    mappedProduct.handle = new URL(data.pdp_url).pathname.replace('/', '');
    mappedProduct.pdp_url = data.pdp_url;
    mappedProduct.variants = mapProductVariants(context, data, mappedProduct.images);
    mappedProduct.reviews = context.catalogStrategies.mapProductReviews(context, data, mapProduct.reviews);
    return context.catalogStrategies.hydrateProduct(context, mappedProduct);
}

function mapProductVariants(context, data, images) {
    if (!data.Product?.offers) return [];
    const variant = data.Product?.offers[0];
    const currency = variant.priceCurrency ? variant.priceCurrency : null;
    const price = variant.price ? variant.price : null;

    let variantPrice = price;
    let variantMsrp = price;
    let variantCurrency = currency;

    if (variant.priceSpecification) {
        const salePrice = variant.priceSpecification.find((p) => p.priceType === 'https://schema.org/SalePrice');
        const listPrice = variant.priceSpecification.find((p) => p.priceType === 'https://schema.org/ListPrice');

        if (salePrice) {
            variantPrice = salePrice.price;
            variantCurrency = salePrice.priceCurrency;
        }

        if (listPrice) {
            variantMsrp = listPrice.price;
            variantCurrency = listPrice.priceCurrency;
        }
    }

    return [
        filterObjectBy({
            handle: new URL(variant?.url || data.Product.url).pathname.replace('/', ''),
            display_name: data.Product.name,
            title: data.Product.name,
            sku: data.Product.sku,
            available: variant.availability == 'https://schema.org/InStock',
            variant_option_list: [],
            price: filterObjectBy({
                ...toCurrency(variantCurrency, variantPrice),
            }),
            msrp: filterObjectBy({
                ...toCurrency(variantCurrency, variantMsrp),
            }),
            images: images,
        }),
    ];
}
`,

	'lib/client.js': `import { get, post } from 'foundation/clients/http-client.js';

export async function getInternalCart(context) {
    return await get(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-get-cart\`,
    });
}

export async function addLineItemCall(context, productId, quantity) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-add-line-item\`,
        json: { productId, quantity },
    });
}

export async function updateLineItemCall(context, productId, quantity) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-update-line-item\`,
        json: { productId, quantity },
    });
}

export async function clearCartCall(context) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-clear-cart\`,
    });
}

export async function addPromoCodesCall(context, promoCodes) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-add-coupon\`,
        json: { promoCodes },
    });
}

export async function clearPromoCodesCall(context) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-remove-coupon\`,
    });
}

export async function setShippingMethodCall(context, shippingMethod) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-set-shipping-method\`,
        json: { shippingMethod },
    });
}

export async function setShippingInfoCall(context, shippingInfo) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-set-shipping-info\`,
        json: shippingInfo,
    });
}

export async function setBillingInfoCall(context, billingInfo) {
    return await post(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-set-billing-info\`,
        json: billingInfo,
    });
}

export async function getShippingRatesCall(context) {
    return await get(context, \`\${context.shopConfig.base_url}\`, {
        name: \`\${context.shopConfig.platform_id}-get-shipping-rates\`,
    });
}
`,

	'lib/session.js': `import { extractCookies } from 'foundation/clients/cookie-manager.js';
import { ErrorCannotTransferSession, FirmlyError } from 'foundation/errors.js';
import { getLogger } from 'foundation/utils/log.js';

import { getCart } from './cart.js';
import { setCookieJar } from './model/session-state.js';

export const optionalCookies = ['_fbp', '_fbc', 'fr'];
export const requiredCookies = [''];

async function updateSessionState(context, extractedCookies) {
    const sessionState = await context.getSessionState();
    sessionState.clear();
    const domain = new URL(context.shopConfig.base_url).hostname.replace(/^www./m, '');
    setCookieJar(sessionState, {
        [domain]: extractedCookies,
    });
}

/**
 * Session Transfer -> Should retrieve cart information from session information
 * It cannot create a new cart
 * @param {json} context
 * @param {string} handle
 */
export async function sessionTransfer(context, handle, cookies) {
    const extractedCookies = extractCookies(cookies, { required: requiredCookies, optional: optionalCookies });
    await updateSessionState(context, extractedCookies);
    try {
        return await getCart(context);
    } catch (e) {
        if (e instanceof FirmlyError) {
            throw ErrorCannotTransferSession;
        }
        throw getLogger(\`\${context.shopConfig.platform_id}Session\`).unmappedError(context, 'sessionTransfer', 'Failed transferring session', e, ErrorCannotTransferSession);
    }
}
`,

	'lib/order.js': `export async function mapOrder(context, merchantOrderId, billingInfo, thankYouPageUrl, paymentSummary, cart) {
    return {
        ...cart,
        urls: {
            thank_you_page: thankYouPageUrl,
        },
        billing_info: billingInfo,
        payment_summary: paymentSummary,
        platform_order_number: merchantOrderId,
    };
}
`,

	'lib/payment.js': `import { buildCookieHeader } from 'foundation/managers/cookie-manager.js';

export async function getPaymentHandle(context) {
    return {
        psp: context.shopConfig.psp,
        custom_properties: {
            base_url: context.shopConfig.base_url,
            cookie: await buildCookieHeader(context, context.shopConfig.base_url),
        },
    };
}
`,

	'lib/checkout/checkout.js': `import { ErrorStoreUnavailable, ErrorInvalidPromoCode } from 'foundation/errors.js';
import { getLogger } from 'foundation/utils/log.js';

import { addPromoCodesCall, clearPromoCodesCall, setBillingInfoCall } from '../client.js';
import { mapCart } from '../data-transform/data-transform.js';

/**
 * Apply promotion or coupon codes to the cart
 * @param {json} context
 * @param {string[]} promoCodes
 */
export async function addPromoCodes(context, promoCodes) {
    const isMultiplePromoCodes = promoCodes.length > 1;
    let isPromoCodeValid;
    let response;

    try {
        for (const promoCode of promoCodes) {
            try {
                response = await addPromoCodesCall(context, promoCode);
                isPromoCodeValid = true;
            } catch (err) {
                getLogger(\`\${context.shopConfig.platform_id}Checkout\`).error('addPromoCodes', err);
                isPromoCodeValid = false;
            }
        }
        if (!isPromoCodeValid && !isMultiplePromoCodes) {
            throw ErrorInvalidPromoCode;
        }
        return await mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Checkout\`).unmappedError(context, 'addPromoCodes', 'Unmapped error when adding promo code', e, ErrorStoreUnavailable);
    }
}

/**
 * clearPromoCodes -> Remove all promocodes assigned to the current cart
 * @param {json} context
 */
export async function clearPromoCodes(context) {
    try {
        const response = await clearPromoCodesCall(context);

        return await mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Checkout\`).unmappedError(context, 'clearPromoCodes', 'Unmapped error when removing promo code', e, ErrorStoreUnavailable);
    }
}

/**
 * setBillingInfo -> Set given BillingInfo to the cart
 * @param {json} context
 * @param {json} billingInfo
 */
export async function setBillingInfo(context, billingInfo) {
    try {
        const response = await setBillingInfoCall(context, billingInfo);
        return await mapCart(context, response.json);
    } catch (e) {
        throw getLogger(\`\${context.shopConfig.platform_id}Checkout\`).unmappedError(context, 'setBillingInfo', 'Failed trying to set billing info', e, ErrorStoreUnavailable);
    }
}
`,

	'lib/checkout/shipping.js': `import { ErrorStoreUnavailable, ErrorInvalidShippingMethod } from 'foundation/errors.js';
import { getLogger } from 'foundation/utils/log.js';

import { getShippingRatesCall, setShippingInfoCall, setShippingMethodCall } from '../client.js';
import { mapCart } from '../data-transform/data-transform.js';
import { mapShippingRates } from '../data-transform/map-shipping.js';

/**
 * setShippingInfo -> Set given shippingInfo to the cart as the shipping address
 * @param {json} context
 * @param {json} shippingInfo
 */
export async function setShippingInfo(context, shippingInfo) {
    try {
        const response = await setShippingInfoCall(context, shippingInfo);

        return await mapCart(context, response.json);
    } catch (err) {
        throw getLogger(\`\${context.shopConfig.platform_id}Shipping\`).unmappedError(context, 'setShippingInfo', 'Failed trying to set shipping info', err, ErrorStoreUnavailable);
    }
}

/**
 * setShippingMethod -> Set an available shipping rate
 * @param {json} context
 * @param {string} shippingMethod
 */
export async function setShippingMethod(context, shippingMethod) {
    try {
        const response = await setShippingMethodCall(context, shippingMethod);

        return await mapCart(context, response.json);
    } catch (err) {
        if (err?.error?.detail === 'shippingOptionId not found.') {
            throw ErrorInvalidShippingMethod;
        }

        throw getLogger(\`\${context.shopConfig.platform_id}Shipping\`).unmappedError(
            context,
            'setShippingMethod',
            'Failed trying to set shipping method',
            err,
            ErrorStoreUnavailable,
        );
    }
}

export async function getShippingRates(context) {
    try {
        const response = await getShippingRatesCall(context);

        return mapShippingRates(context, response.json);
    } catch (err) {
        throw getLogger(\`\${context.shopConfig.platform_id}Shipping\`).unmappedError(context, 'getShippingRates', 'Failed trying to get shipping rates', err, ErrorStoreUnavailable);
    }
}
`,

	'lib/data-transform/data-transform.js': `import toCurrency from 'foundation/utils/currency.js';
import { filterObjectBy, isEmpty } from 'foundation/utils/dash.js';
import decode from 'foundation/utils/decode.js';

import { getShippingRelatedInformation } from './map-shipping.js';

function _getCurrency(context, price) {
    return toCurrency(context.shopConfig.shop_currency, price ?? 0);
}

function _mapImagesResolutions(url) {
    return {
        url: decode(url),
    };
}

function _mapLineItems(sessionState, items, context) {
    const firmlyLineItems = [];
    let returnValue;
    for (const item of items || []) {
        const variantDescription = [];
        if (item.size) {
            variantDescription.push(\`size: \${item}\`);
        }

        returnValue = {
            platform_line_item_id: item.value,
            line_item_id: sessionState.getLineItemId(item.value),
            sku: item.value,
            base_sku: item.value,
            description: item.value,
            quantity: item.quantity,
            msrp: _getCurrency(context, item.value),
            price: _getCurrency(context, item.value),
            line_price: _getCurrency(context, item.value),
            requires_shipping: true,
            image: _mapImagesResolutions(item.value),
            variant_description: variantDescription.join(', '),
        };

        returnValue = filterObjectBy(returnValue, (x) => !isEmpty(x[1]));
        firmlyLineItems.push(returnValue);
    }
    return firmlyLineItems;
}

function mapCartAmounts(context, cart) {
    return {
        sub_total: _getCurrency(context, cart.Subtotal),
        shipping_total: _getCurrency(context, cart.shipping),
        cart_discount: _getCurrency(context, cart.TotalAdjustment),
        tax: _getCurrency(context, cart.TotalTax),
        total: _getCurrency(context, cart.TotalAmount),
    };
}

export async function mapCart(context, cart) {
    const sessionState = await context.getSessionState();
    const lineItems = _mapLineItems(sessionState, cart, context);
    const result = filterObjectBy(
        {
            line_items: lineItems,
            coupons: cart?.promocode ? [cart.promocode] : undefined,
            ...mapCartAmounts(context, cart),
            ...getShippingRelatedInformation(context, cart),
            payment_method_options: [
                {
                    type: 'CreditCard',
                    wallet: 'user',
                },
                {
                    type: 'PayPal',
                    wallet: 'paypal',
                },
            ],
        },
        (elem) => !isEmpty(elem[1]) || elem[0] === 'line_items',
    );
    return result;
}
`,

	'lib/data-transform/map-shipping.js': `import { getCountryName } from 'foundation/mappings/country.js';
import { getStateName } from 'foundation/mappings/us-states.js';
import toCurrency from 'foundation/utils/currency.js';

function _mapShippingInfo(cart) {
    return {
        email: cart.email,
        first_name: cart.first_name,
        last_name: cart.last_name,
        address1: cart.address1,
        address2: cart.address2 || '',
        city: cart.city,
        state_name: getStateName(cart.state_or_province),
        state_or_province: cart.state_or_province,
        country: getCountryName(cart.country),
        postal_code: cart.postal_code,
        phone: cart.phone,
    };
}

export function mapShippingRates(context, cart) {
    return cart.shipping_method_options.map((option) => _mapShippingMethod(context, option));
}

function _mapShippingMethod(context, cart) {
    return {
        id: cart.shipping_method.id,
        price: toCurrency(context.shopConfig.shop_currency, cart.shipping_method.price.value),
        description: cart.shipping_method.description,
        estimated_delivery: cart.shipping_method.estimated_delivery,
        line_item_id: cart.shipping_method.line_item_id,
        applicable_line_items: cart.shipping_method.applicable_line_items,
        platform_line_item_id: cart.shipping_method.platform_line_item_id,
    };
}

export function getShippingRelatedInformation(context, cart) {
    if (!cart?.shipping_info || !cart?.shipping_method || !cart?.shipping_method_options) {
        return {};
    }

    const shippingRates = mapShippingRates(context, cart);
    const shippingMethod = _mapShippingMethod(context, cart);

    return {
        shipping_info: _mapShippingInfo(cart.shippingDetail),
        shipping_method: shippingMethod,
        shipping_method_options: shippingRates,
    };
}
`,

	'lib/model/session-state.js': `export function setCookieJar(sessionState, cookieJar) {
    sessionState.set('cookieJar', cookieJar);
}
`
};

/**
 * Blueprint file tree definition.
 * Each entry defines: path, isRequired, and the directory structure.
 */
export const BLUEPRINT_FILES = [
	{ path: 'index.js', isRequired: true },
	{ path: 'firmly.config.js', isRequired: true },
	{ path: 'lib/cart.js', isRequired: true },
	{ path: 'lib/catalog.js', isRequired: true },
	{ path: 'lib/catalog-product-map.js', isRequired: false },
	{ path: 'lib/client.js', isRequired: true },
	{ path: 'lib/session.js', isRequired: true },
	{ path: 'lib/order.js', isRequired: true },
	{ path: 'lib/payment.js', isRequired: true },
	{ path: 'lib/checkout/checkout.js', isRequired: true },
	{ path: 'lib/checkout/shipping.js', isRequired: true },
	{ path: 'lib/data-transform/data-transform.js', isRequired: true },
	{ path: 'lib/data-transform/map-shipping.js', isRequired: false },
	{ path: 'lib/model/session-state.js', isRequired: false }
];

/**
 * Get the default content for a blueprint file.
 * @param {string} path - Relative file path
 * @returns {string} Default file content
 */
export function getDefaultContent(path) {
	return DEFAULT_CONTENT[path] || `// ${path}\n`;
}

/**
 * Check if a given file path is a required blueprint file.
 * @param {string} path - Relative file path
 * @returns {boolean}
 */
export function isRequiredFile(path) {
	const entry = BLUEPRINT_FILES.find((f) => f.path === path);
	return entry?.isRequired ?? false;
}

/**
 * Build a hierarchical file tree from a flat list of file entries.
 * @param {Array<{path: string, isRequired: boolean}>} files
 * @returns {Array<import('./types').FileTreeNode>}
 */
export function buildFileTree(files) {
	const root = [];

	for (const file of files) {
		const parts = file.path.split('/');
		let current = root;

		for (let i = 0; i < parts.length; i++) {
			const name = parts[i];
			const isFile = i === parts.length - 1;
			const partialPath = parts.slice(0, i + 1).join('/');

			let existing = current.find((n) => n.name === name);

			if (!existing) {
				existing = {
					name,
					type: isFile ? 'file' : 'directory',
					path: isFile ? file.path : partialPath,
					isRequired: isFile ? file.isRequired : true,
					...(isFile ? {} : { children: [] })
				};
				current.push(existing);
			}

			if (!isFile) {
				current = existing.children;
			}
		}
	}

	sortTree(root);
	return root;
}

/**
 * Sort tree nodes: directories first, then files, alphabetically within each group.
 */
function sortTree(nodes) {
	nodes.sort((a, b) => {
		if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
	for (const node of nodes) {
		if (node.children) sortTree(node.children);
	}
}
