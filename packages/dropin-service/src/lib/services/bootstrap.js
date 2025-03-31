import { telemetrySessionStart } from './telemetry';
import { getApiAccessToken } from './browser-session';

export async function initialize(appId, apiServer, domain = null) {
	if (!window.firmly) {
		window.firmly = {};
	}

	if (window.firmly.appId) {
		return;
	}

	window.firmly.appId = appId;
	window.firmly.apiServer = apiServer;
	window.firmly.telemetryServer = `${apiServer}/api/v1/telemetry`;
	//window.firmly.telemetryServer = "https://u1.ai:3000";
	window.firmly.ccServer = apiServer.replace('api', 'cc');
	window.firmly.domain = domain;

	// // Observers
	// performanceInit();
	// mutationInit();

	// // initialize payment keys
	// paymentInitialize(window.firmly.ccServer);

	// initialize browser session
	await getApiAccessToken();

	if (window.firmly.isNewSessionId) {
		telemetrySessionStart();
	}
}
