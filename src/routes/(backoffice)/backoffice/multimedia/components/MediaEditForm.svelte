<script lang="ts">
	/**
	 * MediaEditForm — Edit form for media metadata (title + altText).
	 * After a successful save, triggers the onAfterSave callback to apply crops.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { MediaFormSchema } from '../schemas/media-form.schema';
	import { applyAction } from '$app/forms';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import MediaFormActions from './MediaFormActions.svelte';

	type Props = {
		form: SuperValidated<MediaFormSchema>;
		mediaId: string;
		/** Called after a successful metadata save — use this to trigger crop saving. */
		onAfterSave?: () => void;
	};

	let { form: formData, mediaId, onAfterSave }: Props = $props();

	let saving = $state(false);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(formData, {
		dataType: 'json',
		resetForm: false,
		onSubmit: () => {
			saving = true;
		},
		onResult: async ({ result }) => {
			if (result.type === 'redirect') {
				await onAfterSave?.();
				await applyAction(result);
			} else {
				saving = false;
				await applyAction(result);
			}
		},
		onError: () => {
			saving = false;
		}
	});

	const formId = 'media-form';
</script>

<MediaFormActions {mediaId} {formId} submitting={saving} />

<form id={formId} method="POST" action="?/update" use:enhance class="space-y-4">
	<FormAccordion name="form-media-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.multimedia_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.multimedia_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="title"
				label={m.multimedia_labelTitle()}
				bind:value={$form.title}
				error={$errors.title}
				placeholder={m.multimedia_placeholderTitle()}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="altText"
				label={m.multimedia_labelAltText()}
				bind:value={$form.altText}
				error={$errors.altText}
				placeholder={m.multimedia_placeholderAltText()}
				wrapperClass="md:col-span-6"
			/>
		{/snippet}
	</FormAccordion>
</form>
