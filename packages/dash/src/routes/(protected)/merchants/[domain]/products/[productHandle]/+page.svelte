<script>
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import CirclePlus from 'lucide-svelte/icons/circle-plus';
	import Upload from 'lucide-svelte/icons/upload';

	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';

	export let data;

	let productAvailable = false;

	$: productAvailable = data.product.variants?.some((v) => v.available);
</script>

<div class="mx-auto grid flex-1 auto-rows-max gap-4">
	<div class="flex items-center gap-4 pb-2 pt-4">
		<Button variant="outline" size="icon" class="h-7 w-7">
			<ChevronLeft class="h-4 w-4" />
			<span class="sr-only">Back</span>
		</Button>
		<h1 class="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
			{data.product.title}
		</h1>
		<Badge variant="outline" class="ml-auto sm:ml-0">In stock</Badge>
	</div>
	<div class="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
		<div class="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
			<Card.Root>
				<Card.Header>
					<Card.Title>Product Details</Card.Title>
					<Card.Description>Review the details for this product</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="name">Name</Label>
							<span>{data.product.title}</span>
						</div>
						<div class="grid gap-3">
							<Label for="description">Description</Label>
							<span>{@html data.product.description}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Variants</Card.Title>
					<Card.Description>Available variants for this product</Card.Description>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[100px]">SKU</Table.Head>
								<Table.Head>Status</Table.Head>
								{#each data.product.variant_option_values as option}
									<Table.Head class="w-[100px]">{option.option_name}</Table.Head>
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.product.variants as variant (variant.sku)}
								<Table.Row>
									<Table.Cell class="font-semibold">{variant.sku}</Table.Cell>
									<Table.Cell>
										<Badge variant={variant.available ? 'outline' : 'secondary'}
											>{variant.available ? 'In Stock' : 'Out Of Stock'}</Badge
										>
									</Table.Cell>
									{#each data.product.variant_option_values as option}
										<Table.Cell>
											<ToggleGroup.Root type="single" value={variant[option.property_accessor]} variant="outline">
												<!-- <ToggleGroup.Item disabled value={variant[option.property_accessor]}>{variant[option.property_accessor]}</ToggleGroup.Item> -->
												{#each option.option_values as value}
													<ToggleGroup.Item disabled {value}>{value}</ToggleGroup.Item>
												{/each}
											</ToggleGroup.Root>
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
				<Card.Footer class="justify-center border-t p-4">
					<Button disabled size="sm" variant="ghost" class="gap-1">
						<CirclePlus class="h-3.5 w-3.5" />
						Add Variant
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
		<div class="grid auto-rows-max items-start gap-4 lg:gap-8">
			<Card.Root>
				<Card.Header>
					<Card.Title>Variant Options</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-6">
						{#each data.product.variant_option_values as option}
							<span>{option.option_name}</span>
							<div class="flex flex-row flex-wrap items-center gap-3">
								{#each option.option_values as value}
									<Button variant="outline">{value}</Button>
								{/each}
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="overflow-hidden">
				<Card.Header>
					<Card.Title>Product Images</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-2">
						<img
							alt="Product"
							class="aspect-square w-full rounded-md object-cover"
							height="300"
							src={data.product.images?.[0].url}
							width="300"
						/>
						<div class="grid grid-cols-3 gap-2">
							{#each data.product.images as image}
								<button>
									<img
										alt="Product"
										class="aspect-square w-full rounded-md object-cover"
										height="84"
										src={image.url ?? '/images/placeholder.svg'}
										width="84"
									/>
								</button>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
