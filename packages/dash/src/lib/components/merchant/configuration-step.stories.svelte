<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ConfigurationStep from './configuration-step.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Onboarding/Configuration Step',
		component: ConfigurationStep,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			index: { control: 'number' },
			copiedSection: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<ConfigurationStep {...args} />
{/snippet}

<Story
	name="Text Only"
	args={{
		step: {
			title: 'Access Control Panel',
			description: 'Log into your CDN control panel and navigate to the security settings.'
		},
		index: 0
	}}
	{template}
/>

<Story
	name="With Code Block"
	args={{
		step: {
			title: 'Configure IP Whitelist',
			description: 'Add the following IP addresses to your allowlist:',
			code: '52.18.123.45\n52.18.123.46\n52.18.123.47\n52.18.123.48',
			copyId: 'ip-whitelist'
		},
		index: 1
	}}
	{template}
/>

<Story
	name="Code Copied State"
	args={{
		step: {
			title: 'Update Configuration',
			description: 'Add this configuration to your settings:',
			code: 'User-Agent: FirmlyCommerce-Bot/1.0\nAction: Allow',
			copyId: 'config-copy'
		},
		index: 2,
		copiedSection: 'config-copy'
	}}
	{template}
/>

<Story name="Multiple Steps">
	<div class="space-y-4">
		<ConfigurationStep
			step={{
				title: 'Access Cloudflare Dashboard',
				description: 'Log into Cloudflare and select your domain from your account.'
			}}
			index={0}
		/>
		<ConfigurationStep
			step={{
				title: 'Create IP Access Rule',
				description: 'Navigate to Security > WAF > Tools > IP Access Rules and add:',
				code: '52.18.123.45 - Action: Allow\n52.18.123.46 - Action: Allow',
				copyId: 'cloudflare-ips'
			}}
			index={1}
		/>
		<ConfigurationStep
			step={{
				title: 'Configure User Agent Rules',
				description: 'Go to Security > WAF > Custom Rules and create a new rule:',
				code: 'Rule Name: Allow Commerce Bot\nField: User Agent\nOperator: equals\nValue: FirmlyCommerce-Bot/1.0',
				copyId: 'cloudflare-agent'
			}}
			index={2}
		/>
		<ConfigurationStep
			step={{
				title: 'Deploy Changes',
				description:
					'Save your configuration and wait for the changes to propagate. This usually takes 5-10 minutes.'
			}}
			index={3}
		/>
	</div>
</Story>
