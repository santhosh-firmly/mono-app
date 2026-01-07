/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
	// Run tests for stories that have a play function
	tags: {
		include: ['play-fn']
	}
};

module.exports = config;
