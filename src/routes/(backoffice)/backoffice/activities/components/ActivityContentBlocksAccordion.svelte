<script lang="ts">
	/**
	 * ActivityContentBlocksAccordion — Manages content blocks linked to an activity.
	 * Supports add, remove, and reorder (up/down). Order determines display in marketplace.
	 */
	import * as m from '$paraglide/messages';
	import type { ActivityContentBlock } from '$core/activities/types';
	import { ACTIVITY_REQUEST } from '$core/activities/requests';
	import { searchContentBlocks } from '../queries/content-block-search.queries';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';

	type Props = {
		activityId: string;
		contentBlocks: ActivityContentBlock[];
		addToast: (toast: {
			data: { title: string; description: string; type: 'success' | 'error' };
		}) => void;
		/** URL to create a new content block with returnTo. */
		createContentBlockHref?: string;
	};

	let {
		activityId,
		contentBlocks = $bindable(),
		addToast,
		createContentBlockHref
	}: Props = $props();

	let searchValue = $state<string | undefined>(undefined);
	let isRemoving = $state<string | null>(null);
	let isMoving = $state<string | null>(null);

	/** Cache search results for label resolution on add. */
	const resultCache: Record<string, string> = {};

	async function wrappedSearch(query: string) {
		const results = await searchContentBlocks(query);
		for (const r of results) resultCache[r.value] = r.label;
		return results.filter((r) => !contentBlocks.some((cb) => cb.id === r.value));
	}

	function showToast(type: 'success' | 'error', description: string) {
		addToast({ data: { title: type === 'success' ? '✓' : '✗', description, type } });
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
			await ACTIVITY_REQUEST.addContentBlock(globalThis.fetch, activityId, { contentBlockId });
			contentBlocks = [
				...contentBlocks,
				{ id: contentBlockId, title: label, description: '', kind: '', target: '' }
			];
			showToast('success', m.activities_contentBlocksAdded());
		} catch (err) {
			console.error('Error adding content block:', err);
			showToast('error', m.activities_contentBlocksError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(contentBlock: ActivityContentBlock) {
		isRemoving = contentBlock.id;
		const previousBlocks = contentBlocks;

		contentBlocks = contentBlocks.filter((cb) => cb.id !== contentBlock.id);

		try {
			await ACTIVITY_REQUEST.removeContentBlock(globalThis.fetch, activityId, contentBlock.id);
			showToast('success', m.activities_contentBlocksRemoved());
		} catch (err) {
			console.error('Error removing content block:', err);
			contentBlocks = previousBlocks;
			showToast('error', m.activities_contentBlocksError());
		} finally {
			isRemoving = null;
		}
	}

	async function handleMove(contentBlock: ActivityContentBlock, direction: 'up' | 'down') {
		const idx = contentBlocks.findIndex((cb) => cb.id === contentBlock.id);
		const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= contentBlocks.length) return;

		isMoving = contentBlock.id;
		const previousBlocks = contentBlocks;

		// Optimistic: swap in local state
		const reordered = [...contentBlocks];
		[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];
		contentBlocks = reordered;

		try {
			// Re-add all in the new order: remove all, then add in sequence
			for (const cb of previousBlocks) {
				await ACTIVITY_REQUEST.removeContentBlock(globalThis.fetch, activityId, cb.id);
			}
			for (const cb of reordered) {
				await ACTIVITY_REQUEST.addContentBlock(globalThis.fetch, activityId, {
					contentBlockId: cb.id
				});
			}
		} catch (err) {
			console.error('Error reordering content blocks:', err);
			contentBlocks = previousBlocks;
			showToast('error', m.activities_contentBlocksMoveError());
		} finally {
			isMoving = null;
		}
	}
</script>

<FormAccordion name="form-activity-content-blocks" open>
	{#snippet title()}
		<Database class="size-6" />
		<span>{m.activities_sectionContentBlocks()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionContentBlocksDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<FormAsyncSearch
					id="content-block-search"
					label={m.contentBlocks_searchMediaLabel()}
					bind:value={searchValue}
					searchFn={wrappedSearch}
					placeholder={m.activities_contentBlocksSearchPlaceholder()}
				/>
			</div>
			{#if createContentBlockHref}
				<a href={createContentBlockHref} class="btn btn-outline btn-primary btn-sm mb-1">
					{m.contentBlocks_newResource()}
				</a>
			{/if}
		</div>

		{#if contentBlocks.length > 0}
			<div class="md:col-span-12">
				<ul class="space-y-1">
					{#each contentBlocks as cb, idx (cb.id)}
						<li class="border-base-300 flex items-center gap-2 rounded-lg border px-3 py-2">
							<span class="text-base-content/40 w-6 text-center text-xs font-medium">
								{idx + 1}
							</span>
							<div class="flex-1">
								<span class="text-sm font-medium">{cb.title}</span>
								{#if cb.kind}
									<span class="badge badge-outline badge-xs ml-2">{cb.kind}</span>
								{/if}
							</div>
							<div class="flex items-center gap-1">
								<button
									type="button"
									class="btn btn-ghost btn-xs"
									disabled={idx === 0 || isMoving !== null}
									onclick={() => handleMove(cb, 'up')}
								>
									↑
								</button>
								<button
									type="button"
									class="btn btn-ghost btn-xs"
									disabled={idx === contentBlocks.length - 1 || isMoving !== null}
									onclick={() => handleMove(cb, 'down')}
								>
									↓
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
				{m.activities_contentBlocksEmpty()}
			</p>
		{/if}
	{/snippet}
</FormAccordion>
