<script lang="ts">
	import { Download, Link, TrashBinTrash, Refresh } from '$lib/icons/Linear';
	import type { GeneratedCrop } from '$lib/components/backoffice/SvelteImageCrop/utils/cropGenerator';
	import type { EditorConfig } from '$lib/components/backoffice/SvelteImageCrop/types/imageEditorTypes';

	let {
		crop,
		isHighlighted = false,
		editorConfig = {},
		onRegenerate,
		onDelete
	}: {
		crop: GeneratedCrop;
		isHighlighted?: boolean;
		editorConfig?: EditorConfig;
		onRegenerate: () => void;
		onDelete: () => void;
	} = $props();

	const imgSrc = $derived(crop.url ?? crop.base64 ?? '');

	function openInNewTab(): void {
		if (crop.url) {
			window.open(crop.url, '_blank');
			return;
		}
		const newWindow = window.open();
		if (newWindow) {
			newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${crop.preset} - ${crop.width}x${crop.height}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
              img { max-width: 100%; max-height: 100vh; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
            </style>
          </head>
          <body>
            <img src="${crop.base64}" alt="${crop.preset}" />
          </body>
        </html>
      `);
		}
	}

	function download(): void {
		const link = document.createElement('a');
		link.href = imgSrc;
		const extension = crop.format.toLowerCase();
		link.download = `${crop.preset}-${crop.width}x${crop.height}.${extension}`;
		link.click();
	}
</script>

<div
	class="sic-generated-crop card border transition-colors"
	class:!border-success={isHighlighted}
	class:!border-zinc-700={!isHighlighted}
>
	<figure class="bg-base-300 aspect-video">
		<img src={imgSrc} alt={crop.preset} class="h-full w-full object-contain" />
	</figure>
	<div class="flex flex-col gap-1 p-2">
		<h4 class="card-title text-sm">{crop.preset}</h4>
		<p class="text-xs">
			{crop.width}×{crop.height}{crop.base64
				? ` • ${(crop.base64.length / 1024).toFixed(2)} KB`
				: ''}
		</p>
		<div class="card-actions mt-2 justify-end">
			{#if editorConfig.showCropRefreshButton}
				<button
					type="button"
					class="sic-generated-crop-refresh btn btn-square btn-soft btn-sm"
					onclick={onRegenerate}
					title="Regenerar crop"
				>
					<Refresh class="size-5" />
				</button>
			{/if}
			{#if editorConfig.showCropNewTabButton}
				<button
					type="button"
					class="sic-generated-crop-new-tab btn btn-square btn-soft btn-sm"
					onclick={openInNewTab}
					title="Abrir en nueva pestaña"
				>
					<Link class="size-5" />
				</button>
			{/if}
			{#if editorConfig.showCropDownloadButton}
				<button
					type="button"
					class="sic-generated-crop-download btn btn-square btn-soft btn-sm"
					onclick={download}
					title="Descargar"
				>
					<Download class="size-5" />
				</button>
			{/if}
			{#if editorConfig.showCropDeleteButtons}
				<button
					type="button"
					class="sic-generated-crop-delete btn btn-square btn-soft btn-sm btn-error"
					onclick={onDelete}
					title="Eliminar"
				>
					<TrashBinTrash class="size-5" />
				</button>
			{/if}
		</div>
	</div>
</div>
