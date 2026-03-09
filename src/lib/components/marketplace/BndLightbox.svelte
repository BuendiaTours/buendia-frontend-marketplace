<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { AltArrowLeft, AltArrowRight, Close } from '$lib/icons/Linear';
	import type { BndLightboxConfig, BndLightboxItem } from '$lib/types';

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
	};

	let { id: _id, open = $bindable(false), config, onopen, onclose, onchange }: Props = $props();

	// Phase 1: no tabs — use startCategory or first category
	const activeCategoryId = $derived(config.startCategory ?? config.categories[0]?.id ?? '');
	const activeCategory = $derived(config.categories.find((c) => c.id === activeCategoryId));
	const items = $derived(activeCategory?.items ?? []);

	// currentIndex is initialized to 0; the sync $effect resets it to config.startIndex on open
	let currentIndex = $state(0);
	let imageLoading = $state(true);
	let imageError = $state(false);

	const currentItem = $derived(items[currentIndex]);
	const total = $derived(items.length);
	const isSingle = $derived(total <= 1);
	const showTitleBar = $derived((config.showTitle ?? true) && !!currentItem?.title);
	const canPrev = $derived(config.wrapAround === true ? total > 1 : currentIndex > 0);
	const canNext = $derived(config.wrapAround === true ? total > 1 : currentIndex < total - 1);

	// URLs for preloading adjacent images
	const prevSrc = $derived(items[(currentIndex - 1 + total) % total]?.src);
	const nextSrc = $derived(items[(currentIndex + 1) % total]?.src);

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
</script>

{#if $dialogOpen}
	<div class="bnd-lightbox" use:melt={$portalled}>
		<!-- Overlay -->
		<div
			use:melt={$overlay}
			class="bnd-lightbox__overlay fixed inset-0"
			transition:fade={{ duration: 200 }}
		></div>

		<!-- Dialog content -->
		<div
			use:melt={$content}
			class="bnd-lightbox__content fixed inset-0 flex flex-col items-center justify-center focus:outline-none"
			ontouchstart={onTouchStart}
			ontouchend={onTouchEnd}
		>
			<!-- Visually hidden title for screen readers -->
			<h2 use:melt={$titleEl} class="sr-only">Galería de imágenes</h2>

			<!-- Top bar: counter (left) + close button (right) -->
			<div class="absolute top-0 right-0 left-0 flex items-center justify-between px-4 py-3">
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

			<!-- Navigation + image -->
			<div class="flex w-full items-center justify-center">
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

				<!-- Image area -->
				<!-- height: 85vh fijo para que las imágenes absolutas tengan contenedor con dimensiones -->
				<div class="relative flex-1" style="height: 85vh;">
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
						<div class="bnd-lightbox__error p-sm absolute inset-0 flex items-center justify-center">
							No se pudo cargar la imagen
						</div>
					{:else}
						<!-- position: absolute en la imagen para que ambas (saliente/entrante) se solapen
						     durante el cross-fade sin desplazar el layout -->
						{#key currentIndex}
							<img
								src={currentItem?.src}
								alt={currentItem?.alt ?? ''}
								class="absolute inset-0 m-auto block max-h-[85vh] max-w-full object-contain"
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
			</div>

			<!-- Title bar -->
			{#if showTitleBar}
				<div
					class="bnd-lightbox__title p-sm absolute right-0 bottom-0 left-0 px-4 py-3 text-center"
				>
					{currentItem?.title}
				</div>
			{/if}
		</div>

		<!-- Preload adjacent images (hidden from users and a11y) -->
		{#if !isSingle}
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
