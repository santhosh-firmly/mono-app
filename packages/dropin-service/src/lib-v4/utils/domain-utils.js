export function convertToFirmlyDomain(hostname, apertureBaseDomain) {
	let domain = hostname.replace(/^www\./, '');

	const specialCases = {
		'test.victoriassecret.com': `test-victoriassecret.${apertureBaseDomain}`
	};

	if (specialCases[hostname]) {
		return specialCases[hostname];
	}

	if (domain.endsWith('myshopify.com')) {
		return domain.replace('myshopify.com', apertureBaseDomain);
	}

	const domainParts = domain.split('.');
	if (domainParts.length >= 2) {
		return `${domainParts[0]}.${apertureBaseDomain}`;
	}

	return `${domain}.${apertureBaseDomain}`;
}

export function updateUrlWithFirmlyDomain(urlObj, apertureBaseDomain) {
	const stringUrl = urlObj.toString();
	const firmlyHostname = convertToFirmlyDomain(urlObj.hostname, apertureBaseDomain);
	return new URL(stringUrl.replaceAll(urlObj.hostname, firmlyHostname));
}
