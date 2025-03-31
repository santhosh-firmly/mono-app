<script>
	// @ts-nocheck

	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import Address from './address.svelte';
	import { userEvent, waitFor, within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';
	import { http } from 'msw';
	import './theme.scss';
	import '$lib-v4/browser/api-firmly';
</script>

<Meta title="Checkout V4/Checkout/Address" component={Address} tags={['autodocs']} />

<Template let:args>
	<Address {...args} />
</Template>

<Story
	name="Empty"
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
				http.get('*/api/v1/domains/undefined/addresses?q=*', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							predictions: [
								{
									id: 'Q2hJSmVSbmp6OWFQdG9jUnJaVVZtT2h5R0VnfHsicXVlcnkiOiI3MzY3IDEyNiIsImNvdW50cnlfY29kZSI6IlVTIiwicGxhY2VfbmFtZSI6IjczNjcgRWFzdCAxMjZ0aCBQbGFjZSBTb3V0aCJ9',
									address: '7367 East 126th Place South, Bixby, OK, USA'
								},
								{
									id: 'RWpBM016WTNJRVZoYzNRZ01USTJkR2dnVTNSeVpXVjBJRTV2Y25Sb0xDQkRiR0Z5WlcxdmNtVXNJRTlMTENCVlUwRWlNUkl2Q2hRS0VnbTVGQ1VzeGtpMmh4RV9RLWJMcHNXR2VSREhPU29VQ2hJSmowbjZjc2xJdG9jUk5JQmQ5NUZXd0M0fHsicXVlcnkiOiI3MzY3IDEyNiIsImNvdW50cnlfY29kZSI6IlVTIiwicGxhY2VfbmFtZSI6IjczNjcgRWFzdCAxMjZ0aCBTdHJlZXQgTm9ydGgifQ==',
									address: '7367 East 126th Street North, Claremore, OK, USA'
								},
								{
									id: 'RWpNM016WTNJRVZoYzNRZ01USTJkR2dnVTNSeVpXVjBJRTV2Y25Sb0xDQkRiMnhzYVc1emRtbHNiR1VzSUU5TExDQlZVMEVpTVJJdkNoUUtFZ2x0UEh1OUtmdTJoeEZxeTFQSHVEWms2aERIT1NvVUNoSUpTVEE2THRYa3RvY1JxTXIxU1BXQllMNHx7InF1ZXJ5IjoiNzM2NyAxMjYiLCJjb3VudHJ5X2NvZGUiOiJVUyIsInBsYWNlX25hbWUiOiI3MzY3IEVhc3QgMTI2dGggU3RyZWV0IE5vcnRoIn0=',
									address: '7367 East 126th Street North, Collinsville, OK, USA'
								},
								{
									id: 'Q2hJSmc3Tzk3Unhwa0ZRUnp2Y3F2ZjEzZFdzfHsicXVlcnkiOiI3MzY3IDEyNiIsImNvdW50cnlfY29kZSI6IlVTIiwicGxhY2VfbmFtZSI6IjczNjcgMTI2dGggUGwgU0UifQ==',
									address: '7367 126th Pl SE, Newcastle, WA, USA'
								},
								{
									id: 'RWlJM016WTNJREV5Tm5Sb0lGTjBjbVZsZEN3Z1UyRjJZV2RsTENCTlRpd2dWVk5CSWpFU0x3b1VDaElKdDllMVdlUTg5b2NSNWd1b2NuNm42TXNReHprcUZBb1NDZG1Zenc2WVBQYUhFWUNrQVFKME53MUt8eyJxdWVyeSI6IjczNjcgMTI2IiwiY291bnRyeV9jb2RlIjoiVVMiLCJwbGFjZV9uYW1lIjoiNzM2NyAxMjZ0aCBTdHJlZXQifQ==',
									address: '7367 126th Street, Savage, MN, USA'
								}
							]
						})
					);
				}),
				http.get('*/api/v1/domains/undefined/addresses/*', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							address1: '7367 East 126th Street North',
							city: 'Collinsville',
							state_or_province: 'OK',
							state_name: 'Oklahoma',
							country: 'United States',
							postal_code: '74021'
						})
					);
				})
			]
		}
	}}
