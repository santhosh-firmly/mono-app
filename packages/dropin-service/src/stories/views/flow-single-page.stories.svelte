<script module>
  // @ts-nocheck

  import { defineMeta } from '@storybook/addon-svelte-csf';

  import FlowSinglePage from '$lib/views/flow-single-page.svelte';
  import cartData from '../data/cart.json';

  const { Story } = defineMeta({
      title: 'Checkout V4/Views/FlowSinglePage',
      component: FlowSinglePage,
      tags: ['autodocs'],
      parameters: {
          fullscreen: true
      }
  });
</script>

<Story name="Default">
  <FlowSinglePage cart={cartData} />
</Story>
