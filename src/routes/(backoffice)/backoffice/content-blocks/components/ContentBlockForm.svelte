<script lang="ts">
	/**
	 * ContentBlockForm — Form for creating and editing content blocks.
	 * Images are linked via mediaIds array (sent on create, read-only on edit).
	 */
	import * as m from '$paraglide/messages';
	import { PUBLIC_API_BASE_URL, PUBLIC_CDN_BASE_URL } from '$env/static/public';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ContentBlockFormSchema } from '../schemas/content-block-form.schema';
	import type { EntityImage } from '$core/content-blocks/types';
	import { MEDIA_REQUEST } from '$core/multimedia/requests';
	import { CONTENT_BLOCK_KIND_OPTIONS } from '$lib/labels/contentBlocks';
	import { searchMedia, loadMediaById } from '../queries/media-search.queries';
	import { openLightbox } from '$lib/components/backoffice/PhotoSwipe';
	import {
		getUploadUrl,
		uploadFileToS3,
		createMedia
	} from '$lib/components/backoffice/SvelteImageCrop/utils/uploadService';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';
	import ContentBlockFormActions from './ContentBlockFormActions.svelte';

	type Props = {
		form: SuperValidated<ContentBlockFormSchema>;
		mode: 'create' | 'edit';
		contentBlockId?: string;
		/** Images from the projection (edit mode). */
		images?: EntityImage[];
	};

	let { form: formData, mode, contentBlockId, images: initialImages = [] }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	let saving = $state(false);

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json',
		onSubmit: () => {
			saving = true;
		},
		onResult: () => {
			saving = false;
		},
		onError: () => {
			saving = false;
		}
	});

	const isBusy = $derived(saving || $submitting);

	const formId = 'content-block-form';

	// ── Images (visual state synced with $form.mediaIds) ──

	// svelte-ignore state_referenced_locally
	let imageItems = $state<EntityImage[]>(initialImages);
	let searchValue = $state<string | undefined>(undefined);

	$effect(() => {
		if (searchValue) {
			handleMediaSelected(searchValue);
		}
	});

	async function loadMediaData(
		mediaId: string
	): Promise<{ variants: Record<string, string>; originalUrl: string }> {
		try {
			const media = await MEDIA_REQUEST.findById(fetch, mediaId);
			const variants: Record<string, string> = {};
			for (const v of media.variants ?? []) {
				if (v.url && !variants[v.preset]) variants[v.preset] = v.url;
			}
			return { variants, originalUrl: media.originalUrl };
		} catch {
			return { variants: {}, originalUrl: '' };
		}
	}

	async function handleMediaSelected(mediaId: string) {
		if (!mediaId || $form.mediaIds.includes(mediaId)) {
			searchValue = undefined;
			return;
		}
		const mediaData = await loadMediaData(mediaId);
		imageItems = [...imageItems, { mediaId, order: imageItems.length, ...mediaData }];
		$form.mediaIds = [...$form.mediaIds, mediaId];
		searchValue = undefined;
	}

	function handleRemoveImage(mediaId: string) {
		imageItems = imageItems.filter((img) => img.mediaId !== mediaId);
		$form.mediaIds = $form.mediaIds.filter((id: string) => id !== mediaId);
	}

	function openImageLightbox(image: EntityImage) {
		let url = image.originalUrl;
		if (!url) return;
		if (!url.startsWith('http')) {
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

	// ── Create media dialog ──

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

	async function handleCreateMedia() {
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

			const img = new Image();
			const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
				img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
				img.onerror = () => resolve({ width: 0, height: 0 });
				img.src = URL.createObjectURL(createFile as File);
			});

			await createMedia(PUBLIC_API_BASE_URL, {
				id: presigned.id,
				title: createTitle.trim(),
				altText: createAltText.trim(),
				kind: 'IMAGE',
				mimeType: createFile.type,
				originalHeight: dimensions.height,
				originalSizeBytes: createFile.size,
				originalUrl: presigned.s3Key,
				originalWidth: dimensions.width
			});

			const previewUrl = URL.createObjectURL(createFile);
			imageItems = [
				...imageItems,
				{
					mediaId: presigned.id,
					order: imageItems.length,
					originalUrl: presigned.s3Key,
					variants: { PREVIEW: previewUrl }
				}
			];
			$form.mediaIds = [...$form.mediaIds, presigned.id];
			createDialog.close();
		} catch (e) {
			createError = e instanceof Error ? e.message : String(e);
			createStatus = 'error';
		}
	}
