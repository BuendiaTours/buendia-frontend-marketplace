<script lang="ts">
	/**
	 * Multimedia list page.
	 * Displays a filterable, sortable, paginated table of media assets.
	 * Includes a dialog for creating new media (title + altText + file upload).
	 */
	import * as m from '$paraglide/messages';
	import type { PageProps } from './$types';
	import type { MultimediaFilters } from './schemas/filters.schema';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_API_BASE_URL } from '$env/static/public';

	import type { PatchValue } from '$lib/utils/filters';
	import { patchFilters } from '$lib/utils/filters';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { multimediaFiltersSchema } from './schemas/filters.schema';
	import { MEDIA_STATUS_OPTIONS, MEDIA_KIND_OPTIONS } from '$lib/labels/multimedia';
	import { MULTIMEDIA_ROUTES } from '$lib/config/routes/backoffice/multimedia';
	import { MediaStatus, MediaVariantPreset } from '$core/multimedia/enums';
	import type { Media } from '$core/multimedia/types';
	import {
		getUploadUrl,
		uploadFileToS3,
		createMedia
	} from '$lib/components/backoffice/SvelteImageCrop/utils/uploadService';

	import Pagination from '$lib/components/backoffice/MeltPagination.svelte';
	import FilterSelect from '$lib/components/backoffice/filters/FilterSelect.svelte';
	import TableSortableHeader from '$lib/components/backoffice/tables/TableSortableHeader.svelte';
	import TableResetSort from '$lib/components/backoffice/tables/TableResetSort.svelte';
	import LocationBar from '$lib/layout/backoffice/partials/LocationBar.svelte';
	import PureHtmlDialog from '$lib/components/backoffice/PureHtmlDialog.svelte';
	import { Add, Magnifier } from '$lib/icons/Linear';

	let { data }: PageProps = $props();

	const items = $derived(data.items);
	const pagination = $derived(data.pagination);
	const filters = $derived(data.filters as MultimediaFilters);
	const sort = $derived(data.sort);
	const pageSize = $derived(pagination?.pageSize ?? 10);
	const total = $derived(pagination?.total ?? 0);

	let searchQuery = $derived(filters.q || '');

	function getThumbnailUrl(item: Media): string | undefined {
		const thumb = item.variants?.find((v) => v.preset === MediaVariantPreset.THUMBNAIL);
		if (thumb?.url) return thumb.url;
		return item.variants?.[0]?.url;
	}

	function applyFilterPatch(patch: {
		[K in keyof MultimediaFilters]?: PatchValue<MultimediaFilters[K]>;
	}) {
		const currentParams = page.url.searchParams;
		const newParams = patchFilters(multimediaFiltersSchema, currentParams, patch);
		goto(`?${newParams.toString()}`, { keepFocus: true, noScroll: true });
	}

	function handleSearch() {
		applyFilterPatch({ q: searchQuery || null });
	}

	function handleFilterChange(filterKey: string, value: string | null) {
		applyFilterPatch({
			[filterKey]: value
		} as { [K in keyof MultimediaFilters]?: PatchValue<MultimediaFilters[K]> });
	}

	function handlePageChange(newPage: number) {
		applyFilterPatch({ page: newPage });
	}

	// ── Create dialog ──────────────────────────────
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

			createDialog.close();
			goto(MULTIMEDIA_ROUTES.edit(presigned.id));
		} catch (e) {
			createError = e instanceof Error ? e.message : String(e);
			createStatus = 'error';
		}
	}
</script>

<svelte:head>
	<title>{m.multimedia_listPageTitle()} - Backoffice</title>
</svelte:head>

<LocationBar title={m.multimedia_listTitle()} breadcrumbs={data.breadcrumbs} />

<!-- Filters Bar -->
<div class="bnd-filter-bar card flex-row items-center gap-6 p-2">
	<div class="flex w-full items-center gap-2">
		<input
			type="text"
			placeholder={m.multimedia_searchPlaceholder()}
			class="input-bordered input w-full"
			bind:value={searchQuery}
			onkeydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button class="btn btn-square btn-outline btn-primary" onclick={handleSearch}>
			<Magnifier class="size-5" />
		</button>
	</div>

	<FilterSelect
		options={MEDIA_STATUS_OPTIONS}
		filterKey="status"
		currentValue={filters.status}
		placeholder={m.multimedia_filterStatusPlaceholder()}
		clearTooltip={m.multimedia_filterStatusClear()}
		onFilterChange={handleFilterChange}
	/>

	<FilterSelect
		options={MEDIA_KIND_OPTIONS}
		filterKey="kind"
		currentValue={filters.kind}
		placeholder={m.multimedia_filterKindPlaceholder()}
		clearTooltip={m.multimedia_filterKindClear()}
		onFilterChange={handleFilterChange}
	/>

	<button class="btn btn-outline btn-primary ml-auto" onclick={openCreateDialog}>
		<Add class="size-5" />
		{m.multimedia_newMedia()}
	</button>
