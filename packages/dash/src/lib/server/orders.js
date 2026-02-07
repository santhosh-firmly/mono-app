/**
 * Fetch order status from orders-service
 * @param {object} platform - The platform object with env bindings
 * @param {string} orderId - The order ID
 * @param {string} shopId - The shop/merchant domain
 * @param {string} appId - The app/destination ID
 * @returns {Promise<{statusMap: Map<string, string>, refundTotal: object | null} | null>}
 */
export async function fetchOrderStatus(platform, orderId, shopId, appId) {
	// Service bindings only work in Cloudflare Workers runtime
	const ordersService = platform?.env?.ORDERS_SERVICE;
	if (!ordersService || typeof ordersService.fetch !== 'function') {
		console.warn(
			`[fetchOrderStatus] ORDERS_SERVICE binding not available for orderId=${orderId}`
		);
		return null;
	}

	try {
		const response = await ordersService.fetch(
			`https://orders/api/v1/orders/${orderId}/status?store=${shopId}`,
			{ headers: { 'x-firmly-app-id': appId } }
		);

		if (!response.ok) {
			const body = await response.text().catch(() => '');
			console.warn(
				`[fetchOrderStatus] ORDERS_SERVICE returned ${response.status} for orderId=${orderId}: ${body}`
			);
			return null;
		}

		const orderStatus = await response.json();
		if (!orderStatus?.line_items) {
			console.warn(
				`[fetchOrderStatus] Response missing line_items for orderId=${orderId}:`,
				JSON.stringify(orderStatus)
			);
			return null;
		}

		return {
			statusMap: new Map(orderStatus.line_items.map((li) => [li.sku, li.status])),
			refundTotal: orderStatus.refund_total || null
		};
	} catch (e) {
		console.warn(`[fetchOrderStatus] Exception for orderId=${orderId}:`, e);
		return null;
	}
}

/**
 * Enhance order_info with platform status and refund data from orders-service
 * @param {object} orderInfo - The order_info object to enhance (mutated in place)
 * @param {object | null} orderStatusData - The result from fetchOrderStatus
 */
export function enhanceOrderInfo(orderInfo, orderStatusData) {
	if (!orderStatusData) return;

	const { statusMap, refundTotal } = orderStatusData;
	if (statusMap && orderInfo.line_items) {
		orderInfo.line_items = orderInfo.line_items.map((item) => ({
			...item,
			platform_status: statusMap.get(item.sku) || null
		}));
	}
	if (refundTotal?.value > 0) {
		orderInfo.refund_total = refundTotal;
	}
}
