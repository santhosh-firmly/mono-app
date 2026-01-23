import { isAvailableLanguageTag, setLanguageTag, sourceLanguageTag } from '$lib/paraglide/runtime';
import { error } from '@sveltejs/kit';

export const load = ({ params }) => {
	const lang = params.lang;

	if (lang) {
		if (!isAvailableLanguageTag(lang)) {
			error(404, 'Not found');
		}
		setLanguageTag(lang);
	} else {
		setLanguageTag(sourceLanguageTag);
	}

	return {
		lang: lang || sourceLanguageTag
	};
};
