// @ts-nocheck

import { within } from '@storybook/test';
import CreditCardForm from './credit-card-form.svelte';
import { userEvent } from '@storybook/test';
import { expect } from '@storybook/test';

export default {
	title: 'Dynamo/Credit Card Form',
	component: CreditCardForm,
	tags: ['autodocs']
};

export const Empty = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Errors', async () => {
			await expect(canvas.getByTestId('cardNumberError')).toBeInTheDocument();
			await expect(canvas.getByTestId('expiryDateError')).toBeInTheDocument();
			await expect(canvas.getByTestId('cvcError')).toBeInTheDocument();
			await expect(canvas.getByTestId('cardNameError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '',
		expiryDate: '',
		cvc: '',
		cardName: ''
	}
};

export const Complete = {
	args: {
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'Tester Test'
	}
};

export const IncompleteCardNumber = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Error', async () => {
			await expect(canvas.getByTestId('cardNumberError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '4111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'Tester Test'
	}
};

export const DateInThePast = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Error', async () => {
			await expect(canvas.getByTestId('expiryDateError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/12',
		cvc: '123',
		cardName: 'Tester Test'
	}
};

export const MissingCVV = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Error', async () => {
			await expect(canvas.getByTestId('cvcError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '',
		cardName: 'Tester Test'
	}
};

export const MissingNameOnCard = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Error', async () => {
			await expect(canvas.getByTestId('cardNameError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: ''
	}
};

export const LessThanMinNameLength = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Submit form', async () => {
			await userEvent.click(canvas.getByRole('button'));
		});

		await step('Validate Error', async () => {
			await expect(canvas.getByTestId('cardNameError')).toBeInTheDocument();
		});
	},
	args: {
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'N'
	}
};

export const Disabled = {
	args: {
		disabled: true,
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'John Smith'
	}
};

export const ShowSpinner = {
	args: {
		showSpinner: true,
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'John Smith'
	}
};

export const CannotPlaceOrder = {
	args: {
		disabled: false,
		canPlaceOrder: false,
		cardNumber: '4111 1111 1111 1111',
		expiryDate: '12/30',
		cvc: '123',
		cardName: 'John Smith'
	}
};
