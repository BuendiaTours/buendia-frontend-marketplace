<script lang="ts">
	/**
	 * FreeTourForm — Reusable form for creating and editing free tours.
	 * Handles title, slug, descriptions, categories, and destinations.
	 * Status is managed via publish/unpublish in the action bar.
	 * In edit mode, shows entries accordion for managing prioritized activities.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { FreeTourFormSchema } from '../schemas/free-tour-form.schema';
	import type { FreeTourStatus } from '$core/free-tours/enums';
	import type { FreeTourEntry } from '$core/free-tours/types';
	import { checkSlugAvailability } from '../queries/slug-check.queries';

	import { Database, FolderCheck } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FreeTourFormActions from './FreeTourFormActions.svelte';
	import FreeTourEntriesAccordion from './FreeTourEntriesAccordion.svelte';

	type Props = {
		form: SuperValidated<FreeTourFormSchema>;
		mode: 'create' | 'edit';
		freeTourId?: string;
		freeTourStatus?: FreeTourStatus;
		availableCategories?: { id: string; name: string }[];
		availableDestinations?: { id: string; name: string }[];
		/** Current entries (edit mode). */
		entries?: FreeTourEntry[];
		/** Available FREE_TOUR activities for entry selection (edit mode). */
		availableActivities?: { id: string; title: string }[];
	};

	let {
		form: formData,
		mode,
		freeTourId,
		freeTourStatus,
		availableCategories = [],
		availableDestinations = [],
		entries = [],
		availableActivities = []
	}: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'free-tour-form';
</script>

<FreeTourFormActions {mode} {freeTourId} {freeTourStatus} {formId} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-free-tour-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.freeTours_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.freeTours_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.freeTours_labelTitle()}
				bind:value={$form.title}
				error={$errors.title}
				wrapperClass="md:col-span-12"
			/>

			<FormInputSlug
				id="slug"
				label={m.freeTours_labelSlug()}
				bind:value={$form.slug}
				sourceValue={$form.title}
				error={$errors.slug}
				checkSlugFn={isEditMode ? undefined : checkSlugAvailability}
				disabled={isEditMode}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="descriptionShort"
				label={m.freeTours_labelDescriptionShort()}
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionFull"
				label={m.freeTours_labelDescriptionFull()}
				bind:value={$form.descriptionFull}
				error={$errors.descriptionFull}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-free-tour-classification" open>
		{#snippet title()}
			<FolderCheck class="size-6" />
			<span>{m.freeTours_sectionClassification()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.freeTours_sectionClassificationDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedObjectList
				id="categories"
				label={m.freeTours_labelCategories()}
				bind:items={$form.categories}
				availableItems={availableCategories}
				error={$errors.categories?._errors}
				placeholder={m.freeTours_placeholderCategories()}
				emptyMessage={m.freeTours_emptyCategories()}
			/>

			<FormOrderedObjectList
				id="destinations"
				label={m.freeTours_labelDestinations()}
				bind:items={$form.destinations}
				availableItems={availableDestinations}
				error={$errors.destinations?._errors}
				placeholder={m.freeTours_placeholderDestinations()}
				emptyMessage={m.freeTours_emptyDestinations()}
			/>
		{/snippet}
	</FormAccordion>
</form>

{#if isEditMode && freeTourId}
	<div class="mt-4 space-y-4">
		<FreeTourEntriesAccordion {freeTourId} bind:entries {availableActivities} />
	</div>
{/if}
