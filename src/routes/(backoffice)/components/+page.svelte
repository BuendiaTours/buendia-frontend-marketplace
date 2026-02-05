<script lang="ts">
	// Components
	import { openLightbox } from '$lib/components/PhotoSwipe';
	import SwiperElement from '$lib/components/Swiper.svelte';

	// Actions
	import { confirmAction } from '$lib/actions/confirmAction';
	import { photoswipeGallery } from '$lib/actions/photoswipeGallery';

	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Activity, BubbleStar, Camera } from 'svelte-iconoir';

	// Calendar - Probando versión Melt-UI
	import MeltCalendar from '$lib/components/MeltCalendar.svelte';
	let value = $state(today(getLocalTimeZone()));

	function handleCalendarChange(newValue: any) {
		console.log('Calendar value changed:', newValue);
		value = newValue;
	}

	// Tag
	import Tag from '$lib/components/Tag.svelte';

	// StarRating
	import StarRating from '$lib/components/StarRating.svelte';

	// Message Components
	import MsgMeltToast from '$lib/components/msg/MsgMeltToast.svelte';

	// Variable para acceder a la función addToast del componente
	let toastComponent: MsgMeltToast;

	// MeltDrawer
	import MeltDrawer from '$lib/components/MeltDrawer.svelte';
	let drawerLeftOpen = $state(false);
	let drawerRightOpen = $state(false);
	let drawerNoOverlayOpen = $state(false);

	// MeltDrawerManager
	import MeltDrawerManager from '$lib/components/MeltDrawerManager.svelte';
	let selectedItemId = $state<string | null>(null);

	// PureHtmlDialog
	import PureHtmlDialog from '$lib/components/PureHtmlDialog.svelte';
	let basicDialog: PureHtmlDialog;
	let modalDialog: PureHtmlDialog;
	let formDialog: PureHtmlDialog;
	let formResult = $state<string>('');

	// Mock data para ejemplo de MeltDrawerManager
	const mockItems = [
		{ id: '1', name: 'Producto A', description: 'Descripción del producto A', price: 29.99 },
		{ id: '2', name: 'Producto B', description: 'Descripción del producto B', price: 39.99 },
		{ id: '3', name: 'Producto C', description: 'Descripción del producto C', price: 49.99 },
		{ id: '4', name: 'Producto D', description: 'Descripción del producto D', price: 59.99 }
	];

	// Form Components
	import FormInputText from '$lib/components/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/forms/FormTextarea.svelte';
	import FormSelect from '$lib/components/forms/FormSelect.svelte';
	import FormInputSlug from '$lib/components/forms/FormInputSlug.svelte';
	import FormCheckboxGroup from '$lib/components/forms/FormCheckboxGroup.svelte';
	import FormTagManager from '$lib/components/forms/FormTagManager.svelte';
	import FormOrderedObjectList from '$lib/components/forms/FormOrderedObjectList.svelte';
	import FormTextareaMarkdown from '$lib/components/forms/FormTextareaMarkdown.svelte';

	// Range calendar - Probando versión Melt-UI
	import MeltRangeCalendar from '$lib/components/MeltRangeCalendar.svelte';
	import type { CreateRangeCalendarProps } from '@melt-ui/svelte';
	type DateRange = CreateRangeCalendarProps['defaultValue'];
	let rangeValue = $state<DateRange | undefined>({
		start: today(getLocalTimeZone()),
		end: today(getLocalTimeZone()).add({ days: 7 })
	});

	function handleRangeCalendarChange(newRange: DateRange | undefined) {
		console.log('📆 RangeCalendar - Rango seleccionado:', newRange);
		if (newRange?.start && newRange?.end) {
			console.log('📆 RangeCalendar - Inicio:', newRange.start.toString());
			console.log('📆 RangeCalendar - Fin:', newRange.end.toString());
			const days = newRange.end.compare(newRange.start);
			console.log('📆 RangeCalendar - Días seleccionados:', days);
		}
	}

	// Form examples states
	let formTextInput = $state('');
	let formTextarea = $state('');
	let formSelect = $state<string | undefined>(undefined);
	let formSlugSource = $state('Mi Título de Ejemplo');
	let formSlug = $state('');
	let formCheckboxItems = $state<any[]>([]);
	let formTags = $state<any[]>([]);
	let formOrderedItems = $state<any[]>([]);
	let formMarkdown = $state('# Título\n\nEscribe tu contenido en **Markdown** aquí...');

	// Mock data for form examples
	const mockCategories = [
		{ id: '1', name: 'Categoría 1' },
		{ id: '2', name: 'Categoría 2' },
		{ id: '3', name: 'Categoría 3' }
	];

	const mockTags = [
		{ id: '1', name: 'Tag 1' },
		{ id: '2', name: 'Tag 2' },
		{ id: '3', name: 'Tag 3' },
		{ id: '4', name: 'Tag 4' }
	];

	const mockSelectOptions = [
		{ id: 'option1', name: 'Opción 1' },
		{ id: 'option2', name: 'Opción 2' },
		{ id: 'option3', name: 'Opción 3' }
	];

	const mockOrderedItems = [
		{ id: '1', name: 'Item A' },
		{ id: '2', name: 'Item B' },
		{ id: '3', name: 'Item C' },
		{ id: '4', name: 'Item D' }
	];

	const lightboxItems = [
		{
			src: 'https://picsum.photos/800/600',
			width: 1600,
			height: 1200,
			alt: 'Imagen de ejemplo'
		},
		{
			html: `
				<iframe
					src="https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf"
					style="width:100%;height:100%;border:none"
				></iframe>
			`
		},
		{
			html: `
				<div style="padding:24px;max-width:720px">
					<h2>Contenido HTML</h2>
					<p>Esto es un bloque informativo sencillo.</p>
				</div>
			`
		}
	];