</script>

<ContentBlockFormActions {mode} {contentBlockId} {formId} submitting={isBusy} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-content-block-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.contentBlocks_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.contentBlocks_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.contentBlocks_labelTitle()}
				bind:value={$form.title}
				error={$errors.title}
				placeholder={m.contentBlocks_placeholderTitle()}
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="kind"
				label={m.contentBlocks_labelKind()}
				bind:value={$form.kind}
				error={$errors.kind}
				options={CONTENT_BLOCK_KIND_OPTIONS}
				placeholder={m.contentBlocks_placeholderKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="target"
				label={m.contentBlocks_labelTarget()}
				bind:value={$form.target}
				error={$errors.target}
				placeholder={m.contentBlocks_placeholderTarget()}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="description"
				label={m.contentBlocks_labelDescription()}
				bind:value={$form.description}
				error={$errors.description}
				placeholder={m.contentBlocks_placeholderDescription()}
				rows={3}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>

<div class="mt-4 overflow-visible">
	<FormAccordion name="form-content-block-images" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.contentBlocks_sectionImages()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.contentBlocks_sectionImagesDescription()}</p>
		{/snippet}
		{#snippet content()}
			<div class="flex items-end gap-2 md:col-span-12">
				<div class="flex-1">
					<FormAsyncSearch
						id="media-search"
						label={m.contentBlocks_searchMediaLabel()}
						bind:value={searchValue}
						searchFn={searchMedia}
						loadSelectedFn={loadMediaById}
						placeholder={m.contentBlocks_searchMediaPlaceholder()}
					/>
				</div>
				<button
					type="button"
					class="btn btn-outline btn-primary btn-sm mb-1"
					onclick={openCreateDialog}
				>
					{m.contentBlocks_createMediaButton()}
				</button>
			</div>

			{#if imageItems.length > 0}
				<div class="flex flex-wrap gap-3 md:col-span-12">
					{#each imageItems as image (image.mediaId)}
						{@const thumbUrl = image.variants ? Object.values(image.variants)[0] : undefined}
						<div class="group relative">
							{#if thumbUrl}
								<button
									type="button"
									class="cursor-zoom-in"
									onclick={() => openImageLightbox(image)}
								>
									<img src={thumbUrl} alt="" class="h-20 w-32 rounded-md border object-cover" />
								</button>
							{:else}
								<div
									class="bg-base-200 flex h-20 w-32 items-center justify-center rounded-md border"
								>
									<span class="text-base-content/30 text-xs">{image.mediaId.slice(0, 8)}</span>
								</div>
							{/if}
							<button
								type="button"
								class="btn btn-circle btn-error btn-xs absolute -top-2 -right-2"
								onclick={(e) => {
									e.stopPropagation();
									handleRemoveImage(image.mediaId);
								}}
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-base-content/50 text-sm md:col-span-12">
					{m.contentBlocks_noImages()}
				</p>
			{/if}
		{/snippet}
	</FormAccordion>
</div>

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
					<span class="label-text">Imagen</span>
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
		<button class="btn btn-primary" disabled={!canCreate} onclick={handleCreateMedia}>
			{#if createStatus === 'uploading'}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{m.multimedia_createMedia()}
		</button>
	{/snippet}
</PureHtmlDialog>
