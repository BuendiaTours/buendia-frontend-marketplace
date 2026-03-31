<script lang="ts">
	/**
	 * TuriTop-specific form fields.
	 * Currently requires the external activity ID and indexation priority.
	 */
	import * as m from '$paraglide/messages';
	import { INDEXATION_PRIORITY_OPTIONS } from '$lib/labels/bookings';
	import type { BookingSystemFormProps } from '../../types';

	let { formData = $bindable(), disabled }: BookingSystemFormProps = $props();
</script>

<div class="form-control w-full">
	<label class="label" for="turitop-bookingSystemId">
		<span class="label-text">{m.activities_bookingSystemIdLabel()}</span>
	</label>
	<input
		id="turitop-bookingSystemId"
		type="text"
		class="input input-bordered w-full"
		placeholder={m.activities_bookingSystemIdPlaceholder()}
		value={formData.bookingSystemId ?? ''}
		oninput={(e) => (formData.bookingSystemId = e.currentTarget.value)}
		{disabled}
	/>
</div>

<div class="form-control w-full">
	<label class="label" for="turitop-priority">
		<span class="label-text">{m.activities_bookingSystemPriorityLabel()}</span>
	</label>
	<select
		id="turitop-priority"
		class="select select-bordered w-full"
		value={formData.priority ?? ''}
		onchange={(e) => (formData.priority = e.currentTarget.value)}
		{disabled}
	>
		<option value="" disabled>{m.activities_bookingSystemPriorityPlaceholder()}</option>
		{#each INDEXATION_PRIORITY_OPTIONS as option (option.id)}
			<option value={option.id}>{option.name}</option>
		{/each}
	</select>
</div>
