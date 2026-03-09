<script lang="ts">
	// Componets
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import PureHtmlDialog from '$lib/components/marketplace/PureHtmlDialog.svelte';
	import MeltDrawer from '$lib/components/marketplace/MeltDrawer.svelte';
	import MeltDrawerManager from '$lib/components/marketplace/MeltDrawerManager.svelte';
	import Tooltip from '$lib/components/marketplace/Tooltip.svelte';
	import { BndLightbox, ReviewsLayout } from '$lib/components/marketplace/BndLightbox';
	import type { BndLightboxConfig, BndLightboxItemContext } from '$lib/types';
	import SwiperElement from '$lib/components/shared/Swiper.svelte';
	import MeltCalendar from '$lib/components/marketplace/MeltCalendar.svelte';
	import MeltRangeCalendar from '$lib/components/marketplace/MeltRangeCalendar.svelte';
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

	// BndLightbox — demos

	// Fotos compartidas (usadas en ejemplos A, B y D)
	const photoItems = [
		{
			src: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=80',
			alt: 'Porto Wine Cellars',
			title: 'Bodegas de Oporto'
		},
		{
			src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80',
			alt: 'Algarve Beach',
			title: 'Playa del Algarve'
		},
		{
			src: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80',
			alt: 'Cosmetics',
			title: 'Selección de cosméticos'
		}
	];

	// Raw reviews data (estructura real de la API)
	type RawReview = {
		user: string;
		averageRating: number;
		content: string;
		date?: string;
		createdAt?: string;
		attachments: Array<{ url: { value: string }; mimeType?: string | null }>;
	};

	const demoReviews: RawReview[] = [
		{
			user: 'María García',
			averageRating: 5,
			content: 'Una experiencia increíble. La comida estaba deliciosa y el guía fue muy ameno.',
			date: '2025-11-15',
			attachments: [
				{
					url: { value: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80' }
				},
				{
					url: { value: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80' }
				}
			]
		},
		{
			user: 'JSmith Buyer',
			averageRating: 4,
			content: 'Great product overall. Minor issue with the instructions, they could be clearer.',
			createdAt: '2026-01-25T18:22:30.000Z',
			attachments: [
				{ url: { value: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80' } }
			]
		}
	];

	// Normalización flat: cada attachment → BndLightboxItem con datos de review en meta
	const reviewItems = demoReviews.flatMap((review, reviewIdx) =>
		review.attachments.map((att) => ({
			src: att.url.value,
			alt: `Foto de ${review.user}`,
			meta: {
				user: review.user,
				rating: review.averageRating,
				content: review.content,
				date: review.date ?? review.createdAt?.split('T')[0] ?? '',
				reviewIndex: reviewIdx
			}
		}))
	);

	// A — Botón → default layout, sin tabs
	let lbA_open = $state(false);
	const lbA_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [{ id: 'fotos', label: 'Fotos', items: photoItems }]
	};

	// B — Thumbnails → default layout, sin tabs
	let lbB_open = $state(false);
	let lbB_startIndex = $state(0);

	// C — Botón → ReviewsLayout (componente), sin tabs
	let lbC_open = $state(false);
	const lbC_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [
			{ id: 'reviews', label: 'Reviews', items: reviewItems, layoutComponent: ReviewsLayout }
		]
	};

	// D — Thumbnails de reviews → ReviewsLayout + tabs (fotos + reviews)
	let lbD_open = $state(false);
	let lbD_startIndex = $state(0);
	const lbD_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [
			{ id: 'fotos', label: 'Fotos', items: photoItems },
			{ id: 'reviews', label: 'Reviews', items: reviewItems, layoutComponent: ReviewsLayout }
		]
	};

	function openLbD(index: number) {
		lbD_startIndex = index;
		lbD_open = true;
	}

	// E — Snippet custom inline (one-off)
	let lbE_open = $state(false);
	const lbE_config: BndLightboxConfig = {
		wrapAround: true,
		categories: [{ id: 'custom', label: 'Custom', items: photoItems }]
	};

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
<!-- BndLightbox — A. Botón → default layout, sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox A — default layout, desde botón</h2>
	<p class="mb-6 text-gray-500">
		Layout por defecto (imagen + pie de foto). Una sola categoría, sin tabs. Se abre desde un botón.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbA_open = true)}>
		Abrir galería
	</button>
	<BndLightbox bind:open={lbA_open} config={lbA_config} />
