<script>
	import { BASE_LOGIN_STEPS } from '$lib/constants';
	import VisaStepUpOptions from './visa-step-up-options.svelte';
	import VisaStepUPOptions from './visa-step-up-options.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

	export const meta = {
		title: 'Checkout V4/Visa Step UP Options',
		component: VisaStepUPOptions
	};
</script>

<Meta
	title="Checkout V4/View Models/Click to Pay Popup"
	component={VisaStepUPOptions}
	tags={['autodocs']}
/>

<Template let:args>
	<div>
		<VisaStepUpOptions {...args} />
	</div>
</Template>

<Story
	name="Selecting Stepup"
	args={{
		currentStep: BASE_LOGIN_STEPS.SELECTING_C2P_STEPUP,
		buttonClasses: 'bg-[#1F3F9A] hover:bg-blue-700 text-white',
		loginProviderName: 'Click to Pay',
		c2pMaskedCard: {
			srcDigitalCardId: '24736a9611f8668b8966102de4da8301',
			panBin: '489537',
			panLastFour: '0523',
			panExpirationMonth: '12',
			panExpirationYear: '2023',
			digitalCardData: {
				status: 'PENDING',
				presentationName: 'mateus paula',
				descriptorName: 'mateus paula',
				artUri:
					'https://sandbox.assets.vims.visa.com/vims/cardart/22af01f2bdf445e497895d502dd1f1ae_imageA@2x.png',
				artHeight: 210,
				artWidth: 334,
				pendingEvents: [
					'PENDING_CARDHOLDER_AUTHENTICATION',
					'PENDING_CONSUMER_IDV',
					'PENDING_CONSUMER_DEVICE_BINDING'
				],
				authenticationMethods: [
					{
						authenticationMethodType: 'SMS_OTP',
						authenticationSubject: 'CARDHOLDER',
						authenticationCredentialReference: '******8080',
						methodAttributes: {
							stepUpIdentifier: 'NjBjNTdmZmRiNjNjOWFjNWU4Y2MxY2E0NGZlYTk2MDI='
						}
					},
					{
						authenticationMethodType: 'EMAIL_OTP',
						authenticationSubject: 'CARDHOLDER',
						authenticationCredentialReference: 'R************N@GMAIL.COM',
						methodAttributes: {
							stepUpIdentifier: 'NWZlMGRiMjIzMTRiZDJmNGE5NWMxOWMyZTMwNGY1MDI='
						}
					},
					{
						authenticationMethodType: 'APP_AUTHENTICATION',
						authenticationSubject: 'CARDHOLDER',
						uriData: {
							uri: 'https%3A%2F%2Fsandbox.secure.checkout.visa.com%2Fcheckout-widget%2Fauth',
							uriType: 'WEB_URI'
						},
						authenticationCredentialReference: 'Verify Online with Bank',
						methodAttributes: {
							stepUpIdentifier: 'ZWY2NTkyZDFiNjZlZTMwZGQyNjg1ZDY3NDY0YTc1MDE=',
							appURL:
								'eyJ0eXAiOiJKT1NFIiwiaWF0IjoxNjk4ODQ0MzQ5LCJhbGciOiJSUzI1NiIsImtpZCI6IjI1NWU2NzZhIn0.Imh0dHBzJTNBJTJGJTJGd3d3LmlzYS5zYW5kYm94LmNvbnN1bWVyYXBpLmRpZ2l0YWwudmlzYS5jb20lMkZpc2ElMkZwcm94eSUyRmQzNmM3Zjg4YzE5NzRhOGU3NGU4MTYyYjY3ODcwZjAyJTNGYTJhcGF5bG9hZCUzRCUyNmlkZW50aWZpZXIlM0RaV1kyTlRreVpERmlOalpsWlRNd1pHUXlOamcxWkRZM05EWTBZVGMxTURFJTNEJTI2d3BjYWxsYmFjayUzRGh0dHBzJTNBJTJGJTJGc2FuZGJveC5zZWN1cmUuY2hlY2tvdXQudmlzYS5jb20lMkZjaGVja291dC13aWRnZXQlMkZhdXRoUmVzcG9uc2Ui.kQiSvV94NrKaMqSsvLN2nDyaxDsOQLx7LGFOxc67L891VbbQmLFJCjUj45AZ8Bce50dU9yRnLHrTPFUUTMlk1cnR2cHhjCk-V8fRaAgo_PitO0V7z40PFalT1kY7IDQmIsRiQl62gpcVdI7VIeTGbIaBUA55S8WdelNnhE5AcHawkSIVgVq9JMx2UgZInbJWz86lBVnbWVzLi4E5ixfRSsP9hTGjJsRrbDikhpXzaFVOoEM0X-MO6Xu2XiaZ4IJGRUpqjRSnk83lT7sgv6EtxklIesSBjLzatwpnGmCIk87DWaUL73_hzySApOO4DFQvi_ijV_iEohe9YkBVuDBNHA'
						}
					}
				]
			}
		}
	}}
