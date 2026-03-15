<script lang="ts">
	/**
	 * UserFormActions — Action bar for user form (back, submit).
	 * Users are not deletable through the API.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { USER_ROUTES } from '$lib/config/routes/backoffice/users';

	type Props = {
		mode: 'create' | 'edit';
		/** Binds the submit button to the external form element via the `form` attribute. */
		formId: string;
	};

	let { mode, formId }: Props = $props();

	const isCreateMode = $derived(mode === 'create');
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${USER_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.users_backToList()}
	</a>

	<button
		form={formId}
		type="submit"
		class="btn btn-outline btn-primary"
		class:ml-auto={isCreateMode}
	>
		{isCreateMode ? m.users_createUser() : m.users_saveChanges()}
	</button>
</div>