</div>

<!-- ============================================================ -->
<!-- BndLightbox — B. Thumbnails → default layout, sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox B — default layout, desde miniaturas</h2>
	<p class="mb-6 text-gray-500">
		Igual que A pero con grid de miniaturas. Click en una imagen abre el lightbox en ese índice.
	</p>
	<div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
		{#each photoItems as item, i (item.src)}
			<button
				onclick={() => {
					lbB_startIndex = i;
					lbB_open = true;
				}}
				aria-label={item.alt}
				class="relative block aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-none bg-none p-0 transition-transform duration-200 ease-in-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
			>
				<img
					src={item.src.replace('w=1200', 'w=400')}
					alt={item.alt}
					class="h-full w-full object-cover"
				/>
			</button>
		{/each}
	</div>
	<BndLightbox bind:open={lbB_open} config={{ ...lbA_config, startIndex: lbB_startIndex }} />
</div>

<!-- ============================================================ -->
<!-- BndLightbox — C. Botón → ReviewsLayout (componente), sin tabs -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox C — ReviewsLayout, desde botón</h2>
	<p class="mb-6 text-gray-500">
		Layout de reviews importado como componente reutilizable (<code>ReviewsLayout</code>). Sin tabs.
		Se abre desde un botón.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbC_open = true)}>
		Abrir reviews
	</button>
	<BndLightbox bind:open={lbC_open} config={lbC_config} />
</div>

<!-- ============================================================ -->
<!-- BndLightbox — D. Thumbnails reviews → ReviewsLayout + tabs (fotos + reviews) -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox D — ReviewsLayout + tabs, desde miniaturas</h2>
	<p class="mb-6 text-gray-500">
		Dos categorías con tabs: "Fotos" (default layout) y "Reviews" (ReviewsLayout). Click en
		miniatura abre en la tab reviews en el índice correcto. En desktop: botones; mobile: select.
	</p>
	<div class="flex flex-wrap gap-3">
		{#each reviewItems as item, i (item.src)}
			<button
				type="button"
				onclick={() => openLbD(i)}
				aria-label={String(item.meta?.user ?? '')}
				class="relative block aspect-square w-24 cursor-pointer overflow-hidden rounded-md border-none bg-none p-0 transition-transform hover:scale-105"
			>
				<img
					src={item.src.replace('w=1200', 'w=200')}
					alt={item.alt}
					class="h-full w-full object-cover"
				/>
			</button>
		{/each}
	</div>
	<BndLightbox
		bind:open={lbD_open}
		config={{ ...lbD_config, startCategory: 'reviews', startIndex: lbD_startIndex }}
	/>
</div>

<!-- ============================================================ -->
<!-- BndLightbox — E. Snippet custom inline (one-off) -->
<!-- ============================================================ -->

<!-- Snippet definido antes del componente para poder pasarlo como prop -->
{#snippet customLayout(ctx: BndLightboxItemContext)}
	<div class="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
		{#key ctx.item.src}
			<img
				src={ctx.item.src}
				alt={ctx.item.alt ?? ''}
				class="max-h-[50vh] max-w-full rounded-2xl object-contain shadow-2xl"
				transition:fade={{ duration: 300 }}
			/>
		{/key}
		{#if ctx.item.title}
			<div class="space-y-1">
				<p class="text-2xl font-bold text-white">{ctx.item.title}</p>
				<p class="text-sm text-white/50">{ctx.index + 1} / {ctx.total}</p>
			</div>
		{/if}
	</div>
{/snippet}

<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">BndLightbox E — snippet custom inline (one-off)</h2>
	<p class="mb-6 text-gray-500">
		Layout completamente personalizado definido con <code>{'{#snippet}'}</code> en la propia página y
		pasado como prop. Demuestra el poder del API de snippets para casos únicos.
	</p>
	<button class="e-button e-button-primary" onclick={() => (lbE_open = true)}>
		Abrir layout custom
	</button>
	<BndLightbox
		bind:open={lbE_open}
		config={{ ...lbE_config, categories: [{ ...lbE_config.categories[0], layout: customLayout }] }}
	/>
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
