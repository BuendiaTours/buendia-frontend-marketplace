<script lang="ts">
	// Components
	import Calendar from '$lib/components/Calendar.svelte';
	import { openLightbox } from '$lib/components/PhotoSwipe';
	import SwiperElement from '$lib/components/Swiper.svelte';

	// Actions
	import { confirmAction } from '$lib/actions/confirmAction';
	import { photoswipeGallery } from '$lib/actions/photoswipeGallery';

	import { getLocalTimeZone, today } from '@internationalized/date';
	import { Activity, BubbleStar, Camera } from 'svelte-iconoir';

	// Range calendar
	import { RangeCalendar, type DateRange } from 'bits-ui';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';
	import cn from 'clsx';

	let rangeValue = $state<DateRange | undefined>();

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

	let value = $state(today(getLocalTimeZone()));
</script>

<h1>Componentes</h1>
<div class="max-w-xl">
	<p>
		Los <a href="https://daisyui.com/components/">componentes de DaisyUI</a> suelen tener menos JS y ser
		más sencillos de estilar
	</p>
	<p>
		Los componentes de <a href="https://www.bits-ui.com/docs/introduction">Bits UI</a> son más complejos
		siempre pensar si es necesario integrarlos, normalmente requiere más estilado y usan JS
	</p>
</div>

<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1" open>
	<summary class="collapse-title font-semibold">How do I create an account?</summary>
	<div class="collapse-content text-sm">
		Click the "Sign Up" button in the top right corner and follow the registration process.
	</div>
</details>
<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1">
	<summary class="collapse-title font-semibold">I forgot my password. What should I do?</summary>
	<div class="collapse-content text-sm">
		Click on "Forgot Password" on the login page and follow the instructions sent to your email.
	</div>
</details>
<details class="collapse border border-base-300 bg-base-100" name="my-accordion-det-1">
	<summary class="collapse-title font-semibold">How do I update my profile information?</summary>
	<div class="collapse-content text-sm">
		Go to "My Account" settings and select "Edit Profile" to make changes.
	</div>
</details>

<hr />

<p>Ejemplo de calendar de Bit UI</p>
<Calendar bind:value />

<hr />

<p>Ejemplo de importción de iconos de iconoir</p>
<Activity />
<BubbleStar />
<Camera />

<hr />

<h1>Ejemplo de form submit con confirmDialog</h1>

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

<hr />

<h1>Ejemplo de abrir PhotoSwiper desde prog.</h1>
<button class="btn btn-primary" onclick={() => openLightbox(lightboxItems, 0)}>
	Abrir lightbox
</button>

<hr />

<h1>Ejemplo de abrir PhotoSwiper desde imáges</h1>

<div use:photoswipeGallery class="pswp-gallery flex gap-4">
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
	>
		<img
			class="block h-48 w-48 object-cover"
			src="https://picsum.photos/id/239/200/200.jpg"
			alt="1"
		/>
	</a>
</div>

<hr />

<h1>Ejemplos de swiper</h1>

<SwiperElement
	className="max-w-[640px] h-[320px] bg-base-200"
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

<hr />

<h1>Ejemplo de RangeCalendar de bits-ui</h1>

<RangeCalendar.Root
	class="mt-6 rounded-box border border-base-content/10 bg-base-100 p-6 shadow-lg"
	weekdayFormat="short"
	fixedWeeks={true}
	bind:value={rangeValue}
	maxDays={99}
	numberOfMonths={2}
	pagedNavigation={true}
>
	{#snippet children({ months, weekdays })}
		<RangeCalendar.Header class="flex items-center justify-between">
			<RangeCalendar.PrevButton
				class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
			>
				<NavArrowLeft class="size-5" />
			</RangeCalendar.PrevButton>
			<RangeCalendar.Heading class="text-base font-semibold" />
			<RangeCalendar.NextButton
				class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
			>
				<NavArrowRight class="size-5" />
			</RangeCalendar.NextButton>
		</RangeCalendar.Header>
		<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
			{#each months as month (month.value.month)}
				<RangeCalendar.Grid class="w-full border-collapse space-y-1 select-none">
					<RangeCalendar.GridHead>
						<RangeCalendar.GridRow class="mb-2 flex w-full justify-between">
							{#each weekdays as day (day)}
								<RangeCalendar.HeadCell class="w-10 text-xs font-semibold opacity-60">
									<div>{day.slice(0, 2)}</div>
								</RangeCalendar.HeadCell>
							{/each}
						</RangeCalendar.GridRow>
					</RangeCalendar.GridHead>
					<RangeCalendar.GridBody>
						{#each month.weeks as weekDates, i (i)}
							<RangeCalendar.GridRow class="flex w-full">
								{#each weekDates as date, d (d)}
									<RangeCalendar.Cell
										{date}
										month={month.value}
										class="relative m-0 size-10 p-0! text-center text-sm focus-within:z-20"
									>
										<RangeCalendar.Day
											class={cn(
												'group rounded-btn relative inline-flex size-10 items-center justify-center border border-transparent bg-transparent p-0 text-sm font-normal transition-colors',
												'hover:bg-base-200',
												'data-disabled:pointer-events-none data-disabled:opacity-30',
												'data-outside-month:pointer-events-none data-outside-month:opacity-40',
												'data-unavailable:line-through',
												'data-selected:bg-primary/20 data-selected:font-semibold',
												'data-selection-start:bg-primary data-selection-start:font-bold data-selection-start:text-primary-content',
												'data-selection-end:bg-primary data-selection-end:font-bold data-selection-end:text-primary-content',
												'data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none'
											)}
										>
											<div
												class="absolute top-1 hidden size-1.5 rounded-full bg-primary group-data-selected:bg-primary group-data-today:block"
											></div>
											{date.day}
										</RangeCalendar.Day>
									</RangeCalendar.Cell>
								{/each}
							</RangeCalendar.GridRow>
						{/each}
					</RangeCalendar.GridBody>
				</RangeCalendar.Grid>
			{/each}
		</div>
	{/snippet}
</RangeCalendar.Root>
