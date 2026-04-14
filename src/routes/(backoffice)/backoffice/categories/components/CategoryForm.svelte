<script lang="ts">
	/**
	 * CategoryForm — Reusable form for creating and editing categories.
	 * Handles name, status, and description fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import { CATEGORY_STATUS_OPTIONS } from '$lib/labels/categories';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CategoryFormSchema } from '../schemas/category-form.schema';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import CategoryFormActions from './CategoryFormActions.svelte';

	type Props = {
		form: SuperValidated<CategoryFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		categoryId?: string;
		/** Number of activities assigned to this category (edit mode only). */
		activityCount?: number;
	};

	let { form: formData, mode, categoryId, activityCount = 0 }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'category-form';
</script>

<CategoryFormActions {mode} {categoryId} {formId} {activityCount} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-category-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.categories_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.categories_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.categories_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-8"
			/>

			<FormSelect
				id="status"
				label={m.categories_labelStatus()}
				bind:value={$form.status}
				error={$errors.status}
				options={CATEGORY_STATUS_OPTIONS}
				placeholder={m.categories_placeholderStatus()}
				wrapperClass="md:col-span-4"
			/>

			<FormTextarea
				id="description"
				label={m.categories_labelDescription()}
				bind:value={$form.description}
				error={$errors.description}
				rows={3}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>
