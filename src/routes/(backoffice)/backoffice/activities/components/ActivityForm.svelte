<script lang="ts">
	/**
	 * ActivityForm - Componente reutilizable para crear y editar actividades
	 *
	 * Este componente contiene todo el formulario de actividades y se usa tanto
	 * en la página de creación (/activities/create) como en la de edición
	 * (/activities/[slug]/edit).
	 *
	 * @param data - PageData con form y listas disponibles (tags, categories, etc.)
	 * @param mode - 'create' para nueva actividad, 'edit' para editar existente
	 * @param activitySlug - Slug de la actividad (solo requerido en modo 'edit')
	 */

	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { buildUrlWithFilters } from '$lib/utils/url';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import type { Activity } from '$core/activities/types';
	import type { ActivityListItem, BreadcrumbItem } from '$lib/types';

	// Enums
	import {
		ACTIVITY_GUIDE_KIND_OPTIONS,
		ACTIVITY_NOT_SUITABLE_FOR_OPTIONS,
		ACTIVITY_STATUS_OPTIONS,
		ACTIVITY_KIND_OPTIONS
	} from '$lib/labels/activities';

	import { Database, FolderCheck, Link, ChecklistMinimalistic } from '@solar-icons/svelte/Linear';

	// Components
	import DebugApiJson from '$lib/components/backoffice/debug/DebugApiJson.svelte';
	import MsgMeltToast from '$lib/components/backoffice/msg/MsgMeltToast.svelte';

	// Form layout
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';

	// Form
	import FormCheckboxGroup from '$lib/components/backoffice/forms/FormCheckboxGroup.svelte';
	import FormInputSlug from '$lib/components/backoffice/forms/FormInputSlug.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormOrderedObjectList from '$lib/components/backoffice/forms/FormOrderedObjectList.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import FormTagManager from '$lib/components/backoffice/forms/FormTagManager.svelte';
	import FormTextarea from '$lib/components/backoffice/forms/FormTextarea.svelte';
	import FormTextareaMarkdown from '$lib/components/backoffice/forms/FormTextareaMarkdown.svelte';
	import FormOrderedStringList from '$lib/components/backoffice/forms/FormOrderedStringList.svelte';

	// Section components
	import FormActivityMealsAccordion from '../[slug]/edit/components/FormActivityMealsAccordion.svelte';
	import FormActivityStagesAccordion from '../[slug]/edit/components/FormActivityStagesAccordion.svelte';

	type Props = {
		data: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Superforms SuperValidated generic is complex with multiple type params
			form: any;
			availableTags: Array<{ id: string; name: string }>;
			availableCategories: Array<{ id: string; name: string }>;
			availableAttractions: Array<{ id: string; name: string }>;
			availableDestinations: Array<{ id: string; name: string }>;
			availableDistributives: Array<{ id: string; name: string }>;
			breadcrumbs: BreadcrumbItem[];
			/** Solo en modo edit. API devuelve Activity; ActivityListItem incluye tags para listados. */
			activity?: Activity | ActivityListItem;
		};
		mode: 'create' | 'edit';
		activitySlug?: string;
	};

	let { data, mode, activitySlug }: Props = $props();

	// Computed properties para facilitar condicionales
	const isCreateMode = $derived(mode === 'create');
	const isEditMode = $derived(mode === 'edit');

	const { availableTags, availableCategories, availableAttractions, availableDistributives } =
		$derived.by(() => data);

	// En modo edit tenemos activity, en create no
	const activity = $derived(isEditMode ? data.activity : null);

	// Referencia al componente toast para mostrar notificaciones
	let toastComponent: MsgMeltToast;

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json',
		onUpdate({ form }) {
			// Se ejecuta después de la validación pero antes del envío
			if (!form.valid) {
				// Mostrar toast inmediatamente cuando hay errores de validación
				toastComponent?.addToast({
					data: {
						title: 'Errores en el formulario',
						description: 'Por favor, corrige los errores marcados en el formulario.',
						type: 'error'
					}
				});
			}
		},
		onError({ result }) {
			// Mostrar toast cuando hay errores de validación del servidor
			if (result.status === 400) {
				toastComponent?.addToast({
					data: {
						title: 'Errores en el formulario',
						description: 'Por favor, corrige los errores marcados en el formulario.',
						type: 'error'
					}
				});
			}
		}
	});

	// Backup de coordenadas por stage (para poder restaurar si se desactiva/activa el toggle)
	let locationBackups = $state<
		Record<number, { type: 'Point'; coordinates: [number, number] } | null>
	>({});
</script>

