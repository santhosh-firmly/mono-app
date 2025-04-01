export const load = async ({ platform }) => {
	return {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server
	};
};
