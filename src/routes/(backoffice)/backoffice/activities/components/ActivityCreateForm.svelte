<script lang="ts">
	/**
	 * ActivityCreateForm — Simple form for creating a new activity.
	 * Only includes fields from ActivityCreateDto.
	 * After creation, the user is redirected to the edit page for full management.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { ActivityCreateSchema } from '../schemas/activity-create.schema';
	import { ACTIVITY_KIND_OPTIONS, ACTIVITY_GUIDE_KIND_OPTIONS } from '$lib/labels/activities';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import { checkSlugAvailability } from '../queries/slug-check.queries';

	type Props = {
		form: SuperValidated<ActivityCreateSchema>;
		availableSuppliers?: Array<{ id: string; name: string }>;
	};

	let { form: formData, availableSuppliers = [] }: Props = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${ACTIVITY_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.activities_backToList()}
	</a>

	<button
		form="activity-create-form"
		type="submit"
		class="btn btn-outline btn-primary ml-auto"
		disabled={$submitting}
	>
		{#if $submitting}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		{m.activities_createActivity()}
	</button>
</div>

<form id="activity-create-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-activity-create" open>
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
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="supplierId"
				label={m.activities_labelSupplierId()}
				bind:value={$form.supplierId}
				error={$errors.supplierId}
				options={availableSuppliers}
				placeholder={m.activities_placeholderSupplierId()}
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

			<FormSelect
				id="kind"
				label={m.activities_labelKind()}
				bind:value={$form.kind}
				error={$errors.kind}
				options={ACTIVITY_KIND_OPTIONS}
				placeholder={m.activities_placeholderKind()}
				wrapperClass="md:col-span-6"
			/>

			<FormSelect
				id="guideKind"
				label={m.activities_labelGuideKind()}
				bind:value={$form.guideKind}
				error={$errors.guideKind}
				options={ACTIVITY_GUIDE_KIND_OPTIONS}
				placeholder={m.activities_placeholderGuideKind()}
				wrapperClass="md:col-span-6"
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
</form>
