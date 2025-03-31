import { writable } from 'svelte/store';

// View Function
export const cTotalViews = 5;
export const sWizardIndex = writable(0);
export const sWizardLast = writable(0);
export const sWizardShipping = writable(false);

export const cViewPayment = 1;
export const cViewShoppay = 2;
export const cViewC2P = 3;
export const cViewShippingAddress = 4;
export const cViewContactShippingAddress = 5;
export const cViewReview = 6;
export const cViewC2PStepUP = 7;
export const cViewOrderPlaced = 8;
export const cViewLogin = 9;

export function wizardReset() {
	sWizardIndex.set(0);
	sWizardLast.set(0);
}

export function wizardNext() {
	sWizardIndex.update((n) => {
		n++;
		if (n > cTotalViews) {
			n = cTotalViews;
		}
		return n;
	});
}

export function wizardBack() {
	sWizardIndex.update((n) => {
		n--;
		if (n < 0) {
			n = 0;
		}
		return n;
	});
}
