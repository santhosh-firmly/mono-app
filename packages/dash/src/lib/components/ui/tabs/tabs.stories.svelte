<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, userEvent, within } from '@storybook/test';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs/index.js';
	import User from 'lucide-svelte/icons/user';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import Settings from 'lucide-svelte/icons/settings';
	import Bell from 'lucide-svelte/icons/bell';

	const { Story } = defineMeta({
		title: 'Navigation/Tabs',
		component: Tabs,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<Story name="Default">
	{#snippet template()}
		<Tabs value="account" class="w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<div class="p-4 text-sm text-muted-foreground">
					Make changes to your account here. Click save when you're done.
				</div>
			</TabsContent>
			<TabsContent value="password">
				<div class="p-4 text-sm text-muted-foreground">
					Change your password here. After saving, you'll be logged out.
				</div>
			</TabsContent>
			<TabsContent value="settings">
				<div class="p-4 text-sm text-muted-foreground">
					Manage your account settings and preferences.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story name="Two Tabs">
	{#snippet template()}
		<Tabs value="overview" class="w-[400px]">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="analytics">Analytics</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<div class="p-4 text-sm text-muted-foreground">
					View your dashboard overview and key metrics at a glance.
				</div>
			</TabsContent>
			<TabsContent value="analytics">
				<div class="p-4 text-sm text-muted-foreground">
					Deep dive into your analytics data and performance insights.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story name="Three Tabs">
	{#snippet template()}
		<Tabs value="profile" class="w-[400px]">
			<TabsList>
				<TabsTrigger value="profile">Profile</TabsTrigger>
				<TabsTrigger value="billing">Billing</TabsTrigger>
				<TabsTrigger value="notifications">Notifications</TabsTrigger>
			</TabsList>
			<TabsContent value="profile">
				<div class="p-4 text-sm text-muted-foreground">
					Update your profile information and personal details.
				</div>
			</TabsContent>
			<TabsContent value="billing">
				<div class="p-4 text-sm text-muted-foreground">
					Manage your billing information and payment methods.
				</div>
			</TabsContent>
			<TabsContent value="notifications">
				<div class="p-4 text-sm text-muted-foreground">
					Configure your notification preferences and alerts.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story name="Four Tabs">
	{#snippet template()}
		<Tabs value="general" class="w-[500px]">
			<TabsList>
				<TabsTrigger value="general">General</TabsTrigger>
				<TabsTrigger value="security">Security</TabsTrigger>
				<TabsTrigger value="integrations">Integrations</TabsTrigger>
				<TabsTrigger value="advanced">Advanced</TabsTrigger>
			</TabsList>
			<TabsContent value="general">
				<div class="p-4 text-sm text-muted-foreground">
					General settings for your application and workspace.
				</div>
			</TabsContent>
			<TabsContent value="security">
				<div class="p-4 text-sm text-muted-foreground">
					Security settings including two-factor authentication and sessions.
				</div>
			</TabsContent>
			<TabsContent value="integrations">
				<div class="p-4 text-sm text-muted-foreground">
					Connect and manage third-party integrations.
				</div>
			</TabsContent>
			<TabsContent value="advanced">
				<div class="p-4 text-sm text-muted-foreground">
					Advanced configuration options for power users.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story name="With Icons">
	{#snippet template()}
		<Tabs value="account" class="w-[500px]">
			<TabsList>
				<TabsTrigger value="account" class="gap-2">
					<User class="h-4 w-4" />
					Account
				</TabsTrigger>
				<TabsTrigger value="billing" class="gap-2">
					<CreditCard class="h-4 w-4" />
					Billing
				</TabsTrigger>
				<TabsTrigger value="settings" class="gap-2">
					<Settings class="h-4 w-4" />
					Settings
				</TabsTrigger>
				<TabsTrigger value="notifications" class="gap-2">
					<Bell class="h-4 w-4" />
					Notifications
				</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<div class="p-4 text-sm text-muted-foreground">
					Manage your account details and personal information.
				</div>
			</TabsContent>
			<TabsContent value="billing">
				<div class="p-4 text-sm text-muted-foreground">
					View and manage your billing information and invoices.
				</div>
			</TabsContent>
			<TabsContent value="settings">
				<div class="p-4 text-sm text-muted-foreground">
					Configure your application preferences and settings.
				</div>
			</TabsContent>
			<TabsContent value="notifications">
				<div class="p-4 text-sm text-muted-foreground">
					Manage your notification preferences and email alerts.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story
	name="Tab Switching"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for component to render
		const accountTab = await canvas.findByRole('tab', { name: /account/i });
		await expect(accountTab).toBeInTheDocument();

		// Click Password tab
		const passwordTab = canvas.getByRole('tab', { name: /password/i });
		await userEvent.click(passwordTab);

		// Password content should be visible
		await expect(await canvas.findByText(/Change your password here/i)).toBeInTheDocument();

		// Click Settings tab
		const settingsTab = canvas.getByRole('tab', { name: /settings/i });
		await userEvent.click(settingsTab);

		// Settings content should be visible
		await expect(await canvas.findByText(/Manage your account settings/i)).toBeInTheDocument();
	}}
>
	{#snippet template()}
		<Tabs value="account" class="w-[400px]">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="settings">Settings</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<div class="p-4 text-sm text-muted-foreground">
					Make changes to your account here. Click save when you're done.
				</div>
			</TabsContent>
			<TabsContent value="password">
				<div class="p-4 text-sm text-muted-foreground">
					Change your password here. After saving, you'll be logged out.
				</div>
			</TabsContent>
			<TabsContent value="settings">
				<div class="p-4 text-sm text-muted-foreground">
					Manage your account settings and preferences.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>

<Story
	name="Keyboard Navigation"
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Wait for component to render and focus the first tab
		const overviewTab = await canvas.findByRole('tab', { name: /overview/i });
		await userEvent.click(overviewTab);

		// Navigate with arrow keys to Analytics tab
		await userEvent.keyboard('{ArrowRight}');

		// Tabs should auto-activate on arrow key in bits-ui, verify analytics content is now visible
		await expect(await canvas.findByText(/Deep dive into your analytics/i)).toBeInTheDocument();
	}}
>
	{#snippet template()}
		<Tabs value="overview" class="w-[400px]">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="analytics">Analytics</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<div class="p-4 text-sm text-muted-foreground">
					View your dashboard overview and key metrics at a glance.
				</div>
			</TabsContent>
			<TabsContent value="analytics">
				<div class="p-4 text-sm text-muted-foreground">
					Deep dive into your analytics data and performance insights.
				</div>
			</TabsContent>
		</Tabs>
	{/snippet}
</Story>
