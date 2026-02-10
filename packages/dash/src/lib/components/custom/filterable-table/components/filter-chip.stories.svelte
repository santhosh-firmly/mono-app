<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FilterChip from './filter-chip.svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/FilterChip',
		component: FilterChip,
		tags: ['autodocs']
	});
</script>

<Story
	name="String Filter - Equals"
	args={{
		filter: {
			columnId: 'name',
			columnName: 'Name',
			condition: 'equals',
			value: 'John Doe'
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="String Filter - Contains"
	args={{
		filter: {
			columnId: 'email',
			columnName: 'Email',
			condition: 'contains',
			value: '@example.com'
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="Numeric Filter - Greater Than"
	args={{
		filter: {
			columnId: 'age',
			columnName: 'Age',
			condition: 'greater_than',
			value: 25
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="Numeric Filter - Between"
	args={{
		filter: {
			columnId: 'salary',
			columnName: 'Salary',
			condition: 'between',
			value: 50000,
			value2: 100000
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="Multi-Select Filter - Single Value"
	args={{
		filter: {
			columnId: 'status',
			columnName: 'Status',
			condition: 'in',
			values: ['active']
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="Multi-Select Filter - Multiple Values"
	args={{
		filter: {
			columnId: 'department',
			columnName: 'Department',
			condition: 'in',
			values: ['Engineering', 'Product', 'Sales']
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>

<Story
	name="Boolean Filter - True"
	args={{
		filter: {
			columnId: 'verified',
			columnName: 'Verified',
			condition: 'equals',
			value: true
		},
		onEdit: (e) => console.log('Edit clicked', e),
		onRemove: () => console.log('Remove clicked')
	}}
/>
