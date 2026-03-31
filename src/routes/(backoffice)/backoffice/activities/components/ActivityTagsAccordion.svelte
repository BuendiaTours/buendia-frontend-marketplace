<script lang="ts">
	/**
	 * ActivityTagsAccordion — Manages activity ↔ tag relationships.
	 * Uses TAG_RELATIONSHIP_REQUEST to create/delete tag relationships
	 * with kind=ACTIVITY and entityId=activityId.
	 */
	import * as m from '$paraglide/messages';
	import { Tag as TagIcon, Close } from '$lib/icons/Linear';
	import { TAG_RELATIONSHIP_REQUEST } from '$core/tags/requests';
	import { TagRelationshipKind } from '$core/tags/enums';
	import type { TagRelationship } from '$core/tags/types';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import { showConfirmDialog } from '$lib/actions/backoffice/confirmAction';

	type TagWithRelation = {
		relationshipId: string;
		tagId: string;
		name: string;
	};

	type ToastFn = (data: {
		data: { title: string; description: string; type: 'success' | 'error' };
	}) => void;

	type Props = {
		activityId: string;
		tags: TagWithRelation[];
		availableTags: { id: string; name: string }[];
		addToast?: ToastFn;
		onCountChange?: (count: number) => void;
	};

	let { activityId, tags = $bindable(), availableTags, addToast, onCountChange }: Props = $props();

	let selectedTagId = $state('');
	let isAdding = $state(false);
	let isRemoving = $state<string | null>(null);

	const unassignedTags = $derived(
		availableTags.filter((t) => !tags.some((at) => at.tagId === t.id))
	);

	function showToast(type: 'success' | 'error', description: string) {
		addToast?.({ data: { title: type === 'success' ? 'Success' : 'Error', description, type } });
	}

	async function handleAdd() {
		if (!selectedTagId) return;

		isAdding = true;
		try {
			const relationshipId = crypto.randomUUID();
			await TAG_RELATIONSHIP_REQUEST.create(fetch, {
				id: relationshipId,
				entityId: activityId,
				kind: TagRelationshipKind.ACTIVITY,
				tagId: selectedTagId
			});

			const added = availableTags.find((t) => t.id === selectedTagId);
			if (added) {
				tags = [...tags, { relationshipId, tagId: added.id, name: added.name }];
				onCountChange?.(tags.length);
			}

			selectedTagId = '';
			showToast('success', m.activities_tagsAdded());
		} catch (err) {
			console.error('Error adding tag:', err);
			showToast('error', m.activities_tagsError());
		} finally {
			isAdding = false;
		}
	}

	async function handleRemove(tag: TagWithRelation) {
		const confirmed = await showConfirmDialog({
			title: m.activities_confirmDeleteTitle(),
			message: m.activities_confirmDeleteMessage(),
			confirmText: m.common_delete(),
			cancelText: m.common_cancel(),
			danger: true
		});
		if (!confirmed) return;

		isRemoving = tag.relationshipId;
		try {
			await TAG_RELATIONSHIP_REQUEST.delete(fetch, tag.relationshipId);
			tags = tags.filter((t) => t.relationshipId !== tag.relationshipId);
			onCountChange?.(tags.length);
			showToast('success', m.activities_tagsRemoved());
		} catch (err) {
			console.error('Error removing tag:', err);
			showToast('error', m.activities_tagsError());
		} finally {
			isRemoving = null;
		}
	}
</script>

<FormAccordion name="form-activity-tags" open>
	{#snippet title()}
		<TagIcon class="size-6" />
		<span>{m.activities_sectionTags()}</span>
	{/snippet}
	{#snippet asideContent()}
		<p class="text-xs">{m.activities_sectionTagsDescription()}</p>
	{/snippet}
	{#snippet content()}
		<div class="flex items-end gap-2 md:col-span-12">
			<div class="flex-1">
				<label class="label text-sm" for="tagSelect">
					<span>{m.activities_labelTag()}</span>
				</label>
				<select id="tagSelect" class="select w-full" bind:value={selectedTagId} disabled={isAdding}>
					<option value="" disabled>{m.activities_placeholderTag()}</option>
					{#each unassignedTags as tag (tag.id)}
						<option value={tag.id}>{tag.name}</option>
					{/each}
				</select>
			</div>

			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm h-[42px]"
				disabled={!selectedTagId || isAdding}
				onclick={handleAdd}
			>
				{#if isAdding}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					{m.activities_tagsAddButton()}
				{/if}
			</button>
		</div>

		<div class="md:col-span-12">
			{#if tags.length === 0}
				<div class="flex flex-col items-center gap-2 py-8">
					<TagIcon class="text-base-content/20 size-10" />
					<p class="text-base-content/50 text-sm">{m.activities_tagsEmpty()}</p>
				</div>
			{:else}
				<div class="mt-2 space-y-2">
					{#each tags as tag (tag.relationshipId)}
						<div
							class="border-neutral bg-base-200/50 flex items-center gap-3 rounded-lg border-l-4 px-3 py-2.5"
						>
							<TagIcon class="text-base-content/40 size-5 shrink-0" />
							<span class="min-w-0 flex-1 font-medium">{tag.name}</span>
							<button
								type="button"
								class="btn btn-ghost btn-xs text-error hover:bg-error/10"
								disabled={isRemoving === tag.relationshipId}
								onclick={() => handleRemove(tag)}
							>
								{#if isRemoving === tag.relationshipId}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<Close class="size-4" />
								{/if}
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</FormAccordion>
