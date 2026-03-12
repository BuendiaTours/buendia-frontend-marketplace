<script lang="ts">
	// Componets
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import PureHtmlDialog from '$lib/components/marketplace/PureHtmlDialog.svelte';
	import MeltDrawer from '$lib/components/marketplace/MeltDrawer.svelte';
	import MeltDrawerManager from '$lib/components/marketplace/MeltDrawerManager.svelte';
	import Tooltip from '$lib/components/marketplace/Tooltip.svelte';
	import SwiperElement from '$lib/components/shared/Swiper.svelte';
	import MeltCalendar from '$lib/components/marketplace/MeltCalendar.svelte';
	import MeltRangeCalendar from '$lib/components/marketplace/MeltRangeCalendar.svelte';
	import AuthorMeta from '$lib/components/marketplace/AuthorMeta.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import Progressbar from '$lib/components/marketplace/Progressbar.svelte';
	import { showConfirmDialog } from '$lib/actions/marketplace/confirmAction';
	import { createPopover, melt, type CreateRangeCalendarProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { Calendar } from '$lib/icons/Linear';
	import type { DateValue } from '@internationalized/date';

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

	// MeltCalendar
	let calendarValue = $state<DateValue | undefined>();

	// MeltRangeCalendar + Popover
	type DateRange = CreateRangeCalendarProps['defaultValue'];
	let rangeValue = $state<DateRange | undefined>();

	const {
		elements: { trigger: rangeTrigger, content: rangeContent },
		states: { open: rangePopoverOpen }
	} = createPopover({
		forceVisible: true,
		positioning: {
			placement: 'bottom-start',
			gutter: 4
		}
	});

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
<!-- Index -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h1 class="mb-6 font-semibold">Demos de componentes</h1>
	<ul class="flex flex-col gap-2">
		<li>
			<a href="/components/BndLightbox" class="text-blue-600 hover:underline">BndLightbox</a>
			— Galería lightbox con layouts personalizables y soporte de reviews
		</li>
	</ul>
</div>

<!-- ============================================================ -->
<!-- AuthorMeta -->
<!-- ============================================================ -->
<div class="wrapper mt-6 !bg-red-500">
	<h2 class="mb-4 font-semibold">AuthorMeta</h2>
	<div class="flex max-w-sm flex-col gap-4">
		<AuthorMeta name="Carlos Sabo" desc="Instructor · 12 mar 2025" />
		<AuthorMeta name="María García" />
		<AuthorMeta name="Alejandro Martínez de la Torre Rodríguez" desc="Guía certificado · Madrid" />
	</div>
</div>

<!-- ============================================================ -->
<!-- ReviewCard -->
<!-- ============================================================ -->
<div class="wrapper mt-6 !bg-pink-500">
	<h2 class="mb-4 font-semibold">ReviewCard</h2>
	<div class="flex max-w-xl flex-col gap-8">
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Layout A — StarRating a la derecha</p>
			<ReviewCard
				name="Jorge"
				desc="13/01/2026"
				rating={5}
				text="Hicimos esta excursión en familia con Giomar que nos explicó todo perfectamente, nos aconsejo en varias cuestiones y me parece una forma divertida de conocer la ciudad. Muy recomendable para familias con niños."
			/>
		</div>
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Layout B — StarRating encima</p>
			<ReviewCard
				name="Luke"
				desc="04/01/2023"
				rating={5}
				text="Me encantó el guía que nos tocó en esta excursión (Juan A); empezó la excursión desde que nos montamos en el bus haciéndonos una introducción de los barrios por donde pasábamos y la historia. En el destino la excursión fue muy amena y nos dió muchas opciones para comer como para visitar. De vuelta para Bruxelas expuso que podíamos visitar, donde comer los platos típicos, etc... En resumen, UN PROFESIONAL."
				wrapperClass="is-variant-vertical"
				lines={2}
			/>
		</div>
	</div>
</div>

<!-- ============================================================ -->
<!-- Progressbar -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Progressbar</h2>
	<p class="mb-6 text-gray-500">
		<b>Se le puede pasar:</b><br />
		<code>fgColor</code> para representar el color principal, que por defecto es
		<code>bg-success-700</code><br />
		<code>bgColor</code> para representar el color del fondo, que por defecto es
		<code>bg-neutral-100</code><br />
		<code>percentage</code> para representar que porcentaje del 100% va ocupar la barra de color<br
		/>
		<code>wrapperClass</code> para poder pasar clases al contenedor por si lo necesitamos
	</p>
	<Progressbar percentage="80" />
</div>

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
<!-- Swiper -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Swiper — slides de texto</h2>
	<p class="mb-6 text-gray-500">
		Carrusel basado en Swiper Element (web component). Soporta navegación, paginación y loop.
	</p>
	<SwiperElement
		className="rounded-lg bg-gray-100 h-[200px] max-w-[640px]"
		options={{
			slidesPerView: 1,
			spaceBetween: 16,
			navigation: true,
			pagination: { clickable: true },
			loop: true
		}}
	>
		<swiper-slide class="flex items-center justify-center font-medium text-gray-600"
			>Slide 1</swiper-slide
		>
		<swiper-slide class="flex items-center justify-center font-medium text-gray-600"
			>Slide 2</swiper-slide
		>
		<swiper-slide class="flex items-center justify-center font-medium text-gray-600"
			>Slide 3</swiper-slide
		>
	</SwiperElement>
</div>

<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Swiper — slides con imágenes</h2>
	<SwiperElement
		className="rounded-lg overflow-hidden h-[320px] max-w-[640px]"
		options={{
			slidesPerView: 1,
			spaceBetween: 16,
			navigation: true,
			pagination: { clickable: true },
			loop: true
		}}
	>
		<swiper-slide class="h-full">
			<img
				src="https://picsum.photos/id/238/800/600.jpg"
				alt="Slide 1"
				class="h-full w-full object-cover"
			/>
		</swiper-slide>
		<swiper-slide class="h-full">
			<img
				src="https://picsum.photos/id/239/800/600.jpg"
				alt="Slide 2"
				class="h-full w-full object-cover"
			/>
		</swiper-slide>
		<swiper-slide class="h-full">
			<img
				src="https://picsum.photos/id/240/800/600.jpg"
				alt="Slide 3"
				class="h-full w-full object-cover"
			/>
		</swiper-slide>
	</SwiperElement>
</div>

<!-- ============================================================ -->
<!-- Resto de componentes existentes -->
<!-- ============================================================ -->
<!-- ============================================================ -->
<!-- MeltCalendar -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltCalendar</h2>
	<p class="mb-6 text-gray-500">
		Calendario inline. Personaliza con <code>--c-melt-calendar-selected-bg</code>,
		<code>--c-melt-calendar-cell-size</code>, etc.
	</p>
	<MeltCalendar bind:value={calendarValue} />
	{#if calendarValue}
		<p class="mt-4 text-gray-500">Seleccionado: <strong>{calendarValue.toString()}</strong></p>
	{/if}
</div>

<!-- ============================================================ -->
<!-- MeltRangeCalendar en Popover -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltRangeCalendar — en Popover</h2>
	<p class="mb-6 text-gray-500">
		Calendario de rango abierto desde un botón mediante un Popover de Melt-UI.
	</p>

	<button use:melt={$rangeTrigger} class="e-button e-button-secondary">
		<Calendar class="size-4" />
		{#if rangeValue?.start && rangeValue?.end}
			{rangeValue.start.toString()} → {rangeValue.end.toString()}
		{:else}
			Seleccionar rango de fechas
		{/if}
	</button>

	{#if $rangePopoverOpen}
		<div
			use:melt={$rangeContent}
			transition:fade={{ duration: 100 }}
			class="z-50 rounded-lg border border-gray-200 bg-white shadow-lg"
		>
			<MeltRangeCalendar bind:value={rangeValue} numberOfMonths={2} />
		</div>
	{/if}
</div>

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
