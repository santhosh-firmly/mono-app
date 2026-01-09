# UI Library

The UI library provides foundational components built on Bits UI with Tailwind CSS styling.

## Overview

| Category | Components | Description |
|----------|------------|-------------|
| Form | 9 | Input, Select, Checkbox, etc. |
| Display | 7 | Card, Badge, Avatar, etc. |
| Dialog | 4 | Dialog, Drawer, Sheet, Popover |
| Navigation | 3 | Breadcrumb, Pagination, Tabs |
| Feedback | 3 | Alert, Progress, Tooltip |
| Data | 2 | Table, Command |

## Form Components

### Button (`ui/button/`)

```svelte
<script>
  import Button from '$lib/components/ui/button/button.svelte';
</script>

<!-- Variants -->
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<!-- Sizes -->
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Input (`ui/input/`)

```svelte
<script>
  import Input from '$lib/components/ui/input/input.svelte';
</script>

<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="Password" />
<Input disabled placeholder="Disabled" />
```

### Select (`ui/select/`)

```svelte
<script>
  import * as Select from '$lib/components/ui/select';
</script>

<Select.Root>
  <Select.Trigger>
    <Select.Value placeholder="Select option" />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="option1">Option 1</Select.Item>
    <Select.Item value="option2">Option 2</Select.Item>
    <Select.Group>
      <Select.Label>Group</Select.Label>
      <Select.Item value="option3">Option 3</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

### Checkbox (`ui/checkbox/`)

```svelte
<script>
  import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
  let checked = $state(false);
</script>

<Checkbox bind:checked />
<Checkbox checked disabled />
```

### Textarea (`ui/textarea/`)

```svelte
<script>
  import Textarea from '$lib/components/ui/textarea/textarea.svelte';
</script>

<Textarea placeholder="Enter description..." rows={4} />
```

### Switch (`ui/switch/`)

```svelte
<script>
  import Switch from '$lib/components/ui/switch/switch.svelte';
  let enabled = $state(false);
</script>

<Switch bind:checked={enabled} />
```

### Label (`ui/label/`)

```svelte
<script>
  import Label from '$lib/components/ui/label/label.svelte';
</script>

<Label for="email">Email address</Label>
<Input id="email" type="email" />
```

## Display Components

### Card (`ui/card/`)

```svelte
<script>
  import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Description>Card description text</Card.Description>
  </Card.Header>
  <Card.Content>
    <p>Card content goes here</p>
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

### Badge (`ui/badge/`)

```svelte
<script>
  import Badge from '$lib/components/ui/badge/badge.svelte';
</script>

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Avatar (`ui/avatar/`)

```svelte
<script>
  import * as Avatar from '$lib/components/ui/avatar';
</script>

<Avatar.Root>
  <Avatar.Image src="/avatar.jpg" alt="User" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

### Separator (`ui/separator/`)

```svelte
<script>
  import Separator from '$lib/components/ui/separator/separator.svelte';
</script>

<Separator />
<Separator orientation="vertical" />
```

### Table (`ui/table/`)

```svelte
<script>
  import * as Table from '$lib/components/ui/table';
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Name</Table.Head>
      <Table.Head>Status</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Item 1</Table.Cell>
      <Table.Cell>Active</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>
```

## Dialog Components

### Dialog (`ui/dialog/`)

```svelte
<script>
  import * as Dialog from '$lib/components/ui/dialog';
</script>

<Dialog.Root>
  <Dialog.Trigger>
    <Button>Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>Dialog description</Dialog.Description>
    </Dialog.Header>
    <div>Dialog content</div>
    <Dialog.Footer>
      <Button>Confirm</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### Drawer (`ui/drawer/`)

```svelte
<script>
  import * as Drawer from '$lib/components/ui/drawer';
</script>

<Drawer.Root>
  <Drawer.Trigger>
    <Button>Open Drawer</Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Drawer Title</Drawer.Title>
    </Drawer.Header>
    <div>Drawer content</div>
  </Drawer.Content>
</Drawer.Root>
```

### Popover (`ui/popover/`)

```svelte
<script>
  import * as Popover from '$lib/components/ui/popover';
</script>

<Popover.Root>
  <Popover.Trigger>
    <Button variant="outline">Open</Button>
  </Popover.Trigger>
  <Popover.Content>
    Popover content
  </Popover.Content>
</Popover.Root>
```

### Dropdown Menu (`ui/dropdown-menu/`)

```svelte
<script>
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="ghost">Menu</Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Label>Actions</DropdownMenu.Label>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Navigation Components

### Breadcrumb (`ui/breadcrumb/`)

```svelte
<script>
  import * as Breadcrumb from '$lib/components/ui/breadcrumb';
</script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Current</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

### Pagination (`ui/pagination/`)

```svelte
<script>
  import * as Pagination from '$lib/components/ui/pagination';
</script>

<Pagination.Root count={100} perPage={10} page={1}>
  <Pagination.Content>
    <Pagination.Item>
      <Pagination.PrevButton />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Link page={1}>1</Pagination.Link>
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.NextButton />
    </Pagination.Item>
  </Pagination.Content>
</Pagination.Root>
```

### Tabs (`ui/tabs/`)

```svelte
<script>
  import * as Tabs from '$lib/components/ui/tabs';
</script>

<Tabs.Root value="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs.Root>
```

## Feedback Components

### Alert (`ui/alert/`)

```svelte
<script>
  import * as Alert from '$lib/components/ui/alert';
</script>

<Alert.Root>
  <Alert.Title>Alert Title</Alert.Title>
  <Alert.Description>Alert description text</Alert.Description>
</Alert.Root>

<Alert.Root variant="destructive">
  <Alert.Title>Error</Alert.Title>
  <Alert.Description>Something went wrong</Alert.Description>
</Alert.Root>
```

### Progress (`ui/progress/`)

```svelte
<script>
  import Progress from '$lib/components/ui/progress/progress.svelte';
</script>

<Progress value={60} />
```

### Tooltip (`ui/tooltip/`)

```svelte
<script>
  import * as Tooltip from '$lib/components/ui/tooltip';
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    <Button variant="ghost">Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    Tooltip text
  </Tooltip.Content>
</Tooltip.Root>
```

## Data Components

### Command (`ui/command/`)

Command palette for search and selection:

```svelte
<script>
  import * as Command from '$lib/components/ui/command';
</script>

<Command.Root>
  <Command.Input placeholder="Search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Suggestions">
      <Command.Item>Item 1</Command.Item>
      <Command.Item>Item 2</Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>
```

## Styling Variants

Components use `tailwind-variants` for variant management:

```javascript
// button/index.js
import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});
```

## Related Documentation

- [Components Overview](./overview.md) - Component architecture
- [Feature Components](./feature-components.md) - Domain components
- [Patterns](./patterns.md) - Design patterns
