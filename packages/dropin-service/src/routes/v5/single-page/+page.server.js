export const load = async ({ platform }) => {
	return {
		apiId: platform.env.PUBLIC_api_id,
		cfServer: platform.env.PUBLIC_cf_server
	};
};
