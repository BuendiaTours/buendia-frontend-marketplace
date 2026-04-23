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

<div class="checkout-field" class:checkout-field__checkbox={isBoolean}>
	{#if isBoolean}
		<label class="checkout-field__label__checkbox label">
			<input
				id={inputId}
				type="checkbox"
				checked={isChecked}
				class="checkbox"
				onchange={(e) => onchange(String(e.currentTarget.checked))}
				required={isRequired && !isChecked}
			/>
			{q.label}{isRequired ? ' *' : ''}
		</label>
	{:else}
		<label class="checkout-field__label label block" class:!mb-0={q.helpText} for={inputId}>
			{q.label}
			{#if isRequired}
				<span class="text-salmon-strong font-bold">*</span>
			{/if}
		</label>
	{/if}

	{#if q.helpText}
		<p class="checkout-field__help p-base mb-2 w-full text-neutral-600">{q.helpText}</p>
	{/if}

	{#if !isBoolean}
		<div class="checkout-field__wrapper">
			{#if q.dataType === 'TEXT_AREA'}
				<textarea
					id={inputId}
					class="textarea"
					{value}
					oninput={(e) => onchange(e.currentTarget.value)}
					placeholder={q.placeholder ?? ''}
					required={isRequired}
				></textarea>
			{:else if q.dataType === 'INPUT_NUMBER' || q.dataType === 'AGE'}
				<input
					id={inputId}
					type="number"
					class="input input-lg max-w-[200px]"
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
					class="input input-email input-lg"
					{value}
					oninput={(e) => onchange(e.currentTarget.value)}
					placeholder={q.placeholder ?? ''}
					required={isRequired}
				/>
			{:else if q.dataType === 'PHONE'}
				<input
					id={inputId}
					type="tel"
					class="input input-tel input-lg"
					{value}
					oninput={(e) => onchange(e.currentTarget.value)}
					placeholder={q.placeholder ?? ''}
					required={isRequired}
				/>
			{:else if q.dataType === 'DATE' || q.dataType === 'BIRTHDAY' || q.dataType === 'PASSPORT_EXPIRED'}
				<input
					id={inputId}
					type="date"
					class="input input-date input-lg"
					{value}
					oninput={(e) => onchange(e.currentTarget.value)}
					required={isRequired}
				/>
			{:else if q.dataType === 'DATE_AND_TIME'}
				<input
					id={inputId}
					type="datetime-local"
					class="input input-datetime input-lg"
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
					class="select select-lg"
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
								class="radio"
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
								class="checkbox"
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
					class="input input-lg"
					{value}
					oninput={(e) => onchange(e.currentTarget.value)}
					placeholder={q.placeholder ?? ''}
					required={isRequired}
				/>
			{/if}
		</div>{/if}
</div>
