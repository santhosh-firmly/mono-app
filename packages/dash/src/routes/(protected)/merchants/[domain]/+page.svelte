<script>
	import File from 'lucide-svelte/icons/file';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import ProductList from '$lib/components/custom/product-list.svelte';

	export let data;
</script>

<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
	<Tabs.Root>
		<div class="flex items-center">
			<Tabs.List>
				<Tabs.Trigger value="all">All</Tabs.Trigger>
				<Tabs.Trigger value="available">In Stock</Tabs.Trigger>
				<Tabs.Trigger value="unavailable">Out Of Stock</Tabs.Trigger>
			</Tabs.List>
			<div class="ml-auto flex items-center gap-2">
				<Button size="sm" variant="outline" class="h-8 gap-1">
					<File class="h-3.5 w-3.5" />
					<span class="sr-only sm:not-sr-only sm:whitespace-nowrap"> Export </span>
				</Button>
			</div>
		</div>
		<Tabs.Content value="all">
			<ProductList products={data.products} />
		</Tabs.Content>
		<Tabs.Content value="available">
			<ProductList
				products={data.products.filter((p) => p.variants?.[0]?.available)}
				total={data.products.length}
			/>
		</Tabs.Content>
		<Tabs.Content value="unavailable">
			<ProductList
				products={data.products.filter((p) => !p.variants?.[0]?.available)}
				total={data.products.length}
			/>
		</Tabs.Content>
	</Tabs.Root>
</main>
