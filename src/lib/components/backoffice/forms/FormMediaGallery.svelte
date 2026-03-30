<script lang="ts">
	/**
	 * FormMediaGallery — Reusable media image manager with search, create, reorder and lightbox.
	 *
	 * Displays a list of images with thumbnails, titles, and controls for
	 * adding (async search), creating (upload dialog), removing and reordering.
	 * Click on a thumbnail to open a full-size PhotoSwipe lightbox.
	 */
	import * as m from '$paraglide/messages';
	import { PUBLIC_API_BASE_URL, PUBLIC_CDN_BASE_URL } from '$env/static/public';
	import type { EntityImage } from '$core/content-blocks/types';
	import { MEDIA_REQUEST } from '$core/multimedia/requests';
	import { MediaStatus, MediaVariantPreset } from '$core/multimedia/enums';
	import type { Media } from '$core/multimedia/types';
	import type { SearchResult } from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { openLightbox } from '$lib/components/backoffice/PhotoSwipe';
	import {
		getUploadUrl,
		uploadFileToS3,
		createMedia
	} from '$lib/components/backoffice/SvelteImageCrop/utils/uploadService';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';

	/** Image item enriched with optional title/altText for display. */
	export type MediaGalleryItem = EntityImage & {
		title?: string;
		altText?: string;
	};

	type Props = {
		/** Displayed images. Bindable so the parent stays in sync. */
		images: MediaGalleryItem[];
		/** Accordion section title. */
		sectionTitle?: string;
		/** Accordion section description. */
		sectionDescription?: string;
		/** Label for the search field. */
		searchLabel?: string;
		/** Placeholder for the search field. */
		searchPlaceholder?: string;
		/** Text shown when no images are linked. */
		emptyText?: string;
		/** Show title/altText below the thumbnail. */
		showMeta?: boolean;
		/** Enable up/down reordering buttons. */
		reorderable?: boolean;
		/** Called after an image is added (receives the new full list). */
		onadd?: (images: MediaGalleryItem[]) => void;
		/** Called after an image is removed (receives the new full list). */
		onremove?: (images: MediaGalleryItem[]) => void;
		/** Called after images are reordered (receives the new full list). */
		onreorder?: (images: MediaGalleryItem[]) => void;
	};

	let {
		images = $bindable(),
		sectionTitle = m.activities_sectionMultimedia(),
		sectionDescription = m.activities_sectionMultimediaDescription(),
		searchLabel = m.activities_multimediaSearchLabel(),
		searchPlaceholder = m.activities_multimediaSearchPlaceholder(),
		emptyText = m.activities_multimediaEmpty(),
		showMeta = true,
		reorderable = true,
		onadd,
		onremove,
		onreorder
	}: Props = $props();

	let searchValue = $state<string | undefined>(undefined);
	let isRemoving = $state<string | null>(null);
	let isMoving = $state<string | null>(null);

	// ── Search ──────────────────────────────────────

	function getThumbnailUrl(media: Media): string | undefined {
		const thumb = media.variants?.find((v) => v.preset === MediaVariantPreset.THUMBNAIL);
		if (thumb?.url) return thumb.url;
		return media.variants?.[0]?.url;
	}

	async function wrappedSearch(query: string): Promise<SearchResult[]> {
		try {
			const result = await MEDIA_REQUEST.findByCriteria(fetch, {
				search_text: query,
				status: MediaStatus.READY,
				limit: 10
			});
			return (result.data ?? [])
				.filter((media) => !images.some((img) => img.mediaId === media.id))
				.map((media) => ({
					value: media.id,
					label: media.title || media.id,
					subtitle: `${media.originalWidth}×${media.originalHeight}`,
					image: getThumbnailUrl(media)
				}));
		} catch {
			return [];
		}
	}

	/** Converts Media.variants (array) to EntityImage.variants (Record<preset, url>). */
	function variantsToRecord(variants: { preset: string; url: string }[]): Record<string, string> {
		const record: Record<string, string> = {};
		for (const v of variants) record[v.preset] = v.url;
		return record;
	}

	$effect(() => {
		if (searchValue) {
			handleAdd(searchValue);
			searchValue = undefined;
		}
	});

	async function handleAdd(mediaId: string) {
		if (images.some((img) => img.mediaId === mediaId)) return;

		let title = '';
		let altText = '';
		let originalUrl = '';
		let variants: Record<string, string> = {};
		try {
			const media = await MEDIA_REQUEST.findById(globalThis.fetch, mediaId);
			title = media.title || '';
			altText = media.altText || '';
			originalUrl = media.originalUrl || '';
			variants = variantsToRecord(media.variants ?? []);
		} catch {
			// May not be available yet (CQRS)
		}

		images = [...images, { mediaId, order: images.length, originalUrl, variants, title, altText }];
		onadd?.(images);
	}

	// ── Remove ──────────────────────────────────────

	function handleRemove(image: MediaGalleryItem) {
		isRemoving = image.mediaId;
		images = images.filter((img) => img.mediaId !== image.mediaId);
		onremove?.(images);
		isRemoving = null;
	}

	// ── Reorder ─────────────────────────────────────

	async function handleMove(image: MediaGalleryItem, direction: 'up' | 'down') {
		const idx = images.findIndex((img) => img.mediaId === image.mediaId);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= images.length) return;

		isMoving = image.mediaId;

		const reordered = [...images];
		[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
		images = reordered.map((img, i) => ({ ...img, order: i }));
		onreorder?.(images);

		isMoving = null;
	}

	// ── Lightbox ────────────────────────────────────

	function getThumbUrl(image: MediaGalleryItem): string | undefined {
		return image.variants?.THUMBNAIL ?? image.variants?.CARD ?? (image.originalUrl || undefined);
	}

	function openImageLightbox(image: MediaGalleryItem) {
		let url = image.originalUrl;
		if (!url) return;
		if (!url.startsWith('http') && !url.startsWith('blob:')) {
			url = `${PUBLIC_CDN_BASE_URL}/${url}`;
		}
		const img = new Image();
		img.onload = () => {
			openLightbox([{ src: url, width: img.naturalWidth, height: img.naturalHeight }]);
		};
		img.onerror = () => {
			openLightbox([{ src: url, width: 1200, height: 800 }]);
		};
		img.src = url;
	}

	// ── Create dialog ───────────────────────────────

	let createDialog: PureHtmlDialog;
	let createTitle = $state('');
	let createAltText = $state('');
	let createFile = $state<File | null>(null);
	let createStatus = $state<'idle' | 'uploading' | 'error'>('idle');
	let createError = $state('');

	function openCreateDialog() {
		createTitle = '';
		createAltText = '';
		createFile = null;
		createStatus = 'idle';
		createError = '';
		createDialog.showModal();
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		createFile = input.files?.[0] ?? null;
	}

	const canCreate = $derived(
		createTitle.trim().length >= 2 && !!createFile && createStatus !== 'uploading'
	);

	async function handleCreate() {
		if (!createFile || !canCreate) return;

		createStatus = 'uploading';
		createError = '';

		try {
			const presigned = await getUploadUrl(PUBLIC_API_BASE_URL, {
				fileName: createFile.name,
				mimeType: createFile.type,
				fileSize: createFile.size
			});

			await uploadFileToS3(presigned.uploadUrl, createFile);

			const localPreviewUrl = URL.createObjectURL(createFile as File);

			const img = new Image();
			const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
				img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
				img.onerror = () => resolve({ width: 0, height: 0 });
				img.src = localPreviewUrl;
			});

			const title = createTitle.trim();
			const altText = createAltText.trim();

			await createMedia(PUBLIC_API_BASE_URL, {
				id: presigned.id,
				title,
				altText,
				kind: 'IMAGE',
				mimeType: createFile.type,
				originalHeight: dimensions.height,
				originalSizeBytes: createFile.size,
				originalUrl: presigned.s3Key,
				originalWidth: dimensions.width
			});

			createDialog.close();

			images = [
				...images,
				{
					mediaId: presigned.id,
					order: images.length,
					originalUrl: localPreviewUrl,
					variants: {},
					title,
					altText
				}
			];
			onadd?.(images);
		} catch (e) {
			createError = e instanceof Error ? e.message : String(e);
			createStatus = 'error';
		}
	}
