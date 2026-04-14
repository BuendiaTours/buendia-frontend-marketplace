<script lang="ts">
	/**
	 * MediaFormActions — Action bar for the media edit page (back, delete, submit).
	 * Delete uses progressive enhancement to avoid full page reload.
	 */
	import * as m from '$paraglide/messages';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { confirmAction } from '$lib/actions/backoffice/confirmAction';
	import { MULTIMEDIA_ROUTES } from '$lib/config/routes/backoffice/multimedia';

	type Props = {
		mediaId: string;
		formId: string;
		submitting?: boolean;
		/** Number of activities using this media asset. */
		activityCount?: number;
	};

	let { mediaId, formId, submitting = false, activityCount = 0 }: Props = $props();
</script>

<div
	class="bnd-main-actions border-base-content/10 bg-base-100 sticky top-0 z-10 flex items-center justify-between gap-4 border-t py-4"
>
	<a href={`${MULTIMEDIA_ROUTES.list}?${page.url.searchParams.toString()}`} class="btn btn-ghost">
		← {m.multimedia_backToList()}
	</a>

	<span class="text-base-content/50 text-sm">
		{activityCount}
		{activityCount === 1
			? m.multimedia_activityCountSingular()
			: m.multimedia_activityCountPlural()}
	</span>

	<form
		method="POST"
		action={`${MULTIMEDIA_ROUTES.edit(mediaId)}?/delete`}
		class="ml-auto"
		use:enhance
	>
		<button
			type="submit"
			class="btn btn-soft btn-error"
			disabled={submitting}
			use:confirmAction={{
				title: m.multimedia_confirmDeleteTitle(),
				message: m.multimedia_confirmDeleteMessage(),
				confirmText: m.common_delete(),
				cancelText: m.common_cancel(),
				danger: true
			}}
		>
			{m.multimedia_deleteButton()}
		</button>
	</form>

	<button form={formId} type="submit" class="btn btn-outline btn-primary" disabled={submitting}>
		{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
		{m.multimedia_saveChanges()}
	</button>
</div>
