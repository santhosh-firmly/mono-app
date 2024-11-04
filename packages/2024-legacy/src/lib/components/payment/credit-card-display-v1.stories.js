import CreditCardDisplayV1 from './credit-card-display-v1.svelte';

export default {
	title: 'Dynamo/Credit Card Display V1',
	component: CreditCardDisplayV1,
	tags: ['autodocs']
};

export const VisaCard = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2030',
		cardType: 'Visa',
		isExpired: false,
		showExpiration: true
	}
};

export const VisaCardRedacted = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2030',
		cardType: 'Visa',
		isExpired: false,
		showExpiration: true,
		mustRedactCardNumber: true
	}
};

export const MasterCard = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2030',
		cardType: 'Master',
		isExpired: false,
		showExpiration: true
	}
};

export const MasterCardRedacted = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2030',
		cardType: 'Master',
		isExpired: false,
		showExpiration: true,
		mustRedactCardNumber: true
	}
};

export const ExpiredCard = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2022',
		cardType: 'Visa',
		isExpired: true,
		showExpiration: true
	}
};

export const ExpiredCardHiddenExpiration = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'Name on card',
		cardMonth: '03',
		cardYear: '2022',
		cardType: 'Visa',
		isExpired: true,
		showExpiration: false
	}
};
