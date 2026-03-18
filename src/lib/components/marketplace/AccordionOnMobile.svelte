<!--
// Ejemplo de uso:
 <AccordionOnMobile open={true}>
  {#snippet summary()}
    <h3>Información del producto</h3>
  {/snippet}
  <p>Contenido visible siempre en desktop, colapsable en mobile.</p>
</AccordionOnMobile>
 -->

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		summary: Snippet;
		children: Snippet;
		wrapperClass?: string;
		contentClass?: string;
	};

	let { open = false, summary, children, wrapperClass, contentClass }: Props = $props();
</script>

<details class="c-accordion-on-mobile {wrapperClass}" {open}>
	<summary class="c-accordion-on-mobile__summary">
		{@render summary()}
	</summary>
	<div class="c-accordion-on-mobile__content {contentClass}">
		{@render children()}
	</div>
</details>
