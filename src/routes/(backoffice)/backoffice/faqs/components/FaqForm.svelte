<script lang="ts">
	/**
	 * FaqForm — Reusable form for creating and editing FAQs.
	 * Contains question, answer (markdown), and status fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { FaqFormSchema } from '../schemas/faq-form.schema';
	import { FAQ_STATUS_OPTIONS } from '$lib/labels/faqs';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FaqFormActions from './FaqFormActions.svelte';

	type Props = {
		form: SuperValidated<FaqFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		faqId?: string;
	};

	let { form: formData, mode, faqId }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'faq-form';
</script>

<FaqFormActions {mode} {faqId} {formId} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-faq-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.faqs_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.faqs_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="question"
				label={m.faqs_labelQuestion()}
				placeholder={m.faqs_placeholderQuestion()}
				bind:value={$form.question}
				error={$errors.question}
				wrapperClass="md:col-span-12"
			/>

			<FormTextareaMarkdown
				id="answer"
				label={m.faqs_labelAnswer()}
				bind:value={$form.answer}
				error={$errors.answer}
				wrapperClass="md:col-span-12"
			/>

			{#if isEditMode}
				<FormSelect
					id="status"
					label={m.faqs_labelStatus()}
					bind:value={$form.status}
					error={$errors.status}
					options={FAQ_STATUS_OPTIONS}
					placeholder={m.faqs_placeholderStatus()}
					wrapperClass="md:col-span-4"
				/>
			{/if}
		{/snippet}
	</FormAccordion>
</form>
