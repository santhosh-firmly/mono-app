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

Available variants: default, destructive, outline, secondary, ghost, link

Available sizes: default, sm, lg, icon

### Input (`ui/input/`)

Standard text input supporting all HTML input types: text, email, password, etc.

### Select (`ui/select/`)

Dropdown select with compound components: Root, Trigger, Value, Content, Item, Group, Label

### Checkbox (`ui/checkbox/`)

Accessible checkbox with checked/unchecked states and disabled support.

### Textarea (`ui/textarea/`)

Multi-line text input with configurable rows.

### Switch (`ui/switch/`)

Toggle switch for boolean values.

### Label (`ui/label/`)

Form field labels with proper accessibility attributes.

## Display Components

### Card (`ui/card/`)

Container component with compound parts: Root, Header, Title, Description, Content, Footer

### Badge (`ui/badge/`)

Small status indicators with variants: default, secondary, destructive, outline

### Avatar (`ui/avatar/`)

User avatar with image and fallback text support using compound components: Root, Image, Fallback

### Separator (`ui/separator/`)

Visual divider with horizontal and vertical orientations.

### Table (`ui/table/`)

Data table with compound components: Root, Header, Body, Row, Head, Cell

## Dialog Components

### Dialog (`ui/dialog/`)

Modal dialog with compound components: Root, Trigger, Content, Header, Title, Description, Footer

### Drawer (`ui/drawer/`)

Slide-out panel from edge of screen with compound components: Root, Trigger, Content, Header, Title

### Popover (`ui/popover/`)

Floating content panel with compound components: Root, Trigger, Content

### Dropdown Menu (`ui/dropdown-menu/`)

Action menu with compound components: Root, Trigger, Content, Label, Separator, Item

## Navigation Components

### Breadcrumb (`ui/breadcrumb/`)

Navigation breadcrumbs with compound components: Root, List, Item, Link, Page, Separator

### Pagination (`ui/pagination/`)

Page navigation with compound components: Root, Content, Item, Link, PrevButton, NextButton

### Tabs (`ui/tabs/`)

Tabbed content with compound components: Root, List, Trigger, Content

## Feedback Components

### Alert (`ui/alert/`)

Message display with compound components: Root, Title, Description

Variants: default, destructive

### Progress (`ui/progress/`)

Progress bar with percentage value.

### Tooltip (`ui/tooltip/`)

Hover information display with compound components: Root, Trigger, Content

## Data Components

### Command (`ui/command/`)

Command palette for search and selection with compound components: Root, Input, List, Empty, Group, Item

## Styling Variants

Components use `tailwind-variants` for managing visual variants and sizes. Each component exports a variants function that generates the appropriate Tailwind classes.

## Related Documentation

- [Components Overview](./overview.md) - Component architecture
- [Feature Components](./feature-components.md) - Domain components
