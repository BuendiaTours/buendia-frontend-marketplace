<script lang="ts">
	/**
	 * TagForm — Reusable form for creating and editing tags.
	 * Minimal form with a single name field.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { TagFormSchema } from '../schemas/tag-form.schema';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import TagFormActions from './TagFormActions.svelte';

	type Props = {
		form: SuperValidated<TagFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		tagId?: string;
	};

	let { form: formData, mode, tagId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'tag-form';
</script>

<TagFormActions {mode} {tagId} {formId} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-tag-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.tags_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.tags_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.tags_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>