/>
<Story
	name="US Phone Number"
	args={{
		phone: '+14253368875'
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Verify phone flag', async () => {
			await expect(canvas.getByTestId('flag')).toBeInTheDocument();
			await expect(canvas.getByTestId('flag').textContent).toEqual('🇺🇸');
		});
	}}
/>
<Story
	name="Brazilian Phone Number"
	args={{
		phone: '+5535988782143'
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Verify phone flag', async () => {
			await expect(canvas.getByTestId('flag')).toBeInTheDocument();
			await expect(canvas.getByTestId('flag').textContent).toEqual('🇧🇷');
		});
	}}
/>
<Story
	name="Clear Address"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		let clearButton;
		await step('Fill the address information', async () => {
			await userEvent.click(canvas.getByTestId('extend'));
			await userEvent.click(canvas.getByTestId('name'));
			await userEvent.keyboard('John Doe');
			await userEvent.click(canvas.getByTestId('address1'));
			await userEvent.keyboard('One Nice Street');
			clearButton = canvas.getByTestId('clear');
			await expect(clearButton).toBeInTheDocument();
			await userEvent.click(canvas.getByTestId('address2'));
			await userEvent.keyboard('Apt 201');
			await expect(clearButton).toBeInTheDocument();
			await userEvent.tab();
			await userEvent.keyboard('Nice Town');
			await expect(clearButton).toBeInTheDocument();
			await userEvent.tab();
			await userEvent.keyboard('98056');
			await expect(clearButton).toBeInTheDocument();
			await userEvent.tab();
			await userEvent.keyboard('Washington');
			await expect(clearButton).toBeInTheDocument();
			await userEvent.tab();
			await userEvent.keyboard('+15555555555');
		});

		await step('Use the clear button', async () => {
			await userEvent.click(clearButton);
			await expect(clearButton).not.toBeInTheDocument();
		});

		await step('Validate some forms were erased', async () => {
			await expect(canvas.getByTestId('name').value).toEqual('John Doe');
			await expect(canvas.getByTestId('address1').value).toEqual('');
			await expect(canvas.getByTestId('address2').value).toEqual('');
			await expect(canvas.getByTestId('city').value).toEqual('');
			await expect(canvas.getByTestId('postalCode').value).toEqual('');
			await expect(canvas.getByTestId('state').value).toEqual('');
			await expect(canvas.getByTestId('phone').value).toEqual('+1 (555) 555-5555');
		});
	}}
/>
<Story
	name="Phone Formating"
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Phone with no country code', async () => {
			const phoneElement = canvas.getByTestId('phone');
			phoneElement.value = '';
			await waitFor(() => phoneElement.value === '');
			await userEvent.click(phoneElement);
			await userEvent.keyboard('4255551234');
			await expect(phoneElement.value).toEqual('(425) 555-1234');
			await expect(canvas.getByTestId('flag')).toBeInTheDocument();
			await expect(canvas.getByTestId('flag').textContent).toEqual('🇺🇸');
		});

		await step('Phone with US country code', async () => {
			const phoneElement = canvas.getByTestId('phone');
			phoneElement.value = '';
			await waitFor(() => phoneElement.value === '');
			await userEvent.click(phoneElement);
			await userEvent.keyboard('+14255551234');
			await expect(phoneElement.value).toEqual('+1 (425) 555-1234');
			await expect(canvas.getByTestId('flag')).toBeInTheDocument();
			await expect(canvas.getByTestId('flag').textContent).toEqual('🇺🇸');
		});

		await step('Change country codes', async () => {
			const phoneElement = canvas.getByTestId('phone');
			phoneElement.value = '';
			await waitFor(() => phoneElement.value === '');
			await userEvent.click(phoneElement);
			await userEvent.keyboard('+5519123451234');
			await expect(phoneElement.value).toEqual('+55 (19) 12345-1234');
			await expect(canvas.getByTestId('flag')).toBeInTheDocument();
			await expect(canvas.getByTestId('flag').textContent).toEqual('🇧🇷');
		});
	}}
/>

<Story
	name="Without Phone"
	args={{
		optionalFields: {
			shipping_phone: true
		}
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Verify phone is not present', async () => {
			await expect(canvas.queryByTestId('phone')).toBeNull();
		});
	}}
/>