</div>

<!-- Table -->
<div class="card mt-6">
	<table class="table-zebra table-sm table">
		<thead>
			<tr>
				<th>
					<TableSortableHeader
						title={m.multimedia_columnTitle()}
						field="title"
						currentSort={sort}
						onSortChange={(newSort) =>
							applyFilterPatch({
								sort: newSort.field as MultimediaFilters['sort'],
								order: newSort.order
							})}
					/>
				</th>
				<th>
					<span>{m.multimedia_columnKind()}</span>
				</th>
				<th>
					<span>{m.multimedia_columnActivityCount()}</span>
				</th>
				<th>
					<span>{m.multimedia_columnStatus()}</span>
				</th>
				<th class="w-0">
					<TableResetSort currentSort={sort} />
				</th>
			</tr>
		</thead>
		<tbody>
			{#if items.length === 0}
				<tr>
					<td colspan="5" class="text-center">
						<div class="py-8">
							<p class="text-base-content/50">{m.multimedia_emptyState()}</p>
						</div>
					</td>
				</tr>
			{:else}
				{#each items as item (item.id)}
					{@const thumbUrl = getThumbnailUrl(item)}
					<tr>
						<td>
							<div class="flex items-center gap-4">
								<a
									href={buildUrlWithFilters(MULTIMEDIA_ROUTES.edit(item.id), page.url.searchParams)}
									class="shrink-0"
								>
									{#if thumbUrl}
										<img
											src={thumbUrl}
											alt={item.altText || item.title}
											class="h-20 w-32 rounded-md object-cover"
										/>
									{:else}
										<div class="bg-base-200 flex h-20 w-32 items-center justify-center rounded-md">
											<span class="text-base-content/30 text-xs">Sin imagen</span>
										</div>
									{/if}
								</a>
								<div>
									<p class="font-medium">
										<a
											href={buildUrlWithFilters(
												MULTIMEDIA_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{item.title || item.id}
										</a>
									</p>
									{#if item.altText}
										<p class="text-base-content/50 mt-0.5 text-xs">{item.altText}</p>
									{/if}
									<p class="text-base-content/40 mt-1 text-xs">
										{item.originalWidth}×{item.originalHeight}
									</p>
								</div>
							</div>
						</td>
						<td>
							<span class="badge badge-outline badge-sm">
								{MEDIA_KIND_OPTIONS.find((o) => o.id === item.kind)?.name || item.kind}
							</span>
						</td>
						<td>
							<span class="badge badge-outline badge-sm">{item.activityCount}</span>
						</td>
						<td>
							{#if item.status === MediaStatus.READY}
								<div aria-label="success" class="status status-lg status-success mr-1"></div>
								<span>{MEDIA_STATUS_OPTIONS.find((o) => o.id === MediaStatus.READY)?.name}</span>
							{:else if item.status === MediaStatus.PROCESSING}
								<div aria-label="processing" class="status status-lg status-warning mr-1"></div>
								<span
									>{MEDIA_STATUS_OPTIONS.find((o) => o.id === MediaStatus.PROCESSING)?.name}</span
								>
							{:else if item.status === MediaStatus.PENDING}
								<div aria-label="pending" class="status status-lg status-neutral mr-1"></div>
								<span>{MEDIA_STATUS_OPTIONS.find((o) => o.id === MediaStatus.PENDING)?.name}</span>
							{:else}
								<div aria-label="error" class="status status-lg status-error mr-1"></div>
								<span>{MEDIA_STATUS_OPTIONS.find((o) => o.id === MediaStatus.FAILED)?.name}</span>
							{/if}
						</td>
						<td class="w-0 text-right">
							<div class="dropdown dropdown-end dropdown-bottom">
								<div tabindex="0" role="button" class="text-bold btn btn-sm m-1">⋮</div>
								<ul tabindex="-1" class="dropdown-content menu">
									<li>
										<a
											href={buildUrlWithFilters(
												MULTIMEDIA_ROUTES.edit(item.id),
												page.url.searchParams
											)}
										>
											{m.multimedia_editButton()}
										</a>
									</li>
								</ul>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<!-- Pagination -->
{#if data.pagination}
	<div class="mt-4">
		<Pagination
			count={total}
			currentPage={pagination?.page ?? 1}
			perPage={pageSize}
			onPageChange={handlePageChange}
		/>
	</div>
{/if}

<!-- Create media dialog -->
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
		<button class="btn btn-primary" disabled={!canCreate} onclick={handleCreate}>
			{#if createStatus === 'uploading'}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{m.multimedia_createMedia()}
		</button>
	{/snippet}
</PureHtmlDialog>
