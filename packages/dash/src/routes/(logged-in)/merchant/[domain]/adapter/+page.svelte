<script>
	import { page } from '$app/stores';
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import AdapterEditor from '$lib/components/adapter/adapter-editor.svelte';

	let domain = $derived($page.params.domain);
</script>

<MerchantPageHeader
	title="Adapter"
	description="View, edit, test, and publish your adapter code."
/>
<AdapterEditor {domain} />
