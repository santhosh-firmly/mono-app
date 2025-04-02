export const load = async ({ platform }) => {
	return {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_firmly_deployment: platform.env.PUBLIC_firmly_deployment,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA
	};
};
