<script lang="ts">
	/**
	 * FaqForm — Reusable form for creating and editing FAQs.
	 * Contains question and answer (markdown) fields.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { FaqFormSchema } from '../schemas/faq-form.schema';
	import type { FaqStatus } from '$core/faqs/enums';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FaqFormActions from './FaqFormActions.svelte';

	type Props = {
		form: SuperValidated<FaqFormSchema>;
		mode: 'create' | 'edit';
		faqId?: string;
		faqStatus?: FaqStatus;
	};

	let { form: formData, mode, faqId, faqStatus }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'faq-form';
</script>

<FaqFormActions {mode} {faqId} {faqStatus} {formId} submitting={$submitting} />

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
			{#if $form.activityId}
				<input type="hidden" name="activityId" value={$form.activityId} />
			{/if}
			{#if $form.distributiveId}
				<input type="hidden" name="distributiveId" value={$form.distributiveId} />
			{/if}

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
		{/snippet}
	</FormAccordion>
</form>
