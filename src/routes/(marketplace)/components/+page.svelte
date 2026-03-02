<script lang="ts">
	// Componets
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import PureHtmlDialog from '$lib/components/marketplace/PureHtmlDialog.svelte';
	import MeltDrawer from '$lib/components/marketplace/MeltDrawer.svelte';
	import MeltDrawerManager from '$lib/components/marketplace/MeltDrawerManager.svelte';
	import Tooltip from '$lib/components/marketplace/Tooltip.svelte';
	import { showConfirmDialog } from '$lib/actions/marketplace/confirmAction';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// PureHtmlDialog
	let pureDialog: PureHtmlDialog;

	// MeltDrawer
	let drawerOpen = $state(false);

	// MeltDrawerManager
	type DemoItem = { id: string; name: string; description: string };
	const demoItems: DemoItem[] = [
		{
			id: '1',
			name: 'Visita al Coliseo',
			description: 'Tour guiado por el Coliseo Romano con acceso a las arenas.'
		},
		{
			id: '2',
			name: 'Free tour Madrid',
			description: 'Descubre el Madrid de los Austrias con nuestros guías expertos.'
		},
		{
			id: '3',
			name: 'Sagrada Família',
			description: 'Visita la obra maestra inacabada de Antoni Gaudí.'
		}
	];
	let selectedItemId = $state<string | null>(null);

	// Confirm dialog
	let confirmResult = $state<boolean | null>(null);

	async function handleConfirm() {
		confirmResult = null;
		confirmResult = await showConfirmDialog({
			title: 'Cancelar reserva',
			message:
				'¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer.',
			confirmText: 'Sí, cancelar',
			cancelText: 'Volver',
			danger: true
		});
	}
</script>

<!-- ============================================================ -->
<!-- Tooltip -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Tooltip</h2>
	<p class="mb-6 text-gray-500">
		Sin estilos por defecto — personaliza con <code>--c-tooltip-bg</code>,
		<code>--c-tooltip-color</code> y <code>--c-tooltip-radius</code>.
	</p>

	<!-- Ejemplo con estilos inline para demostración -->
	<div
		class="flex flex-wrap items-center gap-8 p-8"
		style="--c-tooltip-bg: #1e293b; --c-tooltip-color: #f8fafc; --c-tooltip-radius: 6px;"
	>
		<Tooltip tip="Tooltip arriba (default)">
			<button class="e-button e-button-secondary">Top</button>
		</Tooltip>

		<Tooltip tip="Tooltip abajo" position="bottom">
			<button class="e-button e-button-secondary">Bottom</button>
		</Tooltip>

		<Tooltip tip="Tooltip a la izquierda" position="left">
			<button class="e-button e-button-secondary">Left</button>
		</Tooltip>

		<Tooltip tip="Tooltip a la derecha" position="right">
			<button class="e-button e-button-secondary">Right</button>
		</Tooltip>

		<Tooltip tip="Siempre visible" open={true}>
			<button class="e-button e-button-secondary">Open</button>
		</Tooltip>

		<Tooltip tip="">
			<button class="e-button e-button-secondary">Sin tip (no aparece)</button>
		</Tooltip>
	</div>
</div>

