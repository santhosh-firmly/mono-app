export const load = async ({ platform }) => {
	return {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_firmly_deployment: platform.env.PUBLIC_firmly_deployment,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA,
		PUBLIC_c2p_sdk_url: platform.env.PUBLIC_c2p_sdk_url,
		PUBLIC_c2p_dpa_id: platform.env.PUBLIC_c2p_dpa_id,
		PUBLIC_c2p_initiator_id: platform.env.PUBLIC_c2p_initiator_id,
		PUBLIC_unified_c2p_dpa_id: platform.env.PUBLIC_unified_c2p_dpa_id,
		PUBLIC_unified_c2p_dpa_presentation_name:
			platform.env.PUBLIC_unified_c2p_dpa_presentation_name
	};
};