</script>

<h1 class="text-lg">Componentes</h1>

<p>
	Los <a href="https://daisyui.com/components/" class="link">componentes de DaisyUI</a> suelen tener menos
	JS y ser más sencillos de estilar
</p>
<p>
	Los componentes de <a href="https://melt-ui.com/docs/builders/combobox" class="link">Melt UI</a> son
	más complejos normalmente requiere más estilado y muchos usan JS
</p>

<div class="grid grid-cols-1 gap-4 md:grid-cols-12">
	<div class="md:col-span-4">
		<p>Navegación</p>
	</div>

	<div class="mt-6 md:col-span-8">
		<p>Componentes</p>

		<label class="label">Tags</label>
		<div class="card block p-4">
			<Tag>Svelte</Tag>
			<Tag class="badge-primary">TypeScript</Tag>
			<Tag class="badge-dash badge-lg badge-success">Large Success</Tag>
			<Tag class="badge-outline badge-info">Info Outline</Tag>
			<Tag
				name="tags[]"
				value="1"
				class="badge-outline badge-secondary"
				removable
				onremove={() => console.log('removed')}>Form Tag</Tag
			>
			<Tag class="badge-primary" removable onremove={() => console.log('removed')}>Removable</Tag>
		</div>

		<label class="label mt-4">Accordion sencillo de DaisyUI</label>
		<div class="card block space-y-2 p-4">
			<details
				class="collapse-arrow border-base-content/9 bg-base-100 collapse border"
				name="my-accordion-det-1"
				open
			>
				<summary class="collapse-title font-semibold">How do I create an account?</summary>
				<div class="collapse-content text-sm">
					Click the "Sign Up" button in the top right corner and follow the registration process.
				</div>
			</details>
			<details
				class="collapse-arrow border-base-content/9 bg-base-100 collapse border"
				name="my-accordion-det-1"
			>
				<summary class="collapse-title font-semibold"
					>I forgot my password. What should I do?</summary
				>
				<div class="collapse-content text-sm">
					Click on "Forgot Password" on the login page and follow the instructions sent to your
					email.
				</div>
			</details>
			<details
				class="collapse-arrow border-base-content/9 bg-base-100 collapse border"
				name="my-accordion-det-1"
			>
				<summary class="collapse-title font-semibold">Can I change my email address?</summary>
				<div class="collapse-content text-sm">
					Yes, go to your profile settings and update your email address.
				</div>
			</details>
		</div>
		<label class="label mt-4">Ejemplo de importación de iconos de iconoir</label>
		<div class="card flex flex-row gap-4 p-4">
			<Activity />
			<BubbleStar />
			<Camera />
		</div>

		<label class="label mt-4">Ejemplo de form submit con confirmDialog</label>
		<div class="align-center card flex-row justify-center p-4">
			<form action="/no-existe" method="get">
				<button
					type="submit"
					class="btn btn-outline btn-error"
					use:confirmAction={{
						title: 'Eliminar',
						message: '¿Seguro que quieres eliminar este elemento?',
						confirmText: 'Eliminar',
						cancelText: 'Cancelar',
						danger: true
					}}
				>
					Eliminar
				</button>
			</form>
		</div>

		<label class="label mt-4">Ejemplo de abrir PhotoSwiper desde prog.</label>
		<div class="align-center card flex-row justify-center p-4">
			<button class="btn btn-primary" onclick={() => openLightbox(lightboxItems, 0)}>
				Abrir lightbox
			</button>
		</div>

		<label class="label mt-4">Ejemplo de abrir PhotoSwiper desde imáges</label>
		<div use:photoswipeGallery class="align-center card flex-row items-center gap-4 p-4">
			<a
				href="https://picsum.photos/id/237/800/600.jpg"
				data-pswp-width="800"
				data-pswp-height="600"
				target="_blank"
				rel="noreferrer"
				class="block overflow-hidden rounded-lg"
			>
				<img
					class="block h-48 w-48 object-cover"
					src="https://picsum.photos/id/237/200/200.jpg"
					alt="Photo 1"
				/>
			</a>
			<a
				href="https://picsum.photos/id/238/800/600.jpg"
				data-pswp-width="800"
				data-pswp-height="600"
				target="_blank"
				rel="noreferrer"
				class="block overflow-hidden rounded-lg"
			>
				<img
					class="block h-48 w-48 object-cover"
					src="https://picsum.photos/id/238/200/200.jpg"
					alt="Photo 1"
				/>
			</a>
			<a
				href="https://picsum.photos/id/239/800/600.jpg"
				data-pswp-width="800"
				data-pswp-height="600"
				target="_blank"
				rel="noreferrer"
				class="block overflow-hidden rounded-lg"
			>
				<img
					class="block h-48 w-48 object-cover"
					src="https://picsum.photos/id/239/200/200.jpg"
					alt="1"
				/>
			</a>
		</div>

		<label class="label mt-4">Ejemplos de swiper</label>
		<SwiperElement
			className="card p-4 max-w-[640px] h-[320px] bg-base-200"
			options={{
				slidesPerView: 1,
				spaceBetween: 16,
				navigation: true,
				pagination: { clickable: true },
				// scrollbar: { draggable: true },
				loop: true
			}}
		>
			<swiper-slide class="flex min-h-48 items-center justify-center">Slide 1</swiper-slide>
			<swiper-slide class="flex min-h-48 items-center justify-center">Slide 2</swiper-slide>
			<swiper-slide class="flex min-h-48 items-center justify-center">Slide 3</swiper-slide>
		</SwiperElement>

		<label class="label mt-4">Otro ejemplo de swiper</label>
		<SwiperElement
			className="max-w-[640px] h-[320px] bg-base-200 rounded-lg overflow-hidden mt-6"
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

		<label class="label mt-4">Ejemplo de Calendar de melt-ui</label>
		<p class="text-sm opacity-70">Selecciona una fecha y revisa la consola del navegador</p>
		<div class="card p-4">
			<MeltCalendar bind:value onValueChange={handleCalendarChange} />
		</div>

		<label class="label mt-4">Ejemplo de RangeCalendar de melt-ui</label>
		<p class="text-sm opacity-70">
			Selecciona un rango de fechas y revisa la consola del navegador
		</p>

		<MeltRangeCalendar
			bind:value={rangeValue}
			onValueChange={handleRangeCalendarChange}
			numberOfMonths={2}
		/>

		<label class="label mt-8">Ejemplo de StarRating</label>
		<p class="text-sm opacity-70">
			Componente de valoración con estrellas que redondea automáticamente a medias estrellas
		</p>
		<div class="card space-y-4 p-4">
			<div class="flex items-center gap-4">
				<span class="w-20 text-sm">4.5 stars:</span>
				<StarRating value={4.5} size="md" filledClass="bg-orange-400" emptyClass="bg-base-300" />
			</div>
			<div class="flex items-center gap-4">
				<span class="w-20 text-sm">3.2 stars:</span>
				<StarRating value={3.2} size="sm" filledClass="bg-orange-400" emptyClass="bg-base-300" />
			</div>
			<div class="flex items-center gap-4">
				<span class="w-20 text-sm">5.0 stars:</span>
				<StarRating value={5.0} size="lg" filledClass="bg-orange-400" emptyClass="bg-base-300" />
			</div>
			<div class="flex items-center gap-4">
				<span class="w-20 text-sm">null:</span>
				<StarRating value={null} />
			</div>
		</div>

		<h2 class="mt-8 text-xl font-bold">Componentes de Formulario</h2>

		<label class="label mt-4">Ejemplo de FormInputText</label>
		<p class="text-sm opacity-70">Campo de texto reutilizable con label, error y badge</p>
		<div class="card p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<FormInputText
					id="example-text"
					label="Campo de texto"
					bind:value={formTextInput}
					placeholder="Escribe algo..."
				/>
				<FormInputText
					id="example-number"
					label="Campo numérico"
					type="number"
					bind:value={formTextInput}
					placeholder="0"
					badge="opcional"
				/>
				<FormInputText
					id="example-readonly"
					label="Campo solo lectura"
					value="Valor readonly"
					badge="read only"
					readonly
					wrapperClass="md:col-span-2"
				/>
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormTextarea</label>
		<p class="text-sm opacity-70">Campo de texto multilínea con configuración de filas</p>
		<div class="card p-4">
			<FormTextarea
				id="example-textarea"
				label="Descripción"
				bind:value={formTextarea}
				rows={4}
				placeholder="Escribe una descripción..."
			/>
		</div>

		<label class="label mt-4">Ejemplo de FormSelect</label>
		<p class="text-sm opacity-70">Select con opciones estáticas o desde API</p>
		<div class="card p-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<FormSelect
					id="example-select"
					label="Selecciona una opción"
					bind:value={formSelect}
					options={mockSelectOptions}
					placeholder="Elige..."
				/>
				<FormSelect
					id="example-select-badge"
					label="Con badge"
					bind:value={formSelect}
					options={mockSelectOptions}
					badge="requerido"
				/>
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormInputSlug</label>
		<p class="text-sm opacity-70">Campo de slug con generación automática desde otro campo</p>
		<div class="card p-4">
			<div class="space-y-4">
				<FormInputText
					id="example-slug-source"
					label="Título (fuente)"
					bind:value={formSlugSource}
					placeholder="Escribe un título..."
				/>
				<FormInputSlug
					id="example-slug"
					label="Slug (generado)"
					bind:value={formSlug}
					sourceValue={formSlugSource}
					generateTooltip="Genera slug desde el título"
				/>
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormCheckboxGroup</label>
		<p class="text-sm opacity-70">Grupo de checkboxes para selección múltiple</p>
		<div class="card p-4">
			<FormCheckboxGroup
				main_label="Selecciona categorías"
				id="example-checkboxes"
				name="categories[]"
				key_title="name"
				key_value="id"
				bind:items={formCheckboxItems}
				availableItems={mockCategories}
			/>
			<div class="mt-4 text-sm">
				<strong>Seleccionados:</strong>
				{formCheckboxItems.length > 0 ? formCheckboxItems.map((c) => c.name).join(', ') : 'Ninguno'}
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormTagManager</label>
		<p class="text-sm opacity-70">Gestor de tags con combobox y visualización de tags</p>
		<div class="card p-4">
			<FormTagManager
				id="example-tags"
				label="Tags"
				bind:tags={formTags}
				availableTags={mockTags}
				placeholder="Añade un tag"
			/>
			<div class="mt-4 text-sm">
				<strong>Tags seleccionados:</strong>
				{formTags.length > 0 ? formTags.map((t) => t.name).join(', ') : 'Ninguno'}
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormOrderedObjectList</label>
		<p class="text-sm opacity-70">Lista ordenable con drag & drop</p>
		<div class="card p-4">
			<FormOrderedObjectList
				id="example-ordered"
				label="Items ordenables"
				bind:items={formOrderedItems}
				availableItems={mockOrderedItems}
				placeholder="Selecciona un item..."
				emptyMessage="No hay items en la lista"
			/>
			<div class="mt-4 text-sm">
				<strong>Orden actual:</strong>
				{formOrderedItems.length > 0
					? formOrderedItems.map((item) => item.name).join(' → ')
					: 'Ninguno'}
			</div>
		</div>

		<label class="label mt-4">Ejemplo de FormTextareaMarkdown</label>
		<p class="text-sm opacity-70">Editor Markdown con preview (ByteMD)</p>
		<div class="card p-4">
			<FormTextareaMarkdown
				id="example-markdown"
				label="Contenido en Markdown"
				bind:value={formMarkdown}
			/>
		</div>

		<label class="label mt-4">Ejemplo de MeltDrawer</label>
		<p class="text-sm opacity-70">Panel lateral deslizable con Melt-UI</p>
		<div class="card p-4">
			<div class="flex flex-wrap gap-2">
				<button
					class="btn btn-sm btn-primary"
					onclick={() => {
						drawerLeftOpen = true;
					}}
				>
					Abrir Drawer Izquierdo
				</button>
				<button
					class="btn btn-sm btn-secondary"
					onclick={() => {
						drawerRightOpen = true;
					}}
				>
					Abrir Drawer Derecho
				</button>
				<button
					class="btn btn-sm btn-accent"
					onclick={() => {
						drawerNoOverlayOpen = true;
					}}
				>
					Abrir Sin Overlay
				</button>
			</div>
			<p class="mt-4 text-xs opacity-60">
				Los drawers se pueden configurar para abrirse desde la izquierda o derecha, con o sin
				overlay
			</p>
		</div>

		<label class="label mt-4">Ejemplo de MeltDrawerManager</label>
		<p class="text-sm opacity-70">
			Wrapper para gestionar drawers dinámicos con listas de items (automáticamente maneja
			animaciones y estado)
		</p>
		<div class="card p-4">
			<p class="mb-4 text-sm">
				Este componente simplifica el uso de drawers con listas dinámicas. Encapsula toda la lógica
				de sincronización y delay de animación.
			</p>
			<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
				{#each mockItems as item}
					<button
						class="btn btn-outline btn-sm"
						onclick={() => {
							selectedItemId = item.id;
						}}
					>
						Ver {item.name}
					</button>
				{/each}
			</div>
			<p class="mt-4 text-xs opacity-60">
				Ideal para listados, tablas o grids donde cada item tiene un botón "Ver detalles". Solo se
				renderiza el drawer del item seleccionado.
			</p>
		</div>

		<label class="label mt-4">Ejemplo de MsgMeltToast</label>
		<p class="text-sm opacity-70">Notificaciones toast usando Melt-UI</p>
		<div class="card p-4">
			<div class="flex flex-wrap gap-2">
				<button
					class="btn btn-sm btn-info"
					onclick={() => {
						toastComponent?.addToast({
							data: {
								title: 'Info',
								description: 'Esta es una notificación informativa',
								type: 'info'
							}
						});
					}}
				>
					Mostrar Info
				</button>
				<button
					class="btn btn-sm btn-success"
					onclick={() => {
						toastComponent?.addToast({
							data: {
								title: 'Success',
								description: '¡Operación completada con éxito!',
								type: 'success'
							}
						});
					}}
				>
					Mostrar Success
				</button>
				<button
					class="btn btn-sm btn-warning"
					onclick={() => {
						toastComponent?.addToast({
							data: {
								title: 'Warning',
								description: 'Por favor, revisa esta información',
								type: 'warning'
							}
						});
					}}
				>
					Mostrar Warning
				</button>
				<button
					class="btn btn-sm btn-error"
					onclick={() => {
						toastComponent?.addToast({
							data: {
								title: 'Error',
								description: 'Ha ocurrido un error en la operación',
								type: 'error'
							}
						});
					}}
				>
					Mostrar Error
				</button>
			</div>
			<p class="mt-4 text-xs opacity-60">
				Los toasts aparecerán en la esquina superior derecha y se pueden cerrar manualmente
			</p>
		</div>

		<label class="label mt-4">PureHtmlDialog - Diálogo HTML Nativo</label>
		<p class="text-sm opacity-70">
			Componente basado en el elemento <code>&lt;dialog&gt;</code> estándar de HTML5 con estilos de Tailwind
			y DaisyUI. Incluye soporte para modal/no-modal, backdrop personalizable, y gestión automática de
			accesibilidad.
		</p>
		<div class="card flex flex-row gap-2 p-4">
			<div>
				<label class="label">Ejemplo 1: Diálogo Modal Básico</label>
				<p class="mb-4 text-sm opacity-70">
					Diálogo modal con título, contenido y acciones. Se cierra con ESC o click fuera.
				</p>
				<button class="btn btn-primary" onclick={() => modalDialog.showModal()}>
					Abrir Diálogo Modal
				</button>
			</div>

			<div>
				<label class="label">Ejemplo 2: Diálogo No-Modal</label>
				<p class="mb-4 text-sm opacity-70">
					Diálogo no-modal que permite interacción con el resto de la página.
				</p>
				<button class="btn btn-secondary" onclick={() => basicDialog.show()}>
					Abrir Diálogo No-Modal
				</button>
			</div>

			<div>
				<label class="label">Ejemplo 3: Diálogo con Formulario</label>
				<p class="mb-4 text-sm opacity-70">
					Formulario dentro del diálogo usando <code>method="dialog"</code> para cerrar automáticamente
					al enviar.
				</p>
				<button class="btn btn-accent" onclick={() => formDialog.showModal()}>
					Abrir Formulario
				</button>
			</div>

			{#if formResult}
				<div class="alert alert-success mt-4">
					<span>Formulario enviado con: <strong>{formResult}</strong></span>
				</div>
			{/if}
		</div>
	</div>
</div>

<MsgMeltToast bind:this={toastComponent} />

<MeltDrawer bind:open={drawerLeftOpen} title="Drawer Izquierdo" config={{ side: 'left' }}>
	<div class="space-y-4">
		<p>Este es un drawer que se abre desde la izquierda.</p>
		<p class="text-sm opacity-70">
			Puedes incluir cualquier contenido HTML aquí: formularios, listas, imágenes, etc.
		</p>
		<div class="bg-base-200 rounded-lg p-4">
			<h3 class="mb-2 font-semibold">Ejemplo de contenido</h3>
			<ul class="list-inside list-disc space-y-1 text-sm">
				<li>Item 1</li>
				<li>Item 2</li>
				<li>Item 3</li>
			</ul>
		</div>
		<button class="btn btn-primary btn-sm" onclick={() => (drawerLeftOpen = false)}>
			Cerrar Drawer
		</button>
	</div>
</MeltDrawer>

<MeltDrawer
	bind:open={drawerRightOpen}
	title="Drawer Derecho"
	config={{ side: 'right', width: 400 }}
>
	<div class="space-y-4">
		<p>Este drawer se abre desde la derecha y tiene un ancho personalizado de 400px.</p>
		<div class="bg-primary/10 rounded-lg p-4">
			<h3 class="text-primary mb-2 font-semibold">Configuración</h3>
			<code class="text-xs">
				{JSON.stringify({ side: 'right', width: 400 }, null, 2)}
			</code>
		</div>
		<p class="text-sm opacity-70">
			El drawer se puede cerrar haciendo clic en el botón X, presionando ESC, o haciendo clic fuera
			del drawer.
		</p>
	</div>
</MeltDrawer>

<MeltDrawer
	bind:open={drawerNoOverlayOpen}
	title="Sin Overlay"
	config={{ side: 'right', showOverlay: false, closeOnOutsideClick: false }}
>
	<div class="space-y-4">
		<p>Este drawer no tiene overlay de fondo y no se cierra al hacer clic fuera.</p>
		<div class="alert alert-info">
			<span class="text-sm">
				Útil para paneles de herramientas o configuraciones que el usuario puede querer mantener
				abiertos mientras interactúa con el contenido principal.
			</span>
		</div>
		<button class="btn btn-outline btn-sm" onclick={() => (drawerNoOverlayOpen = false)}>
			Cerrar
		</button>
	</div>
</MeltDrawer>

<MeltDrawerManager
	bind:selectedId={selectedItemId}
	items={mockItems}
	title={(item) => `Detalles de ${item.name}`}
	config={{ side: 'right', width: 450 }}
>
	{#snippet content(item)}
		<div class="space-y-4">
			<div class="bg-base-200 rounded-lg p-4">
				<h3 class="mb-2 font-semibold">{item.name}</h3>
				<p class="text-sm opacity-80">{item.description}</p>
			</div>
			<div class="stats shadow">
				<div class="stat">
					<div class="stat-title">Precio</div>
					<div class="stat-value text-primary">${item.price}</div>
				</div>
			</div>
			<div class="alert alert-info">
				<span class="text-sm">
					Este drawer se gestiona automáticamente con MeltDrawerManager. No necesitas manejar
					estados ni animaciones manualmente.
				</span>
			</div>
		</div>
	{/snippet}
</MeltDrawerManager>

<!-- Diálogo Modal Básico -->
<PureHtmlDialog bind:this={modalDialog} title="Diálogo Modal">
	{#snippet content()}
		<div class="space-y-4">
			<p>Este es un diálogo modal que bloquea la interacción con el resto de la página.</p>
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>Puedes cerrarlo con ESC, click fuera, o el botón de cerrar.</span>
			</div>
			<ul class="list-inside list-disc space-y-2">
				<li>Usa el elemento <code>&lt;dialog&gt;</code> nativo</li>
				<li>Backdrop con <code>::backdrop</code> CSS</li>
				<li>Accesibilidad integrada (focus trap, ARIA)</li>
				<li>Animaciones CSS suaves</li>
			</ul>
		</div>
	{/snippet}
	{#snippet actions()}
		<button class="btn btn-ghost" onclick={() => modalDialog.close()}>Cancelar</button>
		<button class="btn btn-primary" onclick={() => modalDialog.close()}>Aceptar</button>
	{/snippet}
</PureHtmlDialog>

<!-- Diálogo No-Modal -->
<PureHtmlDialog
	bind:this={basicDialog}
	title="Diálogo No-Modal"
	config={{ modal: false, closeOnBackdrop: false }}
>
	{#snippet content()}
		<div class="space-y-4">
			<p>Este es un diálogo no-modal. Puedes interactuar con el resto de la página.</p>
			<div class="alert alert-warning">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
				<span>No tiene backdrop y no bloquea la interacción.</span>
			</div>
		</div>
	{/snippet}
	{#snippet actions()}
		<button class="btn btn-primary" onclick={() => basicDialog.close()}>Cerrar</button>
	{/snippet}
</PureHtmlDialog>

<!-- Diálogo con Formulario -->
<PureHtmlDialog bind:this={formDialog} title="Formulario de Contacto">
	{#snippet content()}
		<form
			method="dialog"
			class="space-y-4"
			onsubmit={(e) => {
				const formData = new FormData(e.currentTarget);
				formResult = formData.get('name') as string;
			}}
		>
			<div class="form-control">
				<label class="label" for="dialog-name">
					<span class="label-text">Nombre</span>
				</label>
				<input
					id="dialog-name"
					type="text"
					name="name"
					placeholder="Tu nombre"
					class="input input-bordered"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="dialog-email">
					<span class="label-text">Email</span>
				</label>
				<input
					id="dialog-email"
					type="email"
					name="email"
					placeholder="tu@email.com"
					class="input input-bordered"
					required
				/>
			</div>

			<div class="form-control">
				<label class="label" for="dialog-message">
					<span class="label-text">Mensaje</span>
				</label>
				<textarea
					id="dialog-message"
					name="message"
					placeholder="Tu mensaje"
					class="textarea textarea-bordered"
					rows="3"
					required
				></textarea>
			</div>

			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span class="text-sm">
					El formulario usa <code>method="dialog"</code> para cerrar automáticamente al enviar.
				</span>
			</div>

			<div class="flex justify-end gap-2 pt-4">
				<button type="button" class="btn btn-ghost" onclick={() => formDialog.close()}>
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary">Enviar</button>
			</div>
		</form>
	{/snippet}
</PureHtmlDialog>