<!-- ============================================================ -->
<!-- MeltAlertDialog (confirm) -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltAlertDialog — Diálogo de confirmación</h2>
	<div class="flex items-center gap-4">
		<button class="e-button e-button-primary" onclick={handleConfirm}>Cancelar reserva</button>
		{#if confirmResult !== null}
			<p class="text-gray-600">
				Resultado: <strong>{confirmResult ? 'Confirmado' : 'Cancelado'}</strong>
			</p>
		{/if}
	</div>
</div>

<!-- ============================================================ -->
<!-- PureHtmlDialog -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="sfont-semibold mb-4">PureHtmlDialog — Dialog nativo HTML</h2>
	<button class="e-button e-button-primary" onclick={() => pureDialog.showModal()}
		>Abrir diálogo</button
	>

	<PureHtmlDialog bind:this={pureDialog} title="Información de la actividad">
		{#snippet content()}
			<p class="text-gray-700">
				Este tour incluye visita guiada, entrada al recinto y seguro de viaje. La duración
				aproximada es de 2 horas.
			</p>
			<p class="mt-3 text-gray-500">Plazas disponibles: 8 de 20</p>
		{/snippet}
		{#snippet actions()}
			<button class="e-button e-button-secondary e-button-sm" onclick={() => pureDialog.close()}>
				Cerrar
			</button>
			<button class="e-button e-button-primary e-button-sm" onclick={() => pureDialog.close()}>
				Reservar plaza
			</button>
		{/snippet}
	</PureHtmlDialog>
</div>

<!-- ============================================================ -->
<!-- MeltDrawer -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltDrawer — Panel lateral</h2>
	<button class="e-button e-button-primary" onclick={() => (drawerOpen = true)}>Abrir drawer</button
	>

	<MeltDrawer
		bind:open={drawerOpen}
		title="Detalles del tour"
		config={{ side: 'right', width: 400 }}
	>
		<p class="text-gray-700">Aquí irían los detalles completos del tour seleccionado.</p>
		<ul class="mt-4 space-y-2 text-gray-600">
			<li>✓ Guía certificado</li>
			<li>✓ Grupos reducidos (máx. 15 personas)</li>
			<li>✓ Cancelación gratuita 24h antes</li>
		</ul>
		<button class="e-button e-button-primary mt-6 w-full" onclick={() => (drawerOpen = false)}>
			Reservar ahora
		</button>
	</MeltDrawer>
</div>

<!-- ============================================================ -->
<!-- MeltDrawerManager -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltDrawerManager — Drawer con lista de items</h2>
	<div class="flex flex-col gap-2">
		{#each demoItems as item (item.id)}
			<div class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
				<span class="font-medium text-gray-800">{item.name}</span>
				<button
					class="e-button e-button-secondary e-button-sm"
					onclick={() => (selectedItemId = item.id)}
				>
					Ver detalles
				</button>
			</div>
		{/each}
	</div>

	<MeltDrawerManager
		bind:selectedId={selectedItemId}
		items={demoItems}
		title={(item) => item.name}
		config={{ side: 'right', width: 420 }}
	>
		{#snippet content(item)}
			<p class="text-gray-700">{item.description}</p>
			<button class="e-button e-button-primary mt-6 w-full">Reservar — {item.name}</button>
		{/snippet}
	</MeltDrawerManager>
</div>

<!-- ============================================================ -->
<!-- Resto de componentes existentes -->
<!-- ============================================================ -->
<div class="wrapper mt-6">Calendar</div>

<div class="wrapper mt-6">Range Calendar</div>

<div class="wrapper mt-6">
	<StarRating value={3.5} size="md" filledClass="text-blue-500" emptyClass="text-blue-100" />
</div>

<div class="wrapper mt-6">
	<AccordionOnMobile open={true}>
		{#snippet summary()}
			<p class="h3">Información del producto</p>
		{/snippet}
		<p>Contenido visible siempre en desktop, colapsable en mobile.</p>
	</AccordionOnMobile>
</div>

<div class="wrapper mt-6">
	<div>
		<div class="e-button">Button</div>
		<div class="e-button e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button" disabled>Button</div>
		<div class="e-button e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-lg" disabled>Button</div>
	</div>
	<div>
		<div class="e-button e-button-secondary">Button</div>
		<div class="e-button e-button-secondary e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-secondary e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button e-button-secondary" disabled>Button</div>
		<div class="e-button e-button-secondary e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-secondary e-button-lg" disabled>Button</div>
	</div>
	<div>
		<div class="e-button e-button-tertiary">Button</div>
		<div class="e-button e-button-tertiary e-button-sm e-button-primary">Button</div>
		<div class="e-button e-button-tertiary e-button-lg">Button</div>
	</div>
	<div>
		<div class="e-button e-button-tertiary" disabled>Button</div>
		<div class="e-button e-button-tertiary e-button-sm e-button-primary" disabled>Button</div>
		<div class="e-button e-button-tertiary e-button-lg" disabled>Button</div>
	</div>
</div>

<div class="wrapper mt-6">
	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Destinos</h2>

		{#if data.destinations && data.destinations.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.destinations as destination (destination.slug)}
					<li class="text-gray-700">
						<a href="/{destination.slug}" class="hover:text-blue-600 hover:underline">
							{destination.name}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay destinos disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-8">
		<h2 class="mb-3 font-semibold text-gray-800">Free tours</h2>

		{#if data.freeTours && data.freeTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.freeTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay free tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-4">
		<h2 class="mb-3 font-semibold text-gray-800">Paid tours</h2>

		{#if data.paidTours && data.paidTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.paidTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay paid tours disponibles en este momento.</p>
		{/if}
	</div>

	<div class="e-card mb-6">
		<h2 class="mb-3 font-semibold text-gray-800">Other tours</h2>

		{#if data.otherTours && data.otherTours.length > 0}
			<ul class="mt-4 space-y-2">
				{#each data.otherTours as activity (activity.slug)}
					<li class="text-gray-700">
						<a href="/actividad/{activity.slug}" class="hover:text-blue-600 hover:underline">
							{activity.title}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-4 text-gray-500">No hay other tours disponibles en este momento.</p>
		{/if}
	</div>
</div>
