import { i18n } from '$lib/i18n';
import { handleMetrics } from 'foundation/server/frameworks/sveltekit';
import pkg from '../package.json';
import { sequence } from '@sveltejs/kit/hooks';

const handleParaglide = i18n.handle();

export const handle = sequence(
	handleMetrics({
		serviceName: pkg.name,
		version: pkg.version
	}),
	handleParaglide
);
