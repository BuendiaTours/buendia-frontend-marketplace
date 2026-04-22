<script lang="ts">
	// Types
	import type { PageData } from './$types';

	// Libs
	import type { DateValue } from '@internationalized/date';
	import { fade } from 'svelte/transition';

	// Actions
	import { showConfirmDialog } from '$lib/actions/marketplace/confirmAction';

	// Components
	import { createPopover, melt, type CreateRangeCalendarProps } from '@melt-ui/svelte';
	import AccordionOnMobile from '$lib/components/marketplace/AccordionOnMobile.svelte';
	import ActivityTips from '$lib/components/marketplace/checkout/ActivityTips.svelte';
	import AuthorMeta from '$lib/components/marketplace/AuthorMeta.svelte';
	import Callout from '$lib/components/marketplace/Callout.svelte';
	import CheckoutCard from '$lib/components/marketplace/CheckoutCard.svelte';
	import ConfirmationHeroImg from '$lib/components/marketplace/checkout/ConfirmationHeroImg.svelte';
	import Hightlight from '$lib/components/marketplace/Hightlight.svelte';
	import MeltCalendar from '$lib/components/marketplace/MeltCalendar.svelte';
	import MeltComboBox from '$lib/components/marketplace/MeltComboBox.svelte';
	import MeltDrawer from '$lib/components/marketplace/MeltDrawer.svelte';
	import MeltDrawerManager from '$lib/components/marketplace/MeltDrawerManager.svelte';
	import Progressbar from '$lib/components/marketplace/Progressbar.svelte';
	import PureHtmlDialog from '$lib/components/marketplace/PureHtmlDialog.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import Steps from '$lib/components/marketplace/Steps.svelte';
	import SwiperElement from '$lib/components/shared/Swiper.svelte';
	import ThankYouAccountCreate from '$lib/components/marketplace/checkout/ThankYouAccountCreate.svelte';
	import Tooltip from '$lib/components/marketplace/Tooltip.svelte';
	import TotalResume from '$lib/components/marketplace/checkout/TotalResume.svelte';

	// Icons
	import { Calendar, MapPoint, BuendiaComment, BuendiaCommentHollow } from '$lib/icons/Linear';

	let { data }: { data: PageData } = $props();

	// MeltComboBox
	const destinos = [
		{ value: 'madrid', label: 'Madrid' },
		{ value: 'barcelona', label: 'Barcelona' },
		{ value: 'sevilla', label: 'Sevilla' },
		{ value: 'valencia', label: 'Valencia' },
		{ value: 'granada', label: 'Granada' },
		{ value: 'toledo', label: 'Toledo' }
	];
	let comboSingle = $state<string | undefined>();
	let comboMultiple = $state<string[]>([]);

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

	// dayInfo demo: €30 en días de martes a sábado, lunes y domingos no disponibles
	function demoDayInfo(date: DateValue) {
		const dow = date.toDate('UTC').getUTCDay(); // 0=dom, 1=lun, ... 6=sáb
		if (dow === 0 || dow === 1) return { available: false };
		return { price: '€30' };
	}

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

	const calloutStyles = [
		'neutral',
		'success',
		'danger',
		'warning',
		'info',
		'editorial',
		'neutral-high',
		'success-high',
		'danger-high',
		'warning-high',
		'info-high',
		'editorial-high'
	] as const;

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

	type HighlightData = {
		icon?: string;
		title?: string;
		description?: string;
		boldTitle?: boolean;
		indent?: boolean;
		baseIcon?: boolean;
		size?: 'normal' | 'small';
	};

	const highlightVariants: HighlightData[] = [
		{ icon: 'RecordAudioCircle', title: 'Line 1' },
		{ icon: 'RecordAudioCircle', title: 'Line 1', boldTitle: true },
		{ icon: 'RecordAudioCircle', title: 'Line 1', description: 'Line 2' },
		{ icon: 'RecordAudioCircle', title: 'Line 1', description: 'Line 2', boldTitle: true },
		{ icon: 'RecordAudioCircle', title: 'Line 1', description: 'Line 2', indent: true },
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			indent: true,
			boldTitle: true
		},
		{ icon: 'RecordAudioCircle', title: 'Line 1', baseIcon: true },
		{ icon: 'RecordAudioCircle', title: 'Line 1', boldTitle: true, baseIcon: true },
		{ icon: 'RecordAudioCircle', title: 'Line 1', description: 'Line 2', baseIcon: true },
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			boldTitle: true,
			baseIcon: true
		},
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			indent: true,
			baseIcon: true
		},
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			indent: true,
			boldTitle: true,
			baseIcon: true
		},
		{ icon: 'RecordAudioCircle', title: 'Line 1', baseIcon: true, size: 'small' },
		{ icon: 'RecordAudioCircle', title: 'Line 1', boldTitle: true, baseIcon: true, size: 'small' },
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			baseIcon: true,
			size: 'small'
		},
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			boldTitle: true,
			baseIcon: true,
			size: 'small'
		},
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			indent: true,
			baseIcon: true,
			size: 'small'
		},
		{
			icon: 'RecordAudioCircle',
			title: 'Line 1',
			description: 'Line 2',
			indent: true,
			boldTitle: true,
			baseIcon: true,
			size: 'small'
		}
	];
