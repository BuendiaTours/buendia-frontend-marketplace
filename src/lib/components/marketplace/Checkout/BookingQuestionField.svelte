<script lang="ts">
	import type { BookingQuestion } from '$lib/types';

	type Props = {
		q: BookingQuestion;
		value: string;
		onchange: (value: string) => void;
	};

	let { q, value = '', onchange }: Props = $props();

	const inputId = $derived(`bq-${q.id}`);
	const isRequired = $derived(q.required === 'REQUIRED');

	const isBoolean = $derived(
		q.dataType === 'CHECKBOX' || q.dataType === 'BOOLEAN' || q.dataType === 'CHECK_TERMS'
	);
	const isChecked = $derived(value === 'true');

	const selectedValues = $derived.by<string[]>(() => {
		try {
			return JSON.parse(value);
		} catch {
			return [];
		}
	});

	function toggleMultiValue(optValue: string) {
		const current: string[] = (() => {
			try {
				return JSON.parse(value);
			} catch {
				return [];
			}
		})();
		const next = current.includes(optValue)
			? current.filter((v) => v !== optValue)
			: [...current, optValue];
		onchange(JSON.stringify(next));
	}
</script>

<div class="bq-field" class:bq-field--checkbox={isBoolean}>
	{#if isBoolean}
		<label class="checkbox-label">
			<input
				id={inputId}
				type="checkbox"
				checked={isChecked}
				onchange={(e) => onchange(String(e.currentTarget.checked))}
				required={isRequired && !isChecked}
			/>
			{q.label}{isRequired ? ' *' : ''}
		</label>
	{:else}
		<label for={inputId}>
			{q.label}{isRequired ? ' *' : ''}
		</label>
	{/if}

	{#if q.helpText}
		<p class="help-text">{q.helpText}</p>
	{/if}

	{#if !isBoolean}
		{#if q.dataType === 'TEXT_AREA'}
			<textarea
				id={inputId}
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				placeholder={q.placeholder ?? ''}
				required={isRequired}
			></textarea>
		{:else if q.dataType === 'INPUT_NUMBER' || q.dataType === 'AGE'}
			<input
				id={inputId}
				type="number"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				placeholder={q.placeholder ?? ''}
				min={q.minValue ?? undefined}
				max={q.maxValue ?? undefined}
				required={isRequired}
			/>
		{:else if q.dataType === 'EMAIL'}
			<input
				id={inputId}
				type="email"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				placeholder={q.placeholder ?? ''}
				required={isRequired}
			/>
		{:else if q.dataType === 'PHONE'}
			<input
				id={inputId}
				type="tel"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				placeholder={q.placeholder ?? ''}
				required={isRequired}
			/>
		{:else if q.dataType === 'DATE' || q.dataType === 'BIRTHDAY' || q.dataType === 'PASSPORT_EXPIRED'}
			<input
				id={inputId}
				type="date"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				required={isRequired}
			/>
		{:else if q.dataType === 'DATE_AND_TIME'}
			<input
				id={inputId}
				type="datetime-local"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				required={isRequired}
			/>
		{:else if q.dataType === 'OPTION'}
			<select
				id={inputId}
				{value}
				onchange={(e) => onchange(e.currentTarget.value)}
				required={isRequired}
			>
				<option value="">—</option>
				{#each q.options as opt (opt.id)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		{:else if q.dataType === 'RADIO_BUTTON'}
			<div class="radio-group" role="radiogroup">
				{#each q.options as opt (opt.id)}
					<label class="radio-label">
						<input
							type="radio"
							name={inputId}
							value={opt.value}
							checked={value === opt.value}
							onchange={() => onchange(opt.value)}
							required={isRequired}
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		{:else if q.dataType === 'MULTI_OPTION'}
			<div class="checkbox-group">
				{#each q.options as opt (opt.id)}
					<label class="checkbox-label">
						<input
							type="checkbox"
							value={opt.value}
							checked={selectedValues.includes(opt.value)}
							onchange={() => toggleMultiValue(opt.value)}
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		{:else}
			<input
				id={inputId}
				type="text"
				{value}
				oninput={(e) => onchange(e.currentTarget.value)}
				placeholder={q.placeholder ?? ''}
				required={isRequired}
			/>
		{/if}
	{/if}
</div>

<style>
	.bq-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;

		& label:not(.checkbox-label):not(.radio-label) {
			font-size: 0.875rem;
			font-weight: 500;
		}

		& input:not([type='checkbox']):not([type='radio']),
		& select,
		& textarea {
			width: 100%;
			padding: 0.5rem 0.75rem;
			border: 1px solid oklch(var(--border, 0.7 0 0));
			border-radius: 0.375rem;
			font-size: 1rem;
			background-color: transparent;

			&:focus {
				outline: 2px solid oklch(var(--primary, 0.5 0.2 250));
				outline-offset: 2px;
			}
		}

		& textarea {
			resize: vertical;
			min-height: 5rem;
		}
	}

	.radio-group,
	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.radio-label,
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.bq-field--checkbox {
		flex-direction: row;
		align-items: flex-start;
	}

	.help-text {
		font-size: 0.8rem;
		color: oklch(0.55 0 0);
	}
</style>