</script>

<FormAccordion name="form-media-gallery" open>
	{#snippet title()}
		<Database class="size-6" />
		<span>{sectionTitle}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{sectionDescription}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<FormAsyncSearch
					id="media-gallery-search"
					label={searchLabel}
					bind:value={searchValue}
					searchFn={wrappedSearch}
					placeholder={searchPlaceholder}
				/>
			</div>
			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm mb-1"
				onclick={openCreateDialog}
			>
				{m.multimedia_newMedia()}
			</button>
		</div>

		{#if images.length > 0}
			<div class="md:col-span-12">
				<ul class="space-y-1">
					{#each images as img, idx (img.mediaId)}
						{@const thumbUrl = getThumbUrl(img)}
						<li class="border-base-300 flex items-center gap-3 rounded-lg border px-3 py-2">
							<span class="text-base-content/40 w-6 text-center text-xs font-medium">
								{idx + 1}
							</span>
							{#if thumbUrl}
								<button type="button" class="cursor-zoom-in" onclick={() => openImageLightbox(img)}>
									<img src={thumbUrl} alt="" class="h-10 w-16 shrink-0 rounded object-cover" />
								</button>
							{:else}
								<div
									class="bg-base-200 flex h-10 w-16 shrink-0 items-center justify-center rounded"
								>
									<span class="text-base-content/30 text-[10px]">—</span>
								</div>
							{/if}
							{#if showMeta}
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium">
										{img.title || img.mediaId}
									</p>
									{#if img.altText}
										<p class="text-base-content/50 truncate text-xs">
											{img.altText}
										</p>
									{/if}
								</div>
							{:else}
								<div class="flex-1"></div>
							{/if}
							<div class="flex items-center gap-1">
								{#if reorderable}
									<button
										type="button"
										class="btn btn-ghost btn-xs"
										disabled={idx === 0 || isMoving !== null}
										onclick={() => handleMove(img, 'up')}
									>
										↑
									</button>
									<button
										type="button"
										class="btn btn-ghost btn-xs"
										disabled={idx === images.length - 1 || isMoving !== null}
										onclick={() => handleMove(img, 'down')}
									>
										↓
									</button>
								{/if}
								<button
									type="button"
									class="btn btn-ghost btn-error btn-xs"
									disabled={isRemoving === img.mediaId}
									onclick={() => handleRemove(img)}
								>
									{#if isRemoving === img.mediaId}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										✕
									{/if}
								</button>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<p class="text-base-content/50 text-sm md:col-span-12">
				{emptyText}
			</p>
		{/if}
	{/snippet}
</FormAccordion>

<PureHtmlDialog bind:this={createDialog} title={m.multimedia_createPageTitle()}>
	{#snippet content()}
		<div class="flex flex-col gap-4">
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{m.multimedia_labelTitle()}</span>
				</div>
				<input
					type="text"
					class="input input-bordered w-full"
					placeholder={m.multimedia_placeholderTitle()}
					bind:value={createTitle}
				/>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{m.multimedia_labelAltText()}</span>
				</div>
				<input
					type="text"
					class="input input-bordered w-full"
					placeholder={m.multimedia_placeholderAltText()}
					bind:value={createAltText}
				/>
			</label>

			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">{m.multimedia_labelFile()}</span>
				</div>
				<input
					type="file"
					class="file-input file-input-bordered w-full"
					accept="image/*"
					onchange={handleFileChange}
				/>
			</label>

			{#if createStatus === 'error'}
				<div class="text-error text-sm">{createError}</div>
			{/if}
		</div>
	{/snippet}
	{#snippet actions()}
		<button class="btn btn-ghost" onclick={() => createDialog.close()}>
			{m.common_cancel()}
		</button>
		<button class="btn btn-primary" disabled={!canCreate} onclick={handleCreate}>
			{#if createStatus === 'uploading'}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{m.multimedia_createMedia()}
		</button>
	{/snippet}
</PureHtmlDialog>
