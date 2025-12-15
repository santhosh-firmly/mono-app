export async function load({ platform }) {
	return {
		dvrServiceUrl: platform.env.DVR_SERVICE_URL
	};
}
