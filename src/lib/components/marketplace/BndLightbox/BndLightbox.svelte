<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { AltArrowLeft, AltArrowRight, Close } from '$lib/icons/Linear';
	import type { Snippet } from 'svelte';
	import type { BndLightboxConfig, BndLightboxItem, BndLightboxItemContext } from '$lib/types';

	type Props = {
		id?: string;
		open?: boolean;
		config: BndLightboxConfig;
		cta?: Snippet;
		onopen?: (p: { categoryId: string; index: number }) => void;
		onclose?: (p: { categoryId: string; index: number }) => void;
		onchange?: (p: {
			categoryId: string;
			index: number;
			item: BndLightboxItem;
			direction: 'prev' | 'next';
		}) => void;
		ontabchange?: (p: { fromCategoryId: string; toCategoryId: string }) => void;
	};

	let {
		id: _id,
		open = $bindable(false),
		config,
		cta,
		onopen,
		onclose,
		onchange,
		ontabchange
	}: Props = $props();

	// Phase 2: activeCategoryId is state (not derived) so tabs can change it.
	// untrack: intentionally reads the initial config value only (reset on open via $effect).
	let activeCategoryId = $state(
		untrack(() => config.startCategory ?? config.categories[0]?.id ?? '')
	);
	const activeCategory = $derived(config.categories.find((c) => c.id === activeCategoryId));
	const items = $derived(activeCategory?.items ?? []);
	const isSingleCategory = $derived(config.categories.length <= 1);

	// currentIndex is initialized to 0; the sync $effect resets it to config.startIndex on open
	let currentIndex = $state(0);
	let imageLoading = $state(true);
	let imageError = $state(false);

	const currentItem = $derived(items[currentIndex]);
	const total = $derived(items.length);
	const isSingle = $derived(total <= 1);
	const hasCustomLayout = $derived(!!(activeCategory?.layout || activeCategory?.layoutComponent));
	const showTitleBar = $derived(
		!hasCustomLayout && (config.showTitle ?? true) && !!currentItem?.title
	);
	const canPrev = $derived(config.wrapAround === true ? total > 1 : currentIndex > 0);
	const canNext = $derived(config.wrapAround === true ? total > 1 : currentIndex < total - 1);

	// URLs for preloading adjacent images
	const prevSrc = $derived(items[(currentIndex - 1 + total) % total]?.src);
	const nextSrc = $derived(items[(currentIndex + 1) % total]?.src);

	// Per-category index memory (plain Map — no need for reactive state)
	const categoryIndexMap = new SvelteMap<string, number>();

	function switchCategory(newCategoryId: string) {
		if (newCategoryId === activeCategoryId) return;
		categoryIndexMap.set(activeCategoryId, currentIndex);
		const fromCategoryId = activeCategoryId;
		activeCategoryId = newCategoryId;
		currentIndex = categoryIndexMap.get(newCategoryId) ?? 0;
		imageLoading = true;
		imageError = false;
		ontabchange?.({ fromCategoryId, toCategoryId: newCategoryId });
	}

	// MeltUI Dialog (same sync pattern as MeltDrawer.svelte)
	const {
		elements: { overlay, content, title: titleEl, close: closeEl, portalled },
		states: { open: dialogOpen }
	} = untrack(() =>
		createDialog({
			forceVisible: true,
			onOpenChange: ({ next }) => {
				if (!next) onclose?.({ categoryId: activeCategoryId, index: currentIndex });
				open = next;
				return next;
			}
		})
	);

	// Sync external open prop → MeltUI state
	$effect(() => {
		if (open !== $dialogOpen) {
			if (open) {
				activeCategoryId = config.startCategory ?? config.categories[0]?.id ?? '';
				categoryIndexMap.clear();
				currentIndex = config.startIndex ?? 0;
				imageLoading = true;
				imageError = false;
				onopen?.({ categoryId: activeCategoryId, index: currentIndex });
			}
			dialogOpen.set(open);
		}
	});

	// Body scroll lock
	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	// Arrow key navigation
	$effect(() => {
		if (!browser || !open) return;
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'ArrowRight') goNext();
			else if (e.key === 'ArrowLeft') goPrev();
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	function goNext() {
		if (!canNext) return;
		currentIndex = config.wrapAround
			? (currentIndex + 1) % total
			: Math.min(currentIndex + 1, total - 1);
		imageLoading = true;
		imageError = false;
		onchange?.({
			categoryId: activeCategoryId,
			index: currentIndex,
			item: currentItem,
			direction: 'next'
		});
	}

	function goPrev() {
		if (!canPrev) return;
		currentIndex = config.wrapAround
			? (currentIndex - 1 + total) % total
			: Math.max(currentIndex - 1, 0);
		imageLoading = true;
		imageError = false;
		onchange?.({
			categoryId: activeCategoryId,
			index: currentIndex,
			item: currentItem,
			direction: 'prev'
		});
	}

	// Touch swipe
	let touchStartX = 0;
	const SWIPE_THRESHOLD = 50;

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function onTouchEnd(e: TouchEvent) {
		const delta = touchStartX - e.changedTouches[0].clientX;
		if (Math.abs(delta) < SWIPE_THRESHOLD) return;
		if (delta > 0) goNext();
		else goPrev();
	}

	function onImageLoad() {
		imageLoading = false;
		imageError = false;
	}

	function onImageError() {
		imageLoading = false;
		imageError = true;
	}

	// Type helper — context passed to layout snippets/components
	function itemContext(): BndLightboxItemContext {
		return { item: currentItem, index: currentIndex, total };
	}
</script>

{#if $dialogOpen}
	<div class="bnd-lightbox" use:melt={$portalled}>
		<!-- Overlay -->
		<div
			use:melt={$overlay}
			class="bnd-lightbox__overlay fixed inset-0"
			transition:fade={{ duration: 200 }}
		></div>

		<!-- Dialog content — flex column: top-bar / tabs / content / cta -->
		<div
			use:melt={$content}
			class="bnd-lightbox__content fixed inset-0 flex flex-col bg-white focus:outline-none"
			transition:fade={{ duration: 200 }}
			ontouchstart={onTouchStart}
			ontouchend={onTouchEnd}
		>
			<!-- Visually hidden title for screen readers -->
			<h2 use:melt={$titleEl} class="sr-only">Galería de imágenes</h2>

			<!-- Top bar: counter (left) + tabs (center) + close button (right) -->
			<div class="bnd-lightbox__top-bar flex shrink-0 items-stretch justify-between p-3 sm:p-6">
				{#if !isSingle}
					<span
						role="status"
						aria-live="polite"
						class="p-sm flex w-24 items-center text-neutral-500"
					>
						{currentIndex + 1} / {total}
					</span>
				{:else}
					<span class="w-24"></span>
				{/if}

				<!-- Tabs (center, visible only when there are multiple categories) -->
				{#if !isSingleCategory}
					<div class="bnd-lightbox__tabs flex items-stretch align-middle">
						<!-- Desktop: tab buttons -->
						<div class="hidden items-center gap-4 md:inline-flex">
							{#each config.categories as cat (cat.id)}
								<button
									type="button"
									onclick={() => switchCategory(cat.id)}
									aria-current={cat.id === activeCategoryId ? 'true' : undefined}
									class="bnd-lightbox__tab p-base flex h-6 cursor-pointer items-center gap-1.5 border-b-1 px-0 font-bold transition-colors
										{cat.id === activeCategoryId
										? 'bnd-lightbox__tab--active border-neutral-900 text-neutral-900'
										: 'border-transparent text-neutral-600 hover:text-neutral-700'}"
								>
									{cat.label} ({cat.items.length})
								</button>
							{/each}
						</div>
						<!-- Mobile: native select -->
						<select
							class="p-sm my-auto rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-neutral-800 outline-none sm:hidden"
							value={activeCategoryId}
							onchange={(e) => switchCategory(e.currentTarget.value)}
						>
							{#each config.categories as cat (cat.id)}
								<option value={cat.id}>{cat.label} ({cat.items.length})</option>
							{/each}
						</select>
					</div>
				{:else}
					<span></span>
				{/if}

				<div class="flex w-24 items-center justify-end">
					<button
						use:melt={$closeEl}
						aria-label="Cerrar lightbox"
						class="bnd-lightbox__close cursor-pointer rounded-full border border-neutral-300 p-2.75 text-neutral-700 transition-colors hover:bg-neutral-100"
					>
						<Close class="size-5" />
					</button>
				</div>
			</div>

			<!-- Content area: navigation + image (default) or custom layout -->
			<div class="flex min-h-0 flex-1 items-center justify-center">
				{#if hasCustomLayout}
					<!-- Custom layout: arrows + snippet/component (manages its own transitions) -->
					{#if !isSingle}
						<div class="hidden shrink-0 justify-center px-3 sm:flex sm:px-6">
							<button
								aria-label="Imagen anterior"
								disabled={!canPrev}
								onclick={goPrev}
								class="bnd-lightbox__nav bnd-lightbox__prev cursor-pointer rounded-full border border-neutral-300 bg-white p-2.75 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowLeft class="size-5" />
							</button>
						</div>
					{/if}
					<div class="h-full min-w-0 flex-1 overflow-auto">
						{#if activeCategory?.layoutComponent}
							{@const Layout = activeCategory.layoutComponent}
							<Layout ctx={itemContext()} />
						{:else if activeCategory?.layout}
							{@render activeCategory.layout(itemContext())}
						{/if}
					</div>
					{#if !isSingle}
						<div class="hidden shrink-0 justify-center px-3 sm:flex sm:px-6">
							<button
								aria-label="Imagen siguiente"
								disabled={!canNext}
								onclick={goNext}
								class="bnd-lightbox__nav bnd-lightbox__next cursor-pointer rounded-full border border-neutral-300 bg-white p-2.75 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowRight class="size-5" />
							</button>
						</div>
					{/if}
				{:else}
					<!-- Default layout: prev arrow + [image + title column] + next arrow -->

					<!-- Prev arrow -->
					{#if !isSingle}
						<div class="hidden shrink-0 justify-center px-3 sm:flex sm:px-6">
							<button
								aria-label="Imagen anterior"
								disabled={!canPrev}
								onclick={goPrev}
								class="bnd-lightbox__nav bnd-lightbox__prev cursor-pointer rounded-full border border-neutral-300 bg-white p-2.5 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowLeft class="size-5" />
							</button>
						</div>
					{/if}

					<!-- Image area -->
					<div class="relative min-h-0 flex-1 self-stretch">
						<!-- Spinner (outside key block so it doesn't participate in cross-fade) -->
						{#if imageLoading && !imageError}
							<div
								class="pointer-events-none absolute inset-0 flex items-center justify-center"
								transition:fade={{ duration: 150 }}
							>
								<div
									class="size-10 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-600"
								></div>
							</div>
						{/if}

						{#if imageError}
							<div class="p-sm absolute inset-0 flex items-center justify-center text-neutral-500">
								No se pudo cargar la imagen
							</div>
						{:else}
							<!-- {#key} fades image+title as a unit so title stays glued below the image -->
							{#key `${activeCategoryId}:${currentIndex}`}
								<div
									class="absolute inset-0 flex items-center justify-center p-4 sm:p-8"
									transition:fade={{ duration: 300 }}
								>
									<div class="flex max-h-full max-w-full flex-col items-center">
										<img
											src={currentItem?.src}
											alt={currentItem?.alt ?? ''}
											class="max-h-full min-h-0 max-w-full object-contain"
											onload={onImageLoad}
											onerror={onImageError}
										/>
										{#if showTitleBar}
											<div class="p-sm shrink-0 px-4 py-2 text-center text-neutral-700">
												{currentItem?.title}
											</div>
										{/if}
									</div>
								</div>
							{/key}
						{/if}
					</div>

					<!-- Next arrow -->
					{#if !isSingle}
						<div class="hidden shrink-0 justify-center px-3 sm:flex sm:px-6">
							<button
								aria-label="Imagen siguiente"
								disabled={!canNext}
								onclick={goNext}
								class="bnd-lightbox__nav bnd-lightbox__next cursor-pointer rounded-full border border-neutral-300 bg-white p-2.75 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowRight class="size-5" />
							</button>
						</div>
					{/if}
				{/if}
			</div>

			<!-- CTA bar (optional, always visible at the bottom) -->
			<div class="bnd-lightbox__cta min-h-16 shrink-0">
				{#if cta}
					{@render cta()}
				{/if}
			</div>
		</div>

		<!-- Preload adjacent images (hidden from users and a11y) -->
		{#if !isSingle && !hasCustomLayout}
			{#if prevSrc && prevSrc !== currentItem?.src}
				<img src={prevSrc} alt="" aria-hidden="true" class="hidden" />
			{/if}
			{#if nextSrc && nextSrc !== currentItem?.src}
				<img src={nextSrc} alt="" aria-hidden="true" class="hidden" />
			{/if}
		{/if}
	</div>
{/if}

<style>
	.bnd-lightbox__overlay {
		z-index: var(--bnd-lb-z, 999);
		background: var(--bnd-lb-overlay-bg, rgba(255, 255, 255, 0.95));
	}

	.bnd-lightbox__content {
		z-index: var(--bnd-lb-z, 999);
	}
</style>