/>

<Story
	name="Sending OTP"
	args={{
		currentStep: BASE_LOGIN_STEPS.PROCESSING_C2P_OTP_STEPUP,
		buttonClasses: 'bg-[#1F3F9A] hover:bg-blue-700 text-white',
		spinnerClasses: 'fill-fy-on-action text-gray-400',
		loginProviderName: 'Click to Pay',
		c2pMaskedCard: {
			srcDigitalCardId: '24736a9611f8668b8966102de4da8301',
			panBin: '489537',
			panLastFour: '0523',
			panExpirationMonth: '12',
			panExpirationYear: '2023',
			digitalCardData: {
				status: 'PENDING',
				presentationName: 'mateus paula',
				descriptorName: 'mateus paula',
				artUri:
					'https://sandbox.assets.vims.visa.com/vims/cardart/22af01f2bdf445e497895d502dd1f1ae_imageA@2x.png',
				artHeight: 210,
				artWidth: 334,
				pendingEvents: [
					'PENDING_CARDHOLDER_AUTHENTICATION',
					'PENDING_CONSUMER_IDV',
					'PENDING_CONSUMER_DEVICE_BINDING'
				],
				authenticationMethods: [
					{
						authenticationMethodType: 'SMS_OTP',
						authenticationSubject: 'CARDHOLDER',
						authenticationCredentialReference: '******8080',
						methodAttributes: {
							stepUpIdentifier: 'NjBjNTdmZmRiNjNjOWFjNWU4Y2MxY2E0NGZlYTk2MDI='
						}
					},
					{
						authenticationMethodType: 'EMAIL_OTP',
						authenticationSubject: 'CARDHOLDER',
						authenticationCredentialReference: 'R************N@GMAIL.COM',
						methodAttributes: {
							stepUpIdentifier: 'NWZlMGRiMjIzMTRiZDJmNGE5NWMxOWMyZTMwNGY1MDI='
						}
					},
					{
						authenticationMethodType: 'APP_AUTHENTICATION',
						authenticationSubject: 'CARDHOLDER',
						uriData: {
							uri: 'https%3A%2F%2Fsandbox.secure.checkout.visa.com%2Fcheckout-widget%2Fauth',
							uriType: 'WEB_URI'
						},
						authenticationCredentialReference: 'Verify Online with Bank',
						methodAttributes: {
							stepUpIdentifier: 'ZWY2NTkyZDFiNjZlZTMwZGQyNjg1ZDY3NDY0YTc1MDE=',
							appURL:
								'eyJ0eXAiOiJKT1NFIiwiaWF0IjoxNjk4ODQ0MzQ5LCJhbGciOiJSUzI1NiIsImtpZCI6IjI1NWU2NzZhIn0.Imh0dHBzJTNBJTJGJTJGd3d3LmlzYS5zYW5kYm94LmNvbnN1bWVyYXBpLmRpZ2l0YWwudmlzYS5jb20lMkZpc2ElMkZwcm94eSUyRmQzNmM3Zjg4YzE5NzRhOGU3NGU4MTYyYjY3ODcwZjAyJTNGYTJhcGF5bG9hZCUzRCUyNmlkZW50aWZpZXIlM0RaV1kyTlRreVpERmlOalpsWlRNd1pHUXlOamcxWkRZM05EWTBZVGMxTURFJTNEJTI2d3BjYWxsYmFjayUzRGh0dHBzJTNBJTJGJTJGc2FuZGJveC5zZWN1cmUuY2hlY2tvdXQudmlzYS5jb20lMkZjaGVja291dC13aWRnZXQlMkZhdXRoUmVzcG9uc2Ui.kQiSvV94NrKaMqSsvLN2nDyaxDsOQLx7LGFOxc67L891VbbQmLFJCjUj45AZ8Bce50dU9yRnLHrTPFUUTMlk1cnR2cHhjCk-V8fRaAgo_PitO0V7z40PFalT1kY7IDQmIsRiQl62gpcVdI7VIeTGbIaBUA55S8WdelNnhE5AcHawkSIVgVq9JMx2UgZInbJWz86lBVnbWVzLi4E5ixfRSsP9hTGjJsRrbDikhpXzaFVOoEM0X-MO6Xu2XiaZ4IJGRUpqjRSnk83lT7sgv6EtxklIesSBjLzatwpnGmCIk87DWaUL73_hzySApOO4DFQvi_ijV_iEohe9YkBVuDBNHA'
						}
					}
				]
			}
		}
	}}
/>
