<script lang="ts">
	/**
	 * General tab — main form fields for an existing free tour aggregation.
	 * Mirrors the structure of the activity edit form (same accordions, same icons,
	 * same field order) for visual consistency. Only includes fields present in
	 * FreeTourUpdateDto; skips activity-only sections (transport, pets, config).
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import { FreeTourStatus } from '$core/free-tours/enums';
	import {
		FREE_TOUR_INCLUDED_OPTIONS,
		FREE_TOUR_EXCLUDED_OPTIONS,
		FREE_TOUR_RESTRICTION_OPTIONS
	} from '$lib/labels/freeTours';

	import { Database, FolderCheck, ChecklistMinimalistic } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FormOrderedStringList from '$lib/components/backoffice/forms/FormOrderedStringList.svelte';
	import FormCheckboxGroup from '$lib/components/backoffice/forms/FormCheckboxGroup.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json',
		invalidateAll: 'force',
		applyAction: true,
		resetForm: false
	});

	const formId = 'free-tour-form';

	// When PUBLISHED, removing the last category/destination would break a publish
	// invariant. Force the user to unpublish first before clearing these lists.
	const requiredMinItems = $derived(data.freeTour.status === FreeTourStatus.PUBLISHED ? 1 : 0);
	const removeBlockedTooltip = m.freeTours_unpublishFirstTooltip();
</script>

<form id={formId} method="POST" action="?/update" use:enhance class="space-y-4">
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

			<FormInputText
				id="slug"
				label={m.freeTours_labelSlug()}
				bind:value={$form.slug}
				error={$errors.slug}
				badge="read only"
				readonly
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
				availableItems={data.availableCategories}
				error={$errors.categories?._errors}
				placeholder={m.freeTours_placeholderCategories()}
				emptyMessage={m.freeTours_emptyCategories()}
				minItems={requiredMinItems}
				{removeBlockedTooltip}
			/>

			<FormOrderedObjectList
				id="destinations"
				label={m.freeTours_labelDestinations()}
				bind:items={$form.destinations}
				availableItems={data.availableDestinations}
				error={$errors.destinations?._errors}
				placeholder={m.freeTours_placeholderDestinations()}
				emptyMessage={m.freeTours_emptyDestinations()}
				minItems={requiredMinItems}
				{removeBlockedTooltip}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-free-tour-content" open>
		{#snippet title()}
			<ChecklistMinimalistic class="size-6" />
			<span>{m.freeTours_sectionContent()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.freeTours_sectionContentDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormCheckboxGroup
				main_label={m.freeTours_labelIncluded()}
				id="included"
				name="included[]"
				key_title="name"
				key_value="id"
				bind:items={$form.included}
				availableItems={FREE_TOUR_INCLUDED_OPTIONS}
				error={$errors.included?._errors}
				wrapperClass="md:col-span-12"
			/>

			<FormCheckboxGroup
				main_label={m.freeTours_labelExcluded()}
				id="excluded"
				name="excluded[]"
				key_title="name"
				key_value="id"
				bind:items={$form.excluded}
				availableItems={FREE_TOUR_EXCLUDED_OPTIONS}
				error={$errors.excluded?._errors}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-free-tour-additional" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.freeTours_sectionAdditional()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.freeTours_sectionAdditionalDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="phoneContact"
				label={m.freeTours_labelPhoneContact()}
				bind:value={$form.phoneContact}
				error={$errors.phoneContact}
				wrapperClass="md:col-span-6"
			/>

			<div class="md:col-span-6"></div>

			<FormTextarea
				id="voucherInfo"
				label={m.freeTours_labelVoucherInfo()}
				bind:value={$form.voucherInfo}
				error={$errors.voucherInfo}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="supplierTip"
				label={m.freeTours_labelSupplierTip()}
				bind:value={$form.supplierTip}
				error={$errors.supplierTip}
				rows={3}
				wrapperClass="md:col-span-12"
			/>

			<FormOrderedStringList
				id="willDoing"
				label={m.freeTours_labelWillDoing()}
				bind:items={$form.willDoing}
				error={$errors.willDoing?._errors}
				placeholder={m.freeTours_placeholderWillDoing()}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-free-tour-restrictions" open>
		{#snippet title()}
			<ChecklistMinimalistic class="size-6" />
			<span>{m.freeTours_sectionRestrictions()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.freeTours_sectionRestrictionsDescription()}</p>
		{/snippet}
		{#snippet content()}
			<FormCheckboxGroup
				main_label={m.freeTours_labelRestrictions()}
				id="restrictions"
				name="restrictions[]"
				key_title="name"
				key_value="id"
				bind:items={$form.restrictions}
				availableItems={FREE_TOUR_RESTRICTION_OPTIONS}
				error={$errors.restrictions?._errors}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>
