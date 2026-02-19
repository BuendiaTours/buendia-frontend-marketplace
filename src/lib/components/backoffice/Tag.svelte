<!--
@component
Tag - Componente simple de tag/badge basado en DaisyUI

## Ejemplos de uso:

```svelte
<Tag>Svelte</Tag>
<Tag class="badge-primary">TypeScript</Tag>
<Tag class="badge-success badge-lg">Large Success</Tag>
<Tag class="badge-info badge-outline">Info Outline</Tag>
<Tag name="tags[]" value="1" class="badge-secondary" removable onremove={() => console.log('removed')}>Form Tag</Tag>
<Tag class="badge-primary" removable onremove={() => console.log('removed')}>Removable</Tag>
```

## Props:
- `name` (string): Nombre del input hidden
- `value` (string): Valor del input hidden
- `class` (string): Clases de DaisyUI (badge-primary, badge-lg, badge-outline, etc.)
- `removable` (boolean): Mostrar botón X para eliminar
- `onremove` (() => void): Callback cuando se elimina

Ver clases disponibles: https://daisyui.com/components/badge/
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { CloseSquare } from '$lib/icons/Linear';

	let {
		name = '',
		value = '',
		class: className = '',
		removable = false,
		onremove = () => {},
		children
	}: {
		name?: string;
		value?: string;
		class?: string;
		removable?: boolean;
		onremove?: () => void;
		children?: Snippet;
	} = $props();

	function handleRemove(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		onremove();
	}
</script>

<div class="badge {className} gap-1 rounded-md">
	{#if children}
		{@render children()}
	{/if}

	{#if name && value}
		<input type="hidden" {name} {value} />
	{/if}

	{#if removable}
		<button
			type="button"
			onclick={handleRemove}
			class="btn btn-square btn-ghost btn-xs -mr-2 h-4 min-h-4 w-4 p-0"
			aria-label="Remove tag"
		>
			<CloseSquare class="h-3 w-3" />
		</button>
	{/if}
</div>
