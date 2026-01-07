export async function load({ platform, params }) {
	return {
		dvrServiceUrl: platform.env.DVR_SERVICE_URL,
		id: params.id
	};
}
