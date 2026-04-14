<script lang="ts">
	/**
	 * ContentBlockForm — Form for creating and editing content blocks.
	 * Images are linked via mediaIds array (sent on create/update).
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ContentBlockFormSchema } from '../schemas/content-block-form.schema';
	import type { EntityImage } from '$core/content-blocks/types';
	import { CONTENT_BLOCK_KIND_OPTIONS } from '$lib/labels/contentBlocks';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormMediaGallery, {
		type MediaGalleryItem
	} from '$lib/components/backoffice/forms/FormMediaGallery.svelte';
	import ContentBlockFormActions from './ContentBlockFormActions.svelte';

	type Props = {
		form: SuperValidated<ContentBlockFormSchema>;
		mode: 'create' | 'edit';
		contentBlockId?: string;
		/** Number of activities using this content block (edit mode only). */
		activityCount?: number;
		/** Images from the projection (edit mode). */
		images?: EntityImage[];
	};

	let {
		form: formData,
		mode,
		contentBlockId,
		activityCount = 0,
		images: initialImages = []
	}: Props = $props();

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
	let imageItems = $state<MediaGalleryItem[]>(initialImages);

	function syncMediaIds(newImages: MediaGalleryItem[]) {
		$form.mediaIds = newImages.map((img) => img.mediaId);
	}
</script>

<ContentBlockFormActions {mode} {contentBlockId} {formId} {activityCount} submitting={isBusy} />

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
			{#if $form.activityId}
				<input type="hidden" name="activityId" value={$form.activityId} />
			{/if}

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
	<FormMediaGallery
		bind:images={imageItems}
		sectionTitle={m.contentBlocks_sectionImages()}
		sectionDescription={m.contentBlocks_sectionImagesDescription()}
		searchLabel={m.contentBlocks_searchMediaLabel()}
		searchPlaceholder={m.contentBlocks_searchMediaPlaceholder()}
		emptyText={m.contentBlocks_noImages()}
		showMeta
		reorderable
		onadd={syncMediaIds}
		onremove={syncMediaIds}
		onreorder={syncMediaIds}
	/>
</div>