<!-- Barra de acciones sticky -->
<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`/backoffice/activities?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← Volver al listado
	</a>

	{#if isEditMode && activitySlug}
		<form
			method="POST"
			action={buildUrlWithFilters(`/activities/${activitySlug}/delete`, page.url.searchParams)}
			class="ml-auto"
		>
			<button
				type="submit"
				class="btn btn-soft btn-error"
				use:confirmAction={{
					title: 'Eliminar elemento',
					message: '¿Seguro que quieres eliminar este elemento?',
					confirmText: 'Eliminar',
					cancelText: 'Cancelar',
					danger: true
				}}
			>
				Borrar
			</button>
		</form>
	{/if}

	<button
		form="activity-form"
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? 'Crear actividad' : 'Guardar cambios'}
	</button>
</div>

<!-- Formulario principal -->
<form id="activity-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-base-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>Datos base</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Información básica de la actividad</p>
		{/snippet}
		{#snippet content()}
			<FormInputText
				id="id"
				label="Id"
				badge="read only"
				bind:value={$form.id}
				error={$errors.id}
				readonly
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="codeRef"
				label="codeRef"
				badge={isEditMode ? 'disabled' : undefined}
				bind:value={$form.codeRef}
				error={$errors.codeRef}
				disabled={isEditMode}
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="status"
				label="Estado"
				bind:value={$form.status}
				error={$errors.status}
				options={ACTIVITY_STATUS_OPTIONS}
				placeholder="Selecciona un estado"
				wrapperClass="md:col-span-4"
				selectClass={$form.status == 'APPROVED' ? 'border-2 !border-success' : ''}
			/>

			<FormSelect
				id="kind"
				label="Tipo de actividad"
				bind:value={$form.kind}
				error={$errors.kind}
				options={ACTIVITY_KIND_OPTIONS}
				placeholder="Selecciona un tipo"
				wrapperClass="md:col-span-4"
			/>

			<FormSelect
				id="guideKind"
				label="Tipo de guía"
				bind:value={$form.guideKind}
				error={$errors.guideKind}
				options={ACTIVITY_GUIDE_KIND_OPTIONS}
				placeholder="Selecciona un tipo"
				wrapperClass="md:col-span-4"
			/>

			<FormInputText
				id="title"
				label="Title"
				badge={isEditMode ? 'read only' : undefined}
				bind:value={$form.title}
				error={$errors.title}
				readonly={isEditMode}
			/>

			<FormInputSlug
				id="slug"
				label="Slug"
				bind:value={$form.slug}
				sourceValue={$form.title}
				error={$errors.slug}
				generateTooltip="Genera slug a partir del título"
				wrapperClass="md:col-span-12"
			/>

			<FormTextarea
				id="descriptionShort"
				label="Descripcción corta"
				bind:value={$form.descriptionShort}
				error={$errors.descriptionShort}
				rows={3}
			/>

			<FormTextareaMarkdown
				id="descriptionFull"
				label="Descripción larga"
				bind:value={$form.descriptionFull}
				error={$errors.descriptionFull}
			/>

			<FormTextarea
				id="infoImportant"
				label="Información importante"
				bind:value={$form.infoImportant}
				error={$errors.infoImportant}
				rows={3}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-cats-tags">
		{#snippet title()}
			<FolderCheck class="size-6" />
			<span>Categorización</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Categorías y etiquetas</p>
		{/snippet}
		{#snippet content()}
			<FormCheckboxGroup
				main_label="Categorías"
				id="categories"
				name="categories[]"
				key_title="name"
				key_value="id"
				bind:items={$form.categories}
				availableItems={availableCategories}
				error={$errors.categories?._errors}
			/>

			<FormTagManager
				id="tags"
				label="Tags"
				bind:tags={$form.tags}
				{availableTags}
				error={$errors.tags?._errors}
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-vinculaciones">
		{#snippet title()}
			<Link class="size-6" />
			<span>Vinculaciones</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Relaciones con otros contenidos</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedObjectList
				id="attractions"
				label="Atracciones"
				bind:items={$form.attractions}
				availableItems={availableAttractions}
				error={$errors.attractions?._errors}
				placeholder="Selecciona una atracción..."
				emptyMessage="No hay atracciones asociadas"
			/>

			<FormOrderedObjectList
				id="destinations"
				label="Destinos"
				bind:items={$form.destinations}
				availableItems={data.availableDestinations}
				placeholder="Selecciona un destino..."
				emptyMessage="No hay destinos asociados"
				config={{ useDragAndDrop: true, showRemoveAll: true }}
				error={$errors.destinations?._errors}
			/>

			<FormOrderedObjectList
				id="distributives"
				label="Páginas distributivas a las que pertenece"
				bind:items={$form.distributives}
				availableItems={availableDistributives}
				error={$errors.distributives?._errors}
				placeholder="Selecciona un distributiva..."
				emptyMessage="No hay distributivas asociadas"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-includes">
		{#snippet title()}
			<ChecklistMinimalistic class="size-6" />
			<span>Elementos incluídos, excluídos y necesarios</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">Qué incluye y qué no incluye la actividad</p>
		{/snippet}
		{#snippet content()}
			<FormOrderedStringList
				id="included"
				label="Elementos incluidos"
				bind:items={$form.included}
				error={$errors.included?._errors}
				placeholder="Escribe un elemento incluido..."
				badge="opcional"
			/>

			<FormOrderedStringList
				id="itemsToBring"
				label="Elementos necesarios para la actividad"
				bind:items={$form.itemsToBring}
				error={$errors.itemsToBring?._errors}
				placeholder="Escribe un elemento necesario..."
				badge="opcional"
			/>

			<FormOrderedStringList
				id="excluded"
				label="Elementos excluidos"
				bind:items={$form.excluded}
				error={$errors.excluded?._errors}
				placeholder="Escribe un elemento a excluir..."
				badge="opcional"
			/>

			<FormCheckboxGroup
				main_label="No recomendado para"
				id="notSuitableFor"
				name="notSuitableFor[]"
				key_title="name"
				key_value="id"
				bind:items={$form.notSuitableFor}
				availableItems={ACTIVITY_NOT_SUITABLE_FOR_OPTIONS}
				error={$errors.notSuitableFor?._errors}
				badge="opcional"
				wrapperClass="md:col-span-12"
			/>
		{/snippet}
	</FormAccordion>

	<FormActivityMealsAccordion bind:meals={$form.meals} errors={$errors.meals} />

	<FormActivityStagesAccordion
		bind:stages={$form.stages}
		activityId={$form.id}
		errors={$errors.stages}
		bind:locationBackups
	/>
</form>

<DebugApiJson data={isEditMode ? activity : $form} />

<MsgMeltToast bind:this={toastComponent} />
