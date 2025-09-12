// @ts-nocheck
import { json } from '@sveltejs/kit';
import sdkSrc from '$dist/sdk/js?raw';

const uuidRegex =
	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/m;

function getAPIServer(hostname) {
	const split = hostname.split('.');
	if (split.length === 3) {
		hostname = `.${split[1]}.${split[2]}`;
	}

	if (hostname === '.lvh.me' || hostname === 'lvh.me') {
		return 'https://api.lvh.me:8899';
		//return 'https://api.firmly.tools';
	} else if (hostname === '.firmly.dev') {
		// Dev.
		return 'https://api.firmly.tools';
	} else if (hostname === '.firmlyuat.com') {
		// UAT.
		return 'https://api.firmly.work';
	} else if (hostname === '.firmly.live') {
		// Prod.
		return 'https://api.firmly.online';
	}

	// Same domain (Dynamo use case).
	return 'https://api' + hostname;
}

export async function GET({ request, platform }) {
	const url = new URL(request.url);
	const appId = url.searchParams.get('appId');
	const isDropIn = url.searchParams.get('isDropIn');
	const dropinUrl = new URL(request.url);
	dropinUrl.pathname = '/single-page';
	dropinUrl.search = '';
	dropinUrl.searchParams.set('_appId', appId);

	if (!appId || !uuidRegex.test(appId)) {
		return json(
			{
				code: 400,
				error: 'ErrorMissingAppId',
				description: 'appId query parameter is missing or invalid.'
			},
			{ status: 400 }
		);
	}

	return new Response(
		sdkSrc
			.replaceAll('#F_APP_ID#', appId)
			.replaceAll('#F_API_SERVER#', getAPIServer(url.hostname))
			.replaceAll('#F_DROP_IN#', isDropIn)
			.replaceAll('#F_DROPIN_URL#', dropinUrl.href)
			.replaceAll('#F_APERTURE_DOMAIN#', platform.env.PUBLIC_aperture_domain),
		{
			headers: {
				'content-type': 'application/javascript',
				'cache-control': 'public, max-age=900, s-maxage=900'
			}
		}
	);
}
