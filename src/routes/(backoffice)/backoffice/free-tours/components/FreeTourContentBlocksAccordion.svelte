<script lang="ts">
	/**
	 * FreeTourContentBlocksAccordion — Manages content blocks linked to a free tour.
	 * Uses FREE_TOUR_REQUEST.update({ contentBlockIds }) for add/remove/reorder.
	 */
	import * as m from '$paraglide/messages';
	import type { FreeTourContentBlock } from '$core/free-tours/types';
	import { FREE_TOUR_REQUEST } from '$core/free-tours/requests';
	import { searchContentBlocks } from '../queries/content-block-search.queries';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

	type Props = {
		freeTourId: string;
		contentBlocks: FreeTourContentBlock[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
		createContentBlockHref?: string;
	};

	let {
		freeTourId,
		contentBlocks = $bindable(),
		addToast,
		createContentBlockHref
	}: Props = $props();

	let searchValue = $state<string | undefined>(undefined);
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);
	let isMoving = $state<string | null>(null);

	const resultCache: Record<string, string> = {};

	async function wrappedSearch(query: string) {
		const results = await searchContentBlocks(query);
		for (const r of results) resultCache[r.value] = r.label;
		return results.filter((r) => !contentBlocks.some((cb) => cb.id === r.value));
	}

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
	}

	async function syncContentBlockIds(blocks: FreeTourContentBlock[]) {
		await FREE_TOUR_REQUEST.update(globalThis.fetch, freeTourId, {
			contentBlockIds: blocks.map((cb) => cb.id)
		});
	}

	$effect(() => {
		if (searchValue) {
			handleAdd(searchValue);
			searchValue = undefined;
		}
	});

	async function handleAdd(contentBlockId: string) {
		if (contentBlocks.some((cb) => cb.id === contentBlockId)) return;

		isAdding = true;
		const label = resultCache[contentBlockId] ?? contentBlockId;

		try {
			const newBlocks = [
				...contentBlocks,
				{ id: contentBlockId, title: label, description: '', kind: '', target: '' }
			];
			await syncContentBlockIds(newBlocks);
			contentBlocks = newBlocks;
			showToast('success', m.activities_contentBlocksAdded());
		} catch (err) {
			console.error('Error adding content block:', err);
			showToast('error', m.activities_contentBlocksError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(contentBlock: FreeTourContentBlock) {
		isRemoving = contentBlock.id;
		const previousBlocks = contentBlocks;
		const newBlocks = contentBlocks.filter((cb) => cb.id !== contentBlock.id);
		contentBlocks = newBlocks;

		try {
			await syncContentBlockIds(newBlocks);
			showToast('success', m.activities_contentBlocksRemoved());
		} catch (err) {
			console.error('Error removing content block:', err);
			contentBlocks = previousBlocks;
			showToast('error', m.activities_contentBlocksError());
		} finally {
			isRemoving = null;
		}
	}

	async function handleMove(contentBlock: FreeTourContentBlock, direction: 'up' | 'down') {
		const idx = contentBlocks.findIndex((cb) => cb.id === contentBlock.id);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= contentBlocks.length) return;

		isMoving = contentBlock.id;
		const previousBlocks = contentBlocks;
		const reordered = [...contentBlocks];
		[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
		contentBlocks = reordered;

		try {
			await syncContentBlockIds(reordered);
		} catch (err) {
			console.error('Error reordering content blocks:', err);
			contentBlocks = previousBlocks;
			showToast('error', m.activities_contentBlocksMoveError());
		} finally {
			isMoving = null;
		}
	}
</script>

<FormAccordion name="form-free-tour-content-blocks" open>
	{#snippet title()}
		<Database class="size-6" />
		<span>{m.activities_sectionContentBlocks()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionContentBlocksDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<FormAsyncSearch
				id="content-block-search"
				label={m.contentBlocks_searchMediaLabel()}
				bind:value={searchValue}
				searchFn={wrappedSearch}
				placeholder={m.activities_contentBlocksSearchPlaceholder()}
				wrapperClass="min-w-0 flex-[2]"
			/>

			{#if createContentBlockHref}
				<a
					href={createContentBlockHref}
					class="btn btn-outline btn-secondary btn-sm h-[42px] shrink-0"
				>
					{m.contentBlocks_newResource()}
				</a>
			{/if}
		</div>

		<div class="md:col-span-12">
			{#if contentBlocks.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<Database class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_contentBlocksEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each contentBlocks as cb, idx (cb.id)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<Database class="text-base-content/40 size-5 shrink-0" />
							<div class="min-w-0 flex-1">
								<span class="font-medium">{cb.title}</span>
								{#if cb.kind}
									<span class="badge badge-ghost badge-sm ml-2">{cb.kind}</span>
								{/if}
							</div>
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								disabled={idx === 0 || isMoving !== null}
								onclick={() => handleMove(cb, 'up')}
							>
								&#8593;
							</button>
							<button
								type="button"
								class="btn btn-ghost btn-xs"
								disabled={idx === contentBlocks.length - 1 || isMoving !== null}
								onclick={() => handleMove(cb, 'down')}
							>
								&#8595;
							</button>
							<button
								type="button"
								class="btn btn-ghost btn-error btn-xs"
								disabled={isRemoving === cb.id}
								onclick={() => handleRemove(cb)}
							>
								{#if isRemoving === cb.id}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									&#10005;
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>
