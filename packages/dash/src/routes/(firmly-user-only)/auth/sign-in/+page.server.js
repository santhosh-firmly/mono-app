export async function load({ platform }) {
	return {
		azureAdClientId: platform.env.PUBLIC_AZURE_AD_CLIENT_ID,
		azureAdTenantId: platform.env.PUBLIC_AZURE_AD_TENANT_ID,
		azureAdRedirectUrl: platform.env.PUBLIC_AZURE_REDIRECT_URL
	};
}
