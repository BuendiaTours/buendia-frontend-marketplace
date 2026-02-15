<script lang="ts">
	import { page } from '$app/state';
	import { superForm } from 'sveltekit-superforms';
	import { resolveRoute } from '$app/paths';
	import { DatabaseRestore } from 'svelte-iconoir';
	import type { UserFormSchema } from '../schemas/user-form.schema';
	import type { SuperValidated } from 'sveltekit-superforms';

	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import { USER_KIND_OPTIONS, USER_STATUS_OPTIONS } from '$lib/labels/users';

	type Props = {
		data: {
			form: SuperValidated<UserFormSchema>;
		};
		mode: 'create' | 'edit';
	};

	let { data, mode }: Props = $props();

	const isEditMode = $derived(mode === 'edit');

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance } = superForm(data.form, {
		dataType: 'json'
	});
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a
		href={`${resolveRoute('/(backoffice)/backoffice/users')}?${page.url.searchParams.toString()}`}
		class="link"
	>
		&larr; Volver al listado
	</a>

	<div class="flex gap-2">
		<button type="submit" form="user-form" class="btn btn-primary">
			{isEditMode ? 'Guardar cambios' : 'Crear usuario'}
		</button>
	</div>
</div>

<form id="user-form" method="POST" use:enhance class="space-y-4">
	<FormAccordion name="form-user-data" open>
		{#snippet title()}
			<DatabaseRestore class="size-6" />
			<span>Datos del usuario</span>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" bind:value={$form.id} />
			<FormInputText id="name" label="Nombre" bind:value={$form.name} error={$errors.name} />
			<FormInputText id="email" label="Email" bind:value={$form.email} error={$errors.email} />
			<FormInputText id="phone" label="Teléfono" bind:value={$form.phone} error={$errors.phone} />
			<FormSelect
				id="kind"
				label="Tipo"
				bind:value={$form.kind}
				error={$errors.kind}
				options={USER_KIND_OPTIONS}
			/>
			<FormSelect
				id="status"
				label="Estado"
				bind:value={$form.status}
				error={$errors.status}
				options={USER_STATUS_OPTIONS}
			/>
		{/snippet}
	</FormAccordion>
</form>
