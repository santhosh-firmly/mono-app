<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import FileText from 'lucide-svelte/icons/file-text';

	let { privacyPolicy = $bindable(''), termsOfUse = $bindable(''), disabled = false } = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
				<FileText class="h-5 w-5 text-orange-600" />
			</div>
			<div>
				<Card.Title>Legal Documents</Card.Title>
				<Card.Description
					>Links to your privacy policy and terms of service</Card.Description
				>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="space-y-4">
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<Label for="privacyPolicy">Privacy Policy URL</Label>
				<Input
					id="privacyPolicy"
					bind:value={privacyPolicy}
					placeholder="https://example.com/privacy-policy"
					{disabled}
				/>
			</div>
			<div class="space-y-2">
				<Label for="termsOfUse">Terms of Service URL</Label>
				<Input
					id="termsOfUse"
					bind:value={termsOfUse}
					placeholder="https://example.com/terms-of-service"
					{disabled}
				/>
			</div>
		</div>
	</Card.Content>
</Card.Root>
