<script>
	import Ellipsis from 'lucide-svelte/icons/ellipsis';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';

	export let products;
	export let total;
</script>

<Card.Root>
	<Card.Header class="flex flex-row items-start justify-between gap-4 space-y-0">
		<div class="space-y-1">
			<Card.Title>Products</Card.Title>
			<Card.Description>Manage your products in real-time.</Card.Description>
		</div>
		<div class="text-xs text-muted-foreground">
			Showing <strong>{products.length}</strong>
			{#if total && products.length !== total}
				of <strong>{total}</strong>
			{/if}
			products
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="hidden w-[100px] sm:table-cell">
						<span class="sr-only">Image</span>
					</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="hidden md:table-cell">Price</Table.Head>
					<Table.Head class="hidden md:table-cell">Total Variants</Table.Head>
					<Table.Head class="hidden md:table-cell">Product handle</Table.Head>
					<Table.Head>
						<span class="sr-only">Actions</span>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each products as product (product.base_sku)}
					<Table.Row class="cursor-pointer" on:click={() => (window.location = '')}>
						<Table.Cell class="hidden sm:table-cell">
							<img
								alt="Product example"
								class="aspect-square rounded-md object-cover"
								height="64"
								src={product.images?.[0]?.url || '/images/placeholder.svg'}
								width="64"
							/>
						</Table.Cell>
						<Table.Cell class="font-medium">{product.title}</Table.Cell>
						<Table.Cell>
							<Badge variant={product.variants?.[0]?.available ? 'primary' : 'secondary'}
								>{product.variants?.[0]?.available ? 'In Stock' : 'Out Of Stock'}</Badge
							>
						</Table.Cell>
						<Table.Cell class="hidden md:table-cell">${product.variants?.[0]?.price}</Table.Cell>
						<Table.Cell class="hidden md:table-cell">{product.variants?.length ?? 0}</Table.Cell>
						<Table.Cell class="hidden md:table-cell">{product.handle}</Table.Cell>
						<Table.Cell>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger asChild let:builder>
									<Button aria-haspopup="true" size="icon" variant="ghost" builders={[builder]}>
										<Ellipsis class="h-4 w-4" />
										<span class="sr-only">Toggle menu</span>
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Label>Actions</DropdownMenu.Label>
									<DropdownMenu.Item>Edit</DropdownMenu.Item>
									<DropdownMenu.Item>Delete</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