</script>

<div class="wrapper">
	<CheckoutCard
		isBuendia={true}
		image="https://dummyimage.com/140x140/000/fff.jpg"
		title="Excursión a Sintra, Palacio da Pena, Quinta da Regaleira y Cabo da Roca desde Lisboa"
		rating={4.7}
		opinions={432}
		list={[
			{
				id: 'list1',
				icon: 'Ticket',
				text: 'Con entradas al Palacio da Pena y Quinta da Regaleira'
			},
			{
				id: 'list2',
				icon: 'User',
				text: '3 adultos'
			},
			{
				id: 'list3',
				icon: 'Calendar',
				text: 'Domingo, 20 de julio del 2026'
			},
			{
				id: 'list4',
				icon: 'ClockCircle',
				text: '11:00'
			}
		]}
		cancellation="Cancelación gratuita hasta el inicio de la actividad"
	/>

	<CheckoutCard
		isBuendia={true}
		disabled={true}
		image="https://dummyimage.com/140x140/000/fff.jpg"
		title="Excursión a Sintra, Palacio da Pena, Quinta da Regaleira y Cabo da Roca desde Lisboa"
		rating={4.7}
		opinions={432}
		list={[
			{
				id: 'list1',
				icon: 'Ticket',
				text: 'Con entradas al Palacio da Pena y Quinta da Regaleira'
			},
			{
				id: 'list2',
				icon: 'User',
				text: '3 adultos'
			},
			{
				id: 'list3',
				icon: 'Calendar',
				text: 'Domingo, 20 de julio del 2026'
			},
			{
				id: 'list4',
				icon: 'ClockCircle',
				text: '11:00'
			}
		]}
		cancellation="Cancelación gratuita hasta el inicio de la actividad"
	/>
</div>

<div class="wrapper mt-6">
	<TotalResume wrapperClass="mb-6" />
</div>

<div class="wrapper mt-6">
	<TotalResume inARow={true} />
</div>

<div class="wrapper mt-6">
	<Steps />
</div>

<div class="wrapper mt-6">
	<ThankYouAccountCreate
		title="Crea tu cuenta en buendía"
		description="Regístrate con un solo click. Tendrás acceso a la gestión de tu reserva desde tu Área personal y podrás disfrutar de ofertas exclusivas."
		buttonText="Registrarse"
		slug="/"
	/>
</div>

<div class="wrapper mt-6">
	<ThankYouAccountCreate
		title="Tu reserva está en tu área personal"
		description="Desde tu área personal podrás gestionar tu reserva siempre que quieras"
		buttonText="Ir a Área personal"
		buttonClass="e-button-secondary"
		slug="/"
	/>
</div>

