<!--
MeltDrawerManager - Wrapper component para gestionar drawers dinámicos con items

PROPÓSITO:
Este componente encapsula la lógica compleja de gestión de estado necesaria para
usar MeltDrawer con listas dinámicas de items (ej: listados, tablas, grids).

PROBLEMA QUE RESUELVE:
Cuando se usa MeltDrawer con múltiples items (ej: botón "Ver detalles" en cada fila
de una tabla), se necesita:

1. **Sincronización de estado**: Coordinar qué drawer está abierto basado en el ID del item
2. **Delay de animación**: Mantener el componente montado durante la animación de cierre
   (300ms) antes de desmontarlo del DOM, para que la transición se vea suavemente
3. **Gestión de memoria**: Renderizar solo el drawer activo, no todos los posibles drawers

Sin este wrapper, cada componente consumidor debe implementar manualmente:
- Variables: openDrawerId, drawerOpen, mountedDrawerId
- 2 bloques $effect para sincronización y delay con setTimeout
- Lógica condicional para encontrar el item seleccionado

CASOS DE USO:

✅ Caso 1: Listado con botón "Ver detalles" en cada item
   - Usuario hace clic en "Ver detalles" de un item
   - Se abre el drawer con la información de ese item específico
   - Al cerrar, la animación se completa antes de desmontar

✅ Caso 2: Tabla con acciones por fila
   - Cada fila tiene un botón que abre un drawer con detalles/edición
   - Solo se renderiza el drawer del item seleccionado

✅ Caso 3: Grid de tarjetas con modal de detalles
   - Al hacer clic en una tarjeta, se abre un drawer lateral
   - El drawer muestra información detallada de esa tarjeta

❌ NO usar para: Drawer único y simple (usar MeltDrawer directamente)

USO:
```svelte
<script>
  let selectedItemId = $state<string | null>(null);
  const items = [...]; // Array de items
</script>

<button onclick={() => selectedItemId = item.id}>Ver detalles</button>

<MeltDrawerManager
  bind:selectedId={selectedItemId}
  items={items}
  title={(item) => `Detalles de ${item.name}`}
  config={{ side: 'right', width: 400 }}
>
  {#snippet content(item)}
    <p>{item.description}</p>
  {/snippet}
</MeltDrawerManager>
```

VENTAJAS:
- Reduce código boilerplate de ~25 líneas a ~3 líneas por uso
- Centraliza la lógica de animación (fácil de actualizar duración)
- Mejor rendimiento (solo 1 drawer en DOM)
- API declarativa y fácil de entender
-->

<script lang="ts">
	import MeltDrawer from './MeltDrawer.svelte';
	import type { MeltDrawerManagerConfig } from './MeltDrawerManager';

	interface Props<T = any> {
		selectedId?: string | null;
		items: T[];
		title?: string | ((item: T) => string);
		config?: MeltDrawerManagerConfig;
		content: any;
	}

	let {
		selectedId = $bindable<string | null>(null),
		items,
		title = '',
		config = {},
		content
	}: Props = $props();

	// Estado interno para gestionar el ciclo de vida del drawer
	let drawerOpen = $state(false);
	let mountedItemId = $state<string | null>(null);

	// Sincronizar: cuando se selecciona un item, montar el drawer y abrirlo
	$effect(() => {
		if (selectedId !== null) {
			mountedItemId = selectedId;
			drawerOpen = true;
		}
	});

	// Cuando el drawer se cierra, esperar a que termine la animación (300ms)
	// antes de desmontarlo del DOM. Esto permite que la transición fly se vea suavemente.
	$effect(() => {
		if (!drawerOpen && mountedItemId !== null) {
			const timeout = setTimeout(() => {
				mountedItemId = null;
				selectedId = null;
			}, 300); // Debe coincidir con la duración de la animación en MeltDrawer
			return () => clearTimeout(timeout);
		}
	});

	// Encontrar el item seleccionado basado en mountedItemId
	const selectedItem = $derived(
		mountedItemId ? items.find((item: any) => item.id === mountedItemId) : null
	);

	// Resolver el título: puede ser string o función
	const resolvedTitle = $derived(
		selectedItem ? (typeof title === 'function' ? title(selectedItem) : title) : ''
	);
</script>

{#if mountedItemId && selectedItem}
	<MeltDrawer bind:open={drawerOpen} title={resolvedTitle} {config}>
		{@render content(selectedItem)}
	</MeltDrawer>
{/if}
