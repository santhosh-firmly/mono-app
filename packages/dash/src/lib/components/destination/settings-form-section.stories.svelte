<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SettingsFormSection from './settings-form-section.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Settings from 'lucide-svelte/icons/settings';
	import User from 'lucide-svelte/icons/user';
	import Bell from 'lucide-svelte/icons/bell';
	import Lock from 'lucide-svelte/icons/lock';

	const { Story } = defineMeta({
		title: 'Destination/Settings/Form Section',
		component: SettingsFormSection,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			title: { control: 'text' },
			description: { control: 'text' }
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<SettingsFormSection
			icon={Settings}
			title="General Settings"
			description="Configure your basic settings"
		>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Name</Label>
					<Input id="name" placeholder="Enter name" />
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="Enter email" />
				</div>
			</div>
		</SettingsFormSection>
	{/snippet}
</Story>

<Story name="Without Icon">
	{#snippet template()}
		<SettingsFormSection title="Account Information" description="Update your account details">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input id="username" placeholder="Enter username" />
				</div>
			</div>
		</SettingsFormSection>
	{/snippet}
</Story>

<Story name="Without Description">
	{#snippet template()}
		<SettingsFormSection icon={User} title="Profile">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="bio">Bio</Label>
					<Input id="bio" placeholder="Tell us about yourself" />
				</div>
			</div>
		</SettingsFormSection>
	{/snippet}
</Story>

<Story name="Multiple Sections">
	{#snippet template()}
		<div class="space-y-6">
			<SettingsFormSection
				icon={User}
				title="Profile Settings"
				description="Manage your profile information"
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="display-name">Display Name</Label>
						<Input id="display-name" placeholder="Your display name" />
					</div>
				</div>
			</SettingsFormSection>

			<SettingsFormSection
				icon={Bell}
				title="Notifications"
				description="Configure how you receive notifications"
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="email-notif">Email Notifications</Label>
						<Input id="email-notif" placeholder="notification@example.com" />
					</div>
				</div>
			</SettingsFormSection>

			<SettingsFormSection
				icon={Lock}
				title="Security"
				description="Manage your security preferences"
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input id="password" type="password" placeholder="********" />
					</div>
				</div>
			</SettingsFormSection>
		</div>
	{/snippet}
</Story>