<div class="wrapper mt-6">
	<div class="lg:max-w-[770px]">
		<ConfirmationHeroImg
			title="¡Todo listo para Lisboa!"
			subtitle="Reserva confirmada: BND-34059743"
			imgSrc="https://picsum.photos/600/338"
		>
			{#snippet actions()}
				<button type="button" class="e-button e-button-secondary relative">
					Añadir al calendario
				</button>
			{/snippet}
		</ConfirmationHeroImg>
	</div>
</div>

<div class="wrapper mt-6">
	<ActivityTips
		title="Consejos prácticos para el Free tour"
		items={[
			{
				icon: 'HandHeart',
				title: 'Tú pones el precio',
				description:
					'Tú decides cuánto pagar. Para orientarte: 10-15 € por persona es lo que suele darse.'
			},
			{
				icon: 'WatchRound',
				title: 'Llega con margen',
				description: 'Con 10 minutos de antelación tendrás tiempo de localizar al guía sin agobios.'
			},
			{
				icon: 'CalendarCheck',
				title: 'Si algo cambia, avísanos',
				description:
					'Aunque los free tours no requieren pago por adelantado, si no puedes asistir, te pedimos que liberes tu plaza, así otras personas podrán disfrutar de la experiencia si tú no puedes ir.'
			}
		]}
	/>
</div>

<div class="wrapper mt-6">
	<BuendiaComment class="size-5" />
	<BuendiaCommentHollow class="size-5" />
	<BuendiaComment class="size-6" />
	<BuendiaCommentHollow class="size-6" />
	<BuendiaComment class="size-12" />
	<BuendiaCommentHollow class="size-12" />
</div>

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
<!-- Checkbox & Radio -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Checkbox & Radio</h2>
	<div class="demo-check-grid">
		<div class="demo-header">Default</div>
		<div class="demo-header">Default ✓</div>
		<div class="demo-header">Small</div>
		<div class="demo-header">Small ✓</div>

		<div class="demo-row-label">Checkbox — fondo normal</div>
		<div class="demo-cell"><input type="checkbox" class="checkbox" /></div>
		<div class="demo-cell"><input type="checkbox" class="checkbox" checked /></div>
		<div class="demo-cell"><input type="checkbox" class="checkbox check--sm" /></div>
		<div class="demo-cell"><input type="checkbox" class="checkbox check--sm" checked /></div>

		<div class="demo-row-label">Checkbox — fondo alternativo</div>
		<div class="demo-cell demo-cell--alt"><input type="checkbox" class="checkbox" /></div>
		<div class="demo-cell demo-cell--alt"><input type="checkbox" class="checkbox" checked /></div>
		<div class="demo-cell demo-cell--alt"><input type="checkbox" class="checkbox check--sm" /></div>
		<div class="demo-cell demo-cell--alt">
			<input type="checkbox" class="checkbox check--sm" checked />
		</div>

		<div class="demo-row-label">Checkbox — disabled</div>
		<div class="demo-cell"><input type="checkbox" class="checkbox" disabled /></div>
		<div class="demo-cell"><input type="checkbox" class="checkbox" disabled checked /></div>
		<div class="demo-cell"><input type="checkbox" class="checkbox check--sm" disabled /></div>
		<div class="demo-cell">
			<input type="checkbox" class="checkbox check--sm" disabled checked />
		</div>

		<div class="demo-row-label">Radio — fondo normal</div>
		<div class="demo-cell"><input type="radio" class="radio" name="r1" /></div>
		<div class="demo-cell"><input type="radio" class="radio" name="r2" checked /></div>
		<div class="demo-cell"><input type="radio" class="radio check--sm" name="r3" /></div>
		<div class="demo-cell"><input type="radio" class="radio check--sm" name="r4" checked /></div>

		<div class="demo-row-label">Radio — fondo alternativo</div>
		<div class="demo-cell demo-cell--alt"><input type="radio" class="radio" name="r5" /></div>
		<div class="demo-cell demo-cell--alt">
			<input type="radio" class="radio" name="r6" checked />
		</div>
		<div class="demo-cell demo-cell--alt">
			<input type="radio" class="radio check--sm" name="r7" />
		</div>
		<div class="demo-cell demo-cell--alt">
			<input type="radio" class="radio check--sm" name="r8" checked />
		</div>

		<div class="demo-row-label">Radio — disabled</div>
		<div class="demo-cell"><input type="radio" class="radio" name="r9" disabled /></div>
		<div class="demo-cell"><input type="radio" class="radio" name="r10" disabled checked /></div>
		<div class="demo-cell"><input type="radio" class="radio check--sm" name="r11" disabled /></div>
		<div class="demo-cell">
			<input type="radio" class="radio check--sm" name="r12" disabled checked />
		</div>
	</div>
</div>

<!-- ============================================================ -->
<!-- MeltComboBox -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">MeltComboBox</h2>
	<div class="flex max-w-sm flex-col gap-6">
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Single — con icono</p>
			<MeltComboBox
				items={destinos}
				placeholder="Buscar destino..."
				icon={MapPoint}
				type="single"
				bind:value={comboSingle}
			/>
			{#if comboSingle}
				<p class="p-sm mt-2 text-gray-500">Seleccionado: <strong>{comboSingle}</strong></p>
			{/if}
		</div>
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Multiple — sin icono</p>
			<MeltComboBox
				items={destinos}
				placeholder="Seleccionar destinos..."
				bind:value={comboMultiple}
			/>
			{#if comboMultiple.length > 0}
				<p class="p-sm mt-2 text-gray-500">
					Seleccionados: <strong>{comboMultiple.join(', ')}</strong>
				</p>
			{/if}
		</div>
	</div>
</div>

<!-- ============================================================ -->
<!-- Select nativo -->
<!-- ============================================================ -->
<div class="wrapper mt-6">
	<h2 class="mb-4 font-semibold">Select nativo</h2>
	<div class="flex max-w-sm flex-col gap-6">
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Default</p>
			<select class="select">
				<option value="">Seleccionar destino...</option>
				{#each destinos as d (d.value)}
					<option value={d.value}>{d.label}</option>
				{/each}
			</select>
		</div>
		<div>
			<p class="p-sm mb-3 font-medium text-gray-400">Con valor seleccionado</p>
			<select class="select">
				<option value="madrid" selected>Madrid</option>
				{#each destinos as d (d.value)}
					<option value={d.value}>{d.label}</option>
				{/each}
			</select>
		</div>
	</div>
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

<div class="wrapper">
	<div class="grid grid-cols-6 gap-10">
		{#each highlightVariants as variant, i (i)}
			<Hightlight data={variant} />
		{/each}
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
	<MeltCalendar bind:value={calendarValue} dayInfo={demoDayInfo} />
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
			<MeltRangeCalendar bind:value={rangeValue} numberOfMonths={2} dayInfo={demoDayInfo} />
		</div>
	{/if}
</div>

<div class="grid grid-cols-6 gap-8">
	{#each calloutStyles as style (style)}
		<Callout
			{style}
			items={[
				{
					id: style,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				}
			]}
		/>
	{/each}

	{#each calloutStyles as style (style)}
		<Callout
			{style}
			size="small"
			items={[
				{
					id: `${style}-sm`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				}
			]}
		/>
	{/each}

	{#each calloutStyles as style (style)}
		<Callout
			{style}
			items={[
				{
					id: `${style}-b`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				}
			]}
		/>
	{/each}

	{#each calloutStyles as style (style)}
		<Callout
			{style}
			items={[
				{
					id: `${style}-1`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				},
				{
					id: `${style}-2`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				}
			]}
		/>
	{/each}

	{#each calloutStyles as style (style)}
		<Callout
			{style}
			size="small"
			items={[
				{
					id: `${style}-1`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				},
				{
					id: `${style}-2`,
					icon: 'InfoCircle',
					title: 'Callout title',
					description: 'Callout description text'
				}
			]}
		/>
	{/each}
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

<style>
	.demo-check-grid {
		display: grid;
		grid-template-columns: repeat(4, auto);
		gap: 1rem 1.5rem;
		align-items: center;
		justify-content: start;
	}

	.demo-row-label {
		grid-column: 1 / -1;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-neutral-600);
		margin-top: 0.75rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid var(--color-neutral-200);

		&:first-of-type {
			margin-top: 0;
		}
	}

	.demo-header {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-neutral-500);
		text-align: center;
	}

	.demo-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.5rem;

		&.demo-cell--alt {
			background-color: var(--color-neutral-200);
		}
	}
</style>
