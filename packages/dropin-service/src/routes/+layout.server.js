import { handleEnv } from '$lib-v4/env';

export const load = async ({ platform }) => {
	handleEnv({ platform });
};
