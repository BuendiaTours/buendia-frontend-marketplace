<script lang="ts">
	/**
	 * UserForm — Reusable form for creating and editing users.
	 * All users created from backoffice are ADMIN kind (hardcoded server-side).
	 * Status is only editable in edit mode (server-assigned on creation).
	 */
	import * as m from '$paraglide/messages';
	import { superForm } from 'sveltekit-superforms';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { UserFormSchema } from '../schemas/user-form.schema';
	import { USER_STATUS_OPTIONS, USER_ROLE_OPTIONS } from '$lib/labels/users';
	import type { UserRole } from '$core/users/enums';

	import { Database, Key } from '$lib/icons/Linear';
	import FormAccordion from '$lib/components/backoffice/forms/layout/FormAccordion.svelte';
	import FormInputText from '$lib/components/backoffice/forms/FormInputText.svelte';
	import FormSelect from '$lib/components/backoffice/forms/FormSelect.svelte';
	import UserFormActions from './UserFormActions.svelte';

	type Props = {
		form: SuperValidated<UserFormSchema>;
		mode: 'create' | 'edit';
	};

	let { form: formData, mode }: Props = $props();

	const isEditMode = $derived(mode === 'edit');
	const formAction = $derived(isEditMode ? '?/update' : undefined);

	// formData is intentionally captured once at mount
	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, submitting } = superForm(formData, {
		dataType: 'json'
	});

	const formId = 'user-form';

	function isRoleSelected(role: UserRole): boolean {
		return ($form.roles ?? []).includes(role);
	}

	function toggleRole(role: UserRole, checked: boolean) {
		const current = $form.roles ?? [];
		$form.roles = checked ? [...current, role] : current.filter((r) => r !== role);
	}
</script>

<UserFormActions {mode} {formId} submitting={$submitting} />

<form id={formId} method="POST" action={formAction} use:enhance class="space-y-4">
	<FormAccordion name="form-user-data" open>
		{#snippet title()}
			<Database class="size-6" />
			<span>{m.users_sectionMainData()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.users_sectionMainDataDescription()}</p>
		{/snippet}
		{#snippet content()}
			<input type="hidden" name="id" value={$form.id} />

			<FormInputText
				id="name"
				label={m.users_labelName()}
				bind:value={$form.name}
				error={$errors.name}
				wrapperClass="md:col-span-12"
			/>

			<FormInputText
				id="email"
				label={m.users_labelEmail()}
				bind:value={$form.email}
				error={$errors.email}
				wrapperClass="md:col-span-6"
			/>

			<FormInputText
				id="phone"
				label={m.users_labelPhone()}
				bind:value={$form.phone}
				error={$errors.phone}
				wrapperClass="md:col-span-6"
			/>
		{/snippet}
	</FormAccordion>

	<FormAccordion name="form-user-permissions" open>
		{#snippet title()}
			<Key class="size-6" />
			<span>{m.users_sectionPermissions()}</span>
		{/snippet}
		{#snippet asideContent()}
			<p class="text-xs">{m.users_sectionPermissionsDescription()}</p>
		{/snippet}
		{#snippet content()}
			{#if isEditMode}
				<FormSelect
					id="status"
					label={m.users_labelStatus()}
					bind:value={$form.status}
					error={$errors.status}
					options={USER_STATUS_OPTIONS}
					placeholder={m.users_placeholderStatus()}
					wrapperClass="md:col-span-6"
				/>
			{/if}

			<div class="md:col-span-12">
				<div class="label text-sm">
					<span>{m.users_labelRoles()}</span>
				</div>
				<div class="card p-4">
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each USER_ROLE_OPTIONS as option (option.id)}
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									class="checkbox checkbox-sm"
									checked={isRoleSelected(option.id)}
									onchange={(e) => toggleRole(option.id, e.currentTarget.checked)}
								/>
								<span class="label-text text-sm">{option.name}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{/snippet}
	</FormAccordion>
</form>
