<script lang="ts">
	/**
	 * ActivityJoinFreeTourDialog — Popover with an async search for existing free
	 * tour aggregations. When the user picks one, it submits a POST to the
	 * `joinExistingFreeTour` action of the activity edit page, which adds the
	 * activity as a new entry and redirects to the aggregation edit.
	 *
	 * Only shown for activities in `PENDING_GROUP` status (rendered by parent).
	 */
	import * as m from '$paraglide/messages';
	import { enhance } from '$app/forms';
	import { ACTIVITY_ROUTES } from '$lib/config/routes/backoffice/activities';
	import FormAsyncSearch from '$lib/components/backoffice/forms/FormAsyncSearch.svelte';
	import { searchFreeTours } from '../queries/free-tour-search.queries';

	type Props = {
		activityId: string;
		disabled?: boolean;
	};

	let { activityId, disabled = false }: Props = $props();

	let open = $state(false);
	let selectedFreeTourId = $state<string | undefined>(undefined);
	let formEl: HTMLFormElement | undefined = $state();

	const action = $derived(`${ACTIVITY_ROUTES.edit(activityId)}?/joinExistingFreeTour`);

	$effect(() => {
		if (selectedFreeTourId && formEl) {
			formEl.requestSubmit();
		}
	});

	function toggle() {
		open = !open;
		if (!open) selectedFreeTourId = undefined;
	}
</script>

<div class="relative">
	<button type="button" class="btn btn-soft btn-info" {disabled} onclick={toggle}>
		{m.activities_joinFreeTourButton()}
	</button>

	{#if open}
		<div
			class="border-base-300 bg-base-100 absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border p-3 shadow-lg"
		>
			<p class="text-base-content/70 mb-2 text-xs">
				{m.activities_joinFreeTourHelper()}
			</p>

			<form method="POST" {action} use:enhance bind:this={formEl}>
				<input type="hidden" name="freeTourId" value={selectedFreeTourId ?? ''} />

				<FormAsyncSearch
					id="joinFreeTourSearch"
					label=""
					bind:value={selectedFreeTourId}
					searchFn={searchFreeTours}
					placeholder={m.activities_joinFreeTourSearchPlaceholder()}
				/>
			</form>
		</div>
	{/if}
</div>
