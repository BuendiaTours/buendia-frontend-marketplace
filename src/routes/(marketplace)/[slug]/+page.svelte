<script lang="ts">
	// Types
	import type { PageData } from './$types';
	import type { ActivityCard as ActivityCardType } from '$lib/types';
	import {
		destinationActivitiesFiltersSchema,
		DESTINATION_ACTIVITIES_SORT_OPTIONS,
		type DestinationActivitiesFilters
	} from './schemas/filters.schema';
	import type { CriteriaSortOption } from '$core/_shared/enums';

	// Lib
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { format } from 'date-fns';
	import { patchFilters } from '$lib/utils/filters';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	// Components
	import ActivityCard from '$lib/components/marketplace/ActivityCard.svelte';
	import Breadcrumb from '$lib/components/marketplace/Breadcrumbs.svelte';
	import ByBuendiaBanner from '$lib/components/marketplace/ByBuendiaBanner.svelte';
	import ByBuendiaHighlights from '$lib/components/marketplace/ByBuendiaHighlights.svelte';
	import ContentBlockStack from '$lib/components/marketplace/ContentBlockStack.svelte';
	import FaqsInline from '$lib/components/marketplace/FaqsInline.svelte';
	import FiltersDialog from '$lib/components/marketplace/FiltersDialog.svelte';
	import GallerySquareThumbs from '$lib/components/marketplace/GallerySquareThumbs.svelte';
	import HeroImg from '$lib/components/marketplace/HeroImg.svelte';
	import MeltPagination from '$lib/components/marketplace/MeltPagination.svelte';
	import NewsletterRegistration from '$lib/components/marketplace/NewsletterRegistration.svelte';
	import PlpSwiper from '$lib/components/marketplace/plp/PlpSwiper.svelte';
	import PlpAttractionItem from '$lib/components/marketplace/plp/PlpAttractionItem.svelte';
	import ReviewCard from '$lib/components/marketplace/ReviewCard.svelte';
	import ScrollableTabBar from '$lib/components/marketplace/ScrollableTabBar.svelte';
	import Spacer from '$lib/components/marketplace/Spacer.svelte';
	import StarRating from '$lib/components/marketplace/StarRating.svelte';
	import WhyUsGrid from '$lib/components/marketplace/WhyUsGrid.svelte';
	import ContentBlockSingle from '$lib/components/marketplace/ContentBlockSingle.svelte';

	let { data }: { data: PageData } = $props();

	let accumulatedActivities = $state<ActivityCardType[]>(data.destinationActivities.slice());
	let loadedPage = $state(data.pagination?.page ?? 1);

	$effect(() => {
		accumulatedActivities = data.destinationActivities.slice();
		loadedPage = data.pagination?.page ?? 1;
	});

	const hasMore = $derived(loadedPage < (data.pagination?.totalPages ?? 1));

	const activeKind = $derived($page.url.searchParams.get('kind'));

	const currentSortValue = $derived(() => {
		const s = $page.url.searchParams.get('sort');
		const o = $page.url.searchParams.get('order');
		return s && o ? `${s}:${o}` : '';
	});

	async function loadMore() {
		const nextPage = loadedPage + 1;
		const params = new SvelteURLSearchParams({
			page: String(nextPage),
			pageSize: String(data.pagination?.pageSize ?? 12)
		});
		if (activeKind) params.set('kind', activeKind);
		const sort = $page.url.searchParams.get('sort');
		const order = $page.url.searchParams.get('order');
		if (sort) params.set('sort', sort);
		if (order) params.set('order', order);
		const res = await fetch(`/api/destinations/${data.destination.id}/activities?${params}`);
		const result = await res.json();
		for (const item of result.data) {
			accumulatedActivities.push(item);
		}
		loadedPage = nextPage;
	}

	function buildUrl(kind: string | null) {
		const newParams = patchFilters(destinationActivitiesFiltersSchema, $page.url.searchParams, {
			kind: kind ?? null
		});
		const qs = newParams.toString();
		return qs ? `${$page.url.pathname}?${qs}` : $page.url.pathname;
	}

	const tabs = $derived([
		{ id: 'all', name: 'Todo', href: buildUrl(null) },
		...data.activityKinds.map((k) => ({ id: k.id, name: k.name, href: buildUrl(k.id) }))
	]);

	const advancedFiltersConfig = [
		{ key: 'isFreeTour', label: 'Free Tour' },
		{ key: 'kidsFreeTour', label: 'Gratis para niños' },
		{ key: 'wheelchairAccessible', label: 'Accesible para sillas de ruedas' },
		{ key: 'breakfastIncluded', label: 'Desayuno incluido' },
		{ key: 'audioGuideAvailable', label: 'Audioguía disponible' },
		{ key: 'photographyAllowed', label: 'Fotografía permitida' },
		{ key: 'smallGroup', label: 'Grupo pequeño' }
	] as const;

	const BOOL_FILTER_KEYS = [
		'isFreeTour',
		'kidsFreeTour',
		'wheelchairAccessible',
		'breakfastIncluded',
		'audioGuideAvailable',
		'photographyAllowed',
		'smallGroup'
	] as const;

	const currentAdvancedFilters = $derived(
		Object.fromEntries(BOOL_FILTER_KEYS.map((k) => [k, data.filters[k] ?? false]))
	);

	function applyFilterPatch(patch: Partial<DestinationActivitiesFilters>) {
		const newParams = patchFilters(
			destinationActivitiesFiltersSchema,
			$page.url.searchParams,
			patch
		);
		goto(`?${newParams.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function handleFiltersApply(applied: Record<string, boolean>) {
		const patch: Partial<DestinationActivitiesFilters> = {};
		BOOL_FILTER_KEYS.forEach((k) => {
			patch[k] = applied[k] || undefined;
		});
		applyFilterPatch(patch);
	}

	function handleFiltersClear() {
		const patch: Partial<DestinationActivitiesFilters> = {};
		BOOL_FILTER_KEYS.forEach((k) => {
			patch[k] = undefined;
		});
		applyFilterPatch(patch);
	}
</script>

<div class="wrapper">
	<HeroImg
		wrapperClass=""
		imgObj={data.destination.image}
		title={`Qué hacer en ${data.destination.name}`}
	/>

	<div class="mt-6 mb-2">
		<Breadcrumb items={data.breadcrumbs} />
	</div>

	<div
		class="mb-4 flex flex-col items-end justify-between gap-2 sm:flex-row sm:items-center sm:gap-6"
	>
		<ScrollableTabBar {tabs} activeId={activeKind ?? 'all'} wrapperClass="w-full min-w-0 flex-1" />
		<div class="shrink-0">
			<FiltersDialog
				filters={advancedFiltersConfig}
				currentFilters={currentAdvancedFilters}
				onApply={handleFiltersApply}
				onClear={handleFiltersClear}
			/>
		</div>
	</div>

	<div class="mb-4 flex flex-row items-center justify-between gap-6">
		<span
			class="p-base max-w-[calc(100%-120px)] translate-y-[-52px] text-neutral-600 sm:translate-y-[0]"
			>Todas las actividades en {data.destination.name}&nbsp;({data.pagination?.total ?? 0})</span
		>
		<div class="hidden items-center gap-2 sm:flex">
			<span class="p-base whitespace-nowrap text-neutral-600">Ordenar por:</span>
			<select
				value={currentSortValue()}
				onchange={(e) => {
					const [sort, order] = e.currentTarget.value.split(':');
					const patch = {
						sort: (sort as 'rating' | 'price') || null,
						order: (order as CriteriaSortOption) || null
					};
					const newParams = patchFilters(
						destinationActivitiesFiltersSchema,
						$page.url.searchParams,
						patch
					);
					goto(`?${newParams.toString()}`, { replaceState: true, noScroll: true, keepFocus: true });
				}}
				class="select select-borderless"
				name="sort"
				id="sort"
			>
				{#each DESTINATION_ACTIVITIES_SORT_OPTIONS as opt (opt.value)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Activities grid -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each accumulatedActivities as activity (activity.id)}
			<ActivityCard
				item={activity}
				wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
			/>
		{/each}
	</div>

	<!-- Pagination -->
	{#if data.pagination}
		<MeltPagination
			count={data.pagination.total}
			perPage={data.pagination.pageSize}
			onPageChange={(n) => goto(`${$page.url.pathname}?page=${n}`)}
		/>
	{/if}

	{#if hasMore}
		<!--Cargar más -->
		<div class="my-8 flex justify-center">
			<button onclick={loadMore} class="e-button e-button-secondary">Cargar más actividades</button>
		</div>
	{/if}

	<Spacer wrapperClass="my-24" />

	<WhyUsGrid
		data={[
			{
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'Heart',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'BuendiaCommentHollow',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			},
			{
				icon: 'SmileCircle',
				title: '​Empresa mejor valorada del sector en Trustpilot',
				description: 'Nuestra media de satisfacción es de 4,7 sobre 5, con más 47,000 opiniones.'
			}
		]}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	/>

	<PlpSwiper
		swiperOptions={{
			slidesPerView: 'auto',
			spaceBetween: 16,
			navigation: true,
			loop: false
		}}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	>
		{#snippet header()}
			<h2 class="h2-editorial text-neutral-800">Atracciones en {data.destination.name}</h2>
		{/snippet}

		<!-- default slot -->
		{#each data.destination.attractions as attraction (attraction.id)}
			<swiper-slide
				class="bg-overlay relative aspect-[34/19] w-[340px] overflow-hidden rounded-xl sm:aspect-[340/314] lg:aspect-[392/314] lg:w-[392px]"
			>
				<PlpAttractionItem item={attraction} />
			</swiper-slide>
		{/each}
	</PlpSwiper>

	<PlpSwiper
		swiperOptions={{
			slidesPerView: 1.2,
			spaceBetween: 16,
			navigation: true,
			loop: false,
			breakpoints: {
				640: { slidesPerView: 2 },
				1024: { slidesPerView: 4 }
			}
		}}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	>
		{#snippet header()}
			<div
				class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center sm:gap-6"
			>
				<h2 class="h2-editorial text-neutral-800">Excuriones a Florencia desde Roma</h2>
				<a href="#" class="p-base cursor-pointer underline underline-offset-8"
					>Ver todas las excursiones</a
				>
			</div>
		{/snippet}
		{#each accumulatedActivities.slice(0, 5) as activity (activity.id)}
			<swiper-slide>
				<ActivityCard
					item={activity}
					wrapperClass="border-b border-solid border-neutral-200 pb-4 sm:p-3 sm:border sm:rounded-xl"
				/>
			</swiper-slide>
		{/each}
	</PlpSwiper>

	<h2 class="h2-editorial text-neutral-800">Busca el sello de Plan by buendía</h2>

	<p class="p-lg-editorial mt-2 text-neutral-800">
		Indica que esa actividad es un plan propio de buendía, creado por nosotros y con las mejores
		condiciones
	</p>

	<ByBuendiaBanner img={{ src: '/marketplace/CardPDP.jpg', alt: 'Plan ByBuendía' }}>
		<ByBuendiaHighlights
			data={{
				title: 'Plan by buendía',
				items: [
					{
						icon: 'CalendarCheck',
						title: 'Cancelación gratuita',
						description: 'Cancela sin coste hasta el incio de la actividad'
					},
					{
						icon: 'MoneyBack',
						title: 'Garantía de reembolso',
						description: 'Si no te gusta, te devolvemos el dinero. Sin explicaciones'
					},
					{
						icon: 'ChatRoundLine',
						title: 'Soporte humano antes, durante y después',
						description: 'Chat y teléfono para ayudarte en cualquier momento del proceso'
					}
				],
				link: {
					text: 'Saber más',
					src: 'https://google.es'
				}
			}}
			wrapperClass=""
		/>
	</ByBuendiaBanner>

	<!-- Reviews List -->
	{#if data.reviews && data.reviews.length > 0}
		<PlpSwiper
			id="plp-reviews"
			swiperOptions={{
				slidesPerView: 1.15,
				spaceBetween: 16,
				navigation: true,
				loop: false,
				breakpoints: {
					640: { slidesPerView: 1.8 },
					1024: { slidesPerView: 3 }
				}
			}}
			wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
		>
			{#snippet header()}
				<div class="flex flex-col">
					<h2 class="h2-editorial text-neutral-800">
						Reseñas de nuestros viajeros en {data.destination.name}
					</h2>
					<div class="mt-1 flex items-center">
						<StarRating single size="md" />
						<span class="p-lg font-bold">4.5</span>
						<span class="p-sm ml-2 text-neutral-600">Valoración media según XXX opiniones</span>
					</div>
				</div>
			{/snippet}
			{#each data.reviews as review (review.id)}
				<swiper-slide>
					<div
						class="flex h-full flex-col justify-between rounded-xl border border-[var(--color-border-default)] p-6 pb-6"
					>
						<ReviewCard
							name={review.user || 'Anónimo'}
							desc={review.createdAt ? format(new Date(review.createdAt), 'dd/MM/yyyy') : undefined}
							text={review.content}
							rating={review.averageRating}
							lines={3}
							{...review}
						/>

						{#if review.attachments && review.attachments.length > 0}
							<GallerySquareThumbs
								items={review.attachments.map((att) => ({ src: att.url.value }))}
								visibleCount={3}
								categoryId="review-{review.id}"
								containerClass="mt-auto pt-4"
								wrapperClass="plp-reviews__gallery gap-2"
								thumbClass="w-1/3"
							/>
						{/if}

						<div class="plp-reviews__about mt-4">
							<p class="p-base text-neutral-600">Opinión sobre</p>
							<a href="#" class="p-base cursor-pointer underline underline-offset-8"
								>Cena en el Trastévere</a
							>
						</div>
					</div>
				</swiper-slide>
			{/each}
		</PlpSwiper>
	{/if}

	<ContentBlockStack
		title="Los mejores planes para descubrir {data.destination.name}"
		items={data.destination.contentBlockStack}
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	/>

	<ContentBlockSingle
		title="Mi título"
		description="<p>Bilbao es una ciudad que combina tradición vasca, arquitectura contemporánea y un entorno natural que se disfruta en cualquier época del año. En esta selección encontrarás propuestas para descubrir la ciudad a través de su arte, su gastronomía y sus barrios más representativos. Una guía clara y práctica para organizar tu viaje, ya sea una primera escapada o una visita más pausada.</p><p>Podrás inspirarte con actividades diversas: recorrer el Museo Guggenheim, pasear por el casco viejo, disfrutar de la rutas de pintxos o acercarte a miradores y playas de la costa vizcaína. Si te preguntas qué hacer en Bilbao, aquí encontrarás ideas actualizadas y adaptadas a lo que más valoran quienes visitan la ciudad.</p><p>Bilbao destaca por su equilibrio entre cultura, paisaje y vida local. Este punto de partida te ayudará a diseñar un itinerario variado, combinando arte, gastronomía y visitas a sus rincones más emblemáticos.</p>"
		image="https://dummyimage.com/580x366/000/fff.jpg"
		wrapperClass="mt-12 mb-12 sm:mt-16 sm:mb-16 lg:mt-24 lg:mb-24"
	/>

	<FaqsInline
		title={data.destination.faqsTitle}
		faqs={data.destination.faqs}
		wrapperClass="mt-12 lg:my-23"
	/>

	<NewsletterRegistration />
</div>
