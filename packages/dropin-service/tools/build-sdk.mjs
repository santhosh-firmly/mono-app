import { mkdirSync } from 'fs';
import * as esbuild from 'esbuild';

const SDK_SRC = './src/lib-v4/sdk/index.js';
const SDK_OUT = './dist/sdk';

(async () => {
	mkdirSync(SDK_OUT, { recursive: true });

	const result = await esbuild.context({
		entryPoints: [SDK_SRC],
		bundle: true,
		platform: 'browser',
		minify: true,
		keepNames: true,
		plugins: [
			{
				name: 'reload detector',
				setup(build) {
					build.onEnd((result) => {
						console.log(`SDK built with ${result.errors.length} errors`);
					});
				}
			}
		],
		outfile: `${SDK_OUT}/js`
	});

	if (process.argv.includes('--watch')) {
		console.log('Watching for changes on SDK source...');
		await result.watch();
	} else {
		await result.rebuild();
		await result.dispose();
	}
})();
