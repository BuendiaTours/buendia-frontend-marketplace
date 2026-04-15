<script lang="ts">
	/**
	 * DistributiveForm — Reusable form for creating and editing distributives.
	 * Handles name, slug, and featuredScore fields.
	 * Status is managed via publish/unpublish in the action bar, not in the form.
	 * In edit mode, shows accordion components for managing categories, attractions, and locations.
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { DistributiveFormSchema } from '../schemas/distributive-form.schema';
	import type { DistributiveStatus } from '$core/distributives/enums';
	import type {
		DistributiveAttraction,
		DistributiveCategory,
		DistributiveLocation
	} from '$core/distributives/types';
	import { checkSlugAvailability } from '../queries/slug-check.queries';

	import { Database } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import DistributiveFormActions from './DistributiveFormActions.svelte';
	import DistributiveCategoriesAccordion from './DistributiveCategoriesAccordion.svelte';
	import DistributiveAttractionsAccordion from './DistributiveAttractionsAccordion.svelte';
	import DistributiveLocationsAccordion from './DistributiveLocationsAccordion.svelte';

	type Props = {
		form: SuperValidated<DistributiveFormSchema>;
		mode: 'create' | 'edit';
		/** Required in edit mode — used to build the delete action URL. */
		distributiveId?: string;
		/** Current status (edit mode only — managed via action bar). */
		distributiveStatus?: DistributiveStatus;
		/** Total number of matching activities (edit mode only). */
		totalActivities?: number;
		/** Current categories (edit mode). */
		categories?: DistributiveCategory[];
		availableCategories?: { id: string; name: string }[];
		/** Current attractions (edit mode). */
		attractions?: DistributiveAttraction[];
		availableAttractions?: { id: string; name: string }[];
		/** Current locations (edit mode). */
		locations?: DistributiveLocation[];
		availableLocations?: { id: string; name: string }[];
	};

	let {
		form: formData,
		mode,
		distributiveId,
		distributiveStatus,
		totalActivities = 0,
		categories = [],
		availableCategories = [],
		attractions = [],
		availableAttractions = [],
		locations = [],
		availableLocations = []
	}: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'distributive-form';
</script>

<DistributiveFormActions
	{mode}
	{distributiveId}
	{distributiveStatus}
	{formId}
	{totalActivities}
	submitting={$submitting}
/>

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-distributive-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.distributives_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.distributives_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.distributives_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-8"
			/>

			<FormInputText
				id="featuredScore"
				label={m.distributives_labelFeaturedScore()}
				bind:value={$form.featuredScore}
				error={$errors.featuredScore}
				type="number"
				min="0"
				wrapperClass="md:col-span-4"
			/>

			<FormInputSlug
				id="slug"
				label={m.distributives_labelSlug()}
				bind:value={$form.slug}
				sourceValue={$form.name}
				error={$errors.slug}
				checkSlugFn={isEditMode ? undefined : checkSlugAvailability}
				disabled={isEditMode}
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>
</form>

{#if isEditMode && distributiveId}
	<div class="mt-4 space-y-4">
		<DistributiveCategoriesAccordion {distributiveId} bind:categories {availableCategories} />

		<DistributiveAttractionsAccordion {distributiveId} bind:attractions {availableAttractions} />

		<DistributiveLocationsAccordion {distributiveId} bind:locations {availableLocations} />
	</div>
{/if}
