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
				class="collapse border border-base-content/9 bg-base-100"
				name="my-accordion-det-1"
				open
			>
				<summary class="collapse-title font-semibold">How do I create an account?</summary>
				<div class="collapse-content text-sm">
					Click the "Sign Up" button in the top right corner and follow the registration process.
				</div>
			</details>
			<details class="collapse border border-base-content/9 bg-base-100" name="my-accordion-det-1">
				<summary class="collapse-title font-semibold"
					>I forgot my password. What should I do?</summary
				>
				<div class="collapse-content text-sm">
					Click on "Forgot Password" on the login page and follow the instructions sent to your
					email.
				</div>
			</details>
			<details class="collapse border border-base-content/9 bg-base-100" name="my-accordion-det-1">
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
	</div>
</div>
