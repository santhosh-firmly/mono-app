<script>
	// @ts-nocheck

	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import MerchantLogin from './merchant-login.svelte';
	import { http } from 'msw';
	import { userEvent, waitFor, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';

	import '../theme.scss';
	import FlowSinglePage from '../flow-single-page.svelte';
	import { BASE_LOGIN_STEPS } from '$lib-v4/constants';
</script>

<Meta
	title="Checkout V4/View Models/Merchant Login Popup"
	component={MerchantLogin}
	tags={['autodocs']}
/>

<Template>
	<div class="adoreme-dark h-screen w-full bg-zinc-200">
		<MerchantLogin
			isModalOpen={true}
			merchantName="AdoreMe"
			merchantLogo="https://images.squarespace-cdn.com/content/v1/5ad8abaf697a98936f894da6/1577986279038-O9XM6YZZX3SZZCYHAPE9/AdoreMeLogo-01.png"
		/>
	</div>
</Template>

<Story name="Default">
	<div class="adoreme-dark">
		<FlowSinglePage />
		<MerchantLogin
			isModalOpen={true}
			merchantName="AdoreMe"
			merchantLogo="https://images.squarespace-cdn.com/content/v1/5ad8abaf697a98936f894da6/1577986279038-O9XM6YZZX3SZZCYHAPE9/AdoreMeLogo-01.png"
		/>
	</div>
</Story>

<Story name="Processing Email">
	<div class="adoreme-dark">
		<FlowSinglePage />
		<MerchantLogin
			isModalOpen={true}
			merchantName="AdoreMe"
			currentStep={BASE_LOGIN_STEPS.PROCESSING_EMAIL}
			merchantLogo="https://images.squarespace-cdn.com/content/v1/5ad8abaf697a98936f894da6/1577986279038-O9XM6YZZX3SZZCYHAPE9/AdoreMeLogo-01.png"
		/>
	</div>
</Story>

<Story
	name="Invalid e-mail"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type an invalid email and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@invaliddomain.com');
			await userEvent.click(continueButton);

			await waitFor(() => expect(canvas.getByTestId('email-error')).toBeInTheDocument(), {
				timeout: 4000
			});
			const emailError = canvas.getByTestId('email-error');
			await expect(emailError).toBeInTheDocument();
			await expect(emailError.innerText).toEqual('User not found');
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				http.post('*/session/create-otp', async (req, res, ctx) => {
					return res(
						ctx.status(404),
						ctx.json({ code: 404, error: 'UserNotFound', description: 'User not found' })
					);
				})
			]
		}
	}}
/>

<Story
	name="Invalid OTP"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type valid e-mail and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);
		});

		await step('Type invalid OTP', async () => {
			await waitFor(() => expect(canvas.getByTestId('otp-field-0')).toBeInTheDocument(), {
				timeout: 10000
			});
			const firstOtpField = canvas.getByTestId('otp-field-0');
			await userEvent.click(firstOtpField);
			await waitFor(() => expect(document.activeElement).toBe(firstOtpField));
			await userEvent.paste('123456');

			await waitFor(() => expect(canvas.getByTestId('otp-error')).toBeInTheDocument(), {
				timeout: 10000
			});
			const otpError = canvas.getByTestId('otp-error');
			await expect(otpError).toBeInTheDocument();
			await expect(otpError.innerText).toEqual('The OTP is invalid.');
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				http.post('*/session/create-otp', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({ otp_destination: { emails: ['johnsmith@example.com'] } })
					);
				}),
				http.post('*/session/validate-otp', async (req, res, ctx) => {
					return res(
						ctx.status(401),
						ctx.json({ code: 401, error: 'InvalidOtp', description: 'The OTP is invalid.' })
					);
				})
			]
		}
	}}
/>

<Story
	name="OTP code resent"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type valid e-mail and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);
		});
		await step('Click to resend OTP code', async () => {
			await waitFor(
				() => expect(canvas.getByTestId('alternative-text-button')).toBeInTheDocument(),
				{
					timeout: 10000
				}
			);

			const resendButton = canvas.getByTestId('alternative-text-button');
			await userEvent.click(resendButton);
			await expect(resendButton.innerText).toEqual('Code sent');
			await expect(resendButton.disabled).toBeTruthy();
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				http.post('*/session/create-otp', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({ otp_destination: { emails: ['johnsmith@example.com'] } })
					);
				})
			]
		}
	}}
/>

<Story
	name="Successful login"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Type email and click continue', async () => {
			const emailInput = canvas.getByTestId('email-input-base-login');
			const continueButton = canvas.getAllByRole('button').find((b) => b.type === 'submit');
			emailInput.value = '';
			await waitFor(() => emailInput.value === '');
			await userEvent.click(emailInput);
			await userEvent.keyboard('johnsmith@example.com');
			await userEvent.click(continueButton);
		});

		await step('Type OTP and wait for success', async () => {
			await waitFor(() => expect(canvas.getByTestId('otp-field-0')).toBeInTheDocument(), {
				timeout: 10000
			});
			const firstOtpField = canvas.getByTestId('otp-field-0');
			await userEvent.click(firstOtpField);
			await waitFor(() => expect(document.activeElement).toBe(firstOtpField));
			await userEvent.paste('123456');
		});
	}}
	parameters={{
		msw: {
			handlers: [
				http.post('*/api/v1/browser-session', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							device_created: false,
							access_token: 'dummy-access-token',
							expires_in: 3600,
							expires: 1700290438,
							device_id: '8134c0d0-7b2d-4a9d-a0f6-60509564b610'
						})
					);
				}),
				http.post('*/session/create-otp', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({ otp_destination: { emails: ['johnsmith@example.com'] } })
					);
				}),
				http.post('*/session/validate-otp', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							display_name: 'Adore Me',
							cart_status: 'active',
							platform_id: 'adoreme',
							shop_id: 'adoreme.com',
							cart_id: '8a707644-5810-4d5c-910b-0c6096d11b3a',
							urls: {
								privacy_policy: 'https://www.adoreme.com/privacy-policy'
							}
						})
					);
				})
			]
		}
	}}
/>
