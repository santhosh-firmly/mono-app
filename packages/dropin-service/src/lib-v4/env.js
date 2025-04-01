export let PUBLIC_firmly_deployment = '';
export let PUBLIC_cf_server = '';
export let PUBLIC_api_id = '';
export let PUBLIC_use_c2p_api = '';
export let PUBLIC_c2p_dpa_id = '';
export let PUBLIC_c2p_initiator_id = '';
export let PUBLIC_c2p_sdk_url = '';
export let PUBLIC_uc2p_sdk_url = '';
export let PUBLIC_DISABLE_HCAPTCHA = '';

export function handleEnv({ platform }) {
	PUBLIC_firmly_deployment = platform.env.PUBLIC_firmly_deployment;
	PUBLIC_cf_server = platform.env.PUBLIC_cf_server;
	PUBLIC_api_id = platform.env.PUBLIC_api_id;
	PUBLIC_use_c2p_api = platform.env.PUBLIC_use_c2p_api;
	PUBLIC_c2p_dpa_id = platform.env.PUBLIC_c2p_dpa_id;
	PUBLIC_c2p_initiator_id = platform.env.PUBLIC_c2p_initiator_id;
	PUBLIC_c2p_sdk_url = platform.env.PUBLIC_c2p_sdk_url;
	PUBLIC_uc2p_sdk_url = platform.env.PUBLIC_uc2p_sdk_url;
	PUBLIC_DISABLE_HCAPTCHA = platform.env.PUBLIC_DISABLE_HCAPTCHA;
}
