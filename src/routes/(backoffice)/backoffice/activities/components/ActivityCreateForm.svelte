<script lang="ts">
	/**
	 * ActivityCreateForm — Form for creating a new activity.
	 * Mirrors the edit page structure: main data section + config section.
	 * After creation, redirects to edit where all sections become available.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ActivityCreateSchema } from '../schemas/activity-create.schema';
	import { ACTIVITY_KIND_OPTIONS, ACTIVITY_GUIDE_KIND_OPTIONS } from '$lib/labels/activities';
	import { checkSlugAvailability } from '../queries/slug-check.queries';
	import { searchSuppliers, loadSupplierById } from '../queries/supplier-search.queries';

	import { Database, FolderCheck } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import ActivityFormActions from './ActivityFormActions.svelte';

	type Props = {
		form: SuperValidated<ActivityCreateSchema>;
	};

	let { form: formData }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'activity-create-form';
</script>

<ActivityFormActions mode="create" {formId} submitting={$submitting} />

<form id={formId} method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-activity-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.activities_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.activities_labelTitle()}
				bind:value={$form.title}
				error={$errors.title}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="descriptionShort"
				label={m.activities_labelDescriptionShort()}
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="descriptionFull"
				label={m.activities_labelDescriptionFull()}
				bind:value={$form.descriptionFull}
				error={$errors.descriptionFull}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-activity-config" open>
		{#snippet title()}
			<FolderCheck class="size-6" />
			<span>{m.activities_sectionConfig()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.activities_sectionConfigDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormSelect
				id="kind"
				label={m.activities_labelKind()}
				bind:value={$form.kind}
				error={$errors.kind}
				options={ACTIVITY_KIND_OPTIONS}
				placeholder={m.activities_placeholderKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="guideKind"
				label={m.activities_labelGuideKind()}
				bind:value={$form.guideKind}
				error={$errors.guideKind}
				options={ACTIVITY_GUIDE_KIND_OPTIONS}
				placeholder={m.activities_placeholderGuideKind()}
				wrapperClass="md:col-span-4"
			/>

			<FormAsyncSearch
				id="supplierId"
				label={m.activities_labelSupplierId()}
				bind:value={$form.supplierId}
				searchFn={searchSuppliers}
				loadSelectedFn={loadSupplierById}
				placeholder={m.activities_placeholderSupplierId()}
				error={$errors.supplierId}
				wrapperClass="md:col-span-4"
			/>

			<FormInputSlug
				id="slug"
				label={m.activities_labelSlug()}
				bind:value={$form.slug}
				sourceValue={$form.title}
				error={$errors.slug}
				generateTooltip="Comprobar disponibilidad del slug"
				checkSlugFn={checkSlugAvailability}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>
