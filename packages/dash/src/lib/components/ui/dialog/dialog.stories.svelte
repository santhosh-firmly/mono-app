<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	const { Story } = defineMeta({
		title: 'Feedback/Dialog',
		component: Dialog.Root,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		}
	});
</script>

<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	let simpleOpen = $state(false);
	let formOpen = $state(false);
	let confirmOpen = $state(false);
	let footerOpen = $state(false);
	let interactionOpen = $state(false);

	let formData = $state({ name: '', email: '' });
</script>

<Story name="Simple Dialog">
	{#snippet template()}
		<Dialog.Root bind:open={simpleOpen}>
			<Dialog.Trigger asChild>
				<Button>Open Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Welcome to the application</Dialog.Title>
					<Dialog.Description>
						This is a simple dialog with a title and description. It demonstrates the
						basic structure of a dialog component.
					</Dialog.Description>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Dialog with Form">
	{#snippet template()}
		<Dialog.Root bind:open={formOpen}>
			<Dialog.Trigger asChild>
				<Button>Edit Profile</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Edit Profile</Dialog.Title>
					<Dialog.Description>
						Make changes to your profile here. Click save when you're done.
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" bind:value={formData.name} placeholder="Enter your name" />
					</div>
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={formData.email}
							placeholder="Enter your email"
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (formOpen = false)}>Cancel</Button>
					<Button onclick={() => (formOpen = false)}>Save Changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Confirmation Dialog">
	{#snippet template()}
		<Dialog.Root bind:open={confirmOpen}>
			<Dialog.Trigger asChild>
				<Button variant="destructive">Delete Account</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Are you absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete your account and
						remove your data from our servers.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
					<Button variant="destructive" onclick={() => (confirmOpen = false)}>
						Yes, delete my account
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Dialog with Footer Actions">
	{#snippet template()}
		<Dialog.Root bind:open={footerOpen}>
			<Dialog.Trigger asChild>
				<Button>View Details</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-lg">
				<Dialog.Header>
					<Dialog.Title>Order Details</Dialog.Title>
					<Dialog.Description>Review the order information below.</Dialog.Description>
				</Dialog.Header>
				<div class="py-4">
					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Order ID</span>
							<span class="font-medium">#ORD-12345</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Status</span>
							<span class="font-medium text-green-600">Completed</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Total</span>
							<span class="font-medium">$129.99</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Date</span>
							<span class="font-medium">January 5, 2026</span>
						</div>
					</div>
				</div>
				<Dialog.Footer class="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						class="w-full sm:w-auto"
						onclick={() => (footerOpen = false)}
					>
						Close
					</Button>
					<Button variant="secondary" class="w-full sm:w-auto">Download Invoice</Button>
					<Button class="w-full sm:w-auto">Track Order</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Open and Close Dialog">
	{#snippet template()}
		<Dialog.Root bind:open={interactionOpen}>
			<Dialog.Trigger asChild>
				<Button>Open Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Welcome to the application</Dialog.Title>
					<Dialog.Description>
						This dialog can be closed with the Escape key or by clicking outside.
					</Dialog.Description>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Dialog Form Interaction">
	{#snippet template()}
		<Dialog.Root bind:open={formOpen}>
			<Dialog.Trigger asChild>
				<Button>Edit Profile</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Edit Profile</Dialog.Title>
					<Dialog.Description>
						Make changes to your profile here. Click save when you're done.
					</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-4 py-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" bind:value={formData.name} placeholder="Enter your name" />
					</div>
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							bind:value={formData.email}
							placeholder="Enter your email"
						/>
					</div>
				</div>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (formOpen = false)}>Cancel</Button>
					<Button onclick={() => (formOpen = false)}>Save Changes</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Cancel Button Closes Dialog">
	{#snippet template()}
		<Dialog.Root bind:open={confirmOpen}>
			<Dialog.Trigger asChild>
				<Button variant="destructive">Delete Account</Button>
			</Dialog.Trigger>
			<Dialog.Content class="sm:max-w-md">
				<Dialog.Header>
					<Dialog.Title>Are you absolutely sure?</Dialog.Title>
					<Dialog.Description>
						This action cannot be undone. This will permanently delete your account.
					</Dialog.Description>
				</Dialog.Header>
				<Dialog.Footer>
					<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
					<Button variant="destructive" onclick={() => (confirmOpen = false)}>
						Yes, delete my account
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>

<Story name="Dialog Closes on Outside Click">
	{#snippet template()}
		<Dialog.Root bind:open={simpleOpen}>
			<Dialog.Trigger asChild>
				<Button>Open Dialog</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Click outside to close</Dialog.Title>
					<Dialog.Description>
						This dialog can be closed by clicking outside or pressing Escape.
					</Dialog.Description>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	{/snippet}
</Story>
