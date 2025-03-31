// @ts-nocheck

let ordersArray;

export function setOrderInLocalStorage(cart) {
	if (!ordersArray) {
		getAllOrders();
	}
	ordersArray.push(cart);
	localStorage?.setItem?.('fUserOrders', JSON.stringify(ordersArray));
}

export function getAllOrders() {
	if (!ordersArray) {
		const fUserOrders = localStorage?.getItem?.('fUserOrders');
		ordersArray = fUserOrders ? JSON.parse(fUserOrders) : [];
	}
	return ordersArray;
}
