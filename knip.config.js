const globalConfig = {
	workspaces: {
		'.': {
			ignoreBinaries: ['check-outdated']
		},
		'packages/*': {
			paths: {
				'$app/*': ['../../node_modules/@sveltejs/kit/src/runtime/app/*']
			},
			ignoreUnresolved: ['\\$dist/.*', '\\$lib/paraglide/.*'],
			ignoreDependencies: ['tailwindcss', 'flowbite']
		}
	}
};

export default {
	workspaces: {
		...globalConfig.workspaces,
		'packages/dropin-service': {
			...globalConfig.workspaces['packages/*'],
			ignore: './src/lib-v4/sdk/*'
		}
	}
};
