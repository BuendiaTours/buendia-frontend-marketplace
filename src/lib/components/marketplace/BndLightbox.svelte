<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { AltArrowLeft, AltArrowRight, Close } from '$lib/icons/Linear';
	import type { BndLightboxConfig, BndLightboxItem, BndLightboxItemContext } from '$lib/types';

	type Props = {
		id?: string;
		open?: boolean;
		config: BndLightboxConfig;
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
	const showTitleBar = $derived(
		!activeCategory?.layout && (config.showTitle ?? true) && !!currentItem?.title
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

	// Type helper — context passed to layout snippets
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

		<!-- Dialog content — flex column: top-bar / tabs / content / title-bar -->
		<div
			use:melt={$content}
			class="bnd-lightbox__content fixed inset-0 flex flex-col focus:outline-none"
			ontouchstart={onTouchStart}
			ontouchend={onTouchEnd}
		>
			<!-- Visually hidden title for screen readers -->
			<h2 use:melt={$titleEl} class="sr-only">Galería de imágenes</h2>

			<!-- Top bar: counter (left) + close button (right) -->
			<div class="flex shrink-0 items-center justify-between px-4 py-3">
				{#if !isSingle}
					<span role="status" aria-live="polite" class="bnd-lightbox__counter p-sm">
						{currentIndex + 1} de {total}
					</span>
				{:else}
					<span></span>
				{/if}

				<button
					use:melt={$closeEl}
					aria-label="Cerrar lightbox"
					class="bnd-lightbox__close cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20"
				>
					<Close class="size-6" />
				</button>
			</div>

			<!-- Tabs (visible only when there are multiple categories) -->
			{#if !isSingleCategory}
				<div class="bnd-lightbox__tabs flex shrink-0 items-center gap-1 px-4 pb-2">
					<!-- Desktop: tab buttons -->
					<div class="hidden gap-1 sm:flex">
						{#each config.categories as cat (cat.id)}
							<button
								onclick={() => switchCategory(cat.id)}
								aria-current={cat.id === activeCategoryId ? 'true' : undefined}
								class="bnd-lightbox__tab p-sm rounded-full px-4 py-1.5 font-medium transition-colors
									{cat.id === activeCategoryId
									? 'bnd-lightbox__tab--active bg-white text-black'
									: 'text-white/70 hover:bg-white/20 hover:text-white'}"
							>
								{cat.label}
							</button>
						{/each}
					</div>
					<!-- Mobile: native select -->
					<select
						class="bnd-lightbox__tab-select p-sm rounded-lg bg-white/20 px-3 py-1.5 text-white outline-none sm:hidden"
						value={activeCategoryId}
						onchange={(e) => switchCategory(e.currentTarget.value)}
					>
						{#each config.categories as cat (cat.id)}
							<option value={cat.id} class="text-black">{cat.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Content area: navigation + image (default) or custom layout -->
			<div class="flex min-h-0 flex-1 items-center justify-center">
				{#if activeCategory?.layout}
					<!-- Custom layout: arrows + snippet (snippet manages its own transitions) -->
					{#if !isSingle}
						<div class="flex w-16 shrink-0 justify-center">
							<button
								aria-label="Imagen anterior"
								disabled={!canPrev}
								onclick={goPrev}
								class="bnd-lightbox__nav cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowLeft class="size-8" />
							</button>
						</div>
					{/if}
					<div class="h-full min-w-0 flex-1 overflow-auto">
						{@render activeCategory.layout(itemContext())}
					</div>
					{#if !isSingle}
						<div class="flex w-16 shrink-0 justify-center">
							<button
								aria-label="Imagen siguiente"
								disabled={!canNext}
								onclick={goNext}
								class="bnd-lightbox__nav cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowRight class="size-8" />
							</button>
						</div>
					{/if}
				{:else}
					<!-- Default layout: prev arrow + image area + next arrow -->

					<!-- Prev arrow -->
					{#if !isSingle}
						<div class="flex w-16 shrink-0 justify-center">
							<button
								aria-label="Imagen anterior"
								disabled={!canPrev}
								onclick={goPrev}
								class="bnd-lightbox__nav cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowLeft class="size-8" />
							</button>
						</div>
					{/if}

					<!-- Image area — explicit height so absolute images have a sized container -->
					<div class="relative min-h-0 flex-1 self-stretch">
						<!-- Spinner (outside key block so it doesn't participate in cross-fade) -->
						{#if imageLoading && !imageError}
							<div
								class="pointer-events-none absolute inset-0 flex items-center justify-center"
								transition:fade={{ duration: 150 }}
							>
								<div
									class="size-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
								></div>
							</div>
						{/if}

						{#if imageError}
							<div
								class="bnd-lightbox__error p-sm absolute inset-0 flex items-center justify-center"
							>
								No se pudo cargar la imagen
							</div>
						{:else}
							<!-- {#key} ensures cross-fade when switching image or category -->
							{#key `${activeCategoryId}:${currentIndex}`}
								<img
									src={currentItem?.src}
									alt={currentItem?.alt ?? ''}
									class="absolute inset-0 m-auto block max-h-full max-w-full object-contain"
									transition:fade={{ duration: 300 }}
									onload={onImageLoad}
									onerror={onImageError}
								/>
							{/key}
						{/if}
					</div>

					<!-- Next arrow -->
					{#if !isSingle}
						<div class="flex w-16 shrink-0 justify-center">
							<button
								aria-label="Imagen siguiente"
								disabled={!canNext}
								onclick={goNext}
								class="bnd-lightbox__nav cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
							>
								<AltArrowRight class="size-8" />
							</button>
						</div>
					{/if}
				{/if}
			</div>

			<!-- Title bar (default layout only, when item has title) -->
			{#if showTitleBar}
				<div class="bnd-lightbox__title p-sm shrink-0 px-4 py-3 text-center">
					{currentItem?.title}
				</div>
			{/if}
		</div>

		<!-- Preload adjacent images (hidden from users and a11y) -->
		{#if !isSingle && !activeCategory?.layout}
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
		background: var(--bnd-lb-overlay-bg, rgba(0, 0, 0, 0.9));
	}

	.bnd-lightbox__content {
		z-index: var(--bnd-lb-z, 999);
		color: var(--bnd-lb-controls-color, #fff);
	}

	.bnd-lightbox__counter {
		font-size: var(--bnd-lb-counter-font-size, 0.875rem);
	}

	.bnd-lightbox__title {
		font-size: var(--bnd-lb-title-font-size, 0.875rem);
		color: var(--bnd-lb-title-color, #fff);
	}

	.bnd-lightbox__error {
		color: var(--bnd-lb-controls-color, #fff);
	}
</style>
