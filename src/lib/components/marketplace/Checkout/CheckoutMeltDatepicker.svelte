<!--
  CheckoutMeltDatepicker - DatePicker para el flujo de Checkout
  Usa Melt UI createDatePicker con dos meses en un popover
-->

<script lang="ts">
	import { createDatePicker, melt } from '@melt-ui/svelte';
	import { AltArrowLeft, AltArrowRight, Calendar } from '$lib/icons/Linear';
	import type { DateValue } from '@internationalized/date';
	import FakeSelectButton from '$lib/components/marketplace/FakeSelectButton.svelte';
	import { fade } from 'svelte/transition';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';

	type Props = {
		disabled?: boolean;
		isDateDisabled?: (date: DateValue) => boolean;
		onMonthChange?: (fromDate: string) => void;
		onSelect?: (date: DateValue) => void;
		value?: DateValue;
		wrapperClass?: string;
	};

	let {
		value = $bindable(),
		onSelect,
		onMonthChange,
		disabled = false,
		isDateDisabled: checkDisabled,
		wrapperClass = ''
	}: Props = $props();

	const {
		elements: { trigger, content, calendar, cell, grid, heading, prevButton, nextButton },
		states: { months, headingValue, weekdays, open, value: pickerValue },
		helpers: { isDateDisabled, isDateUnavailable },
		options
	} = createDatePicker({
		forceVisible: true,
		numberOfMonths: 2,
		locale: 'es-ES',
		defaultValue: value,
		closeOnOutsideClick: false,
		onValueChange: ({ next }) => {
			value = next;
			if (next) {
				onSelect?.(next);
				open.set(false);
			}
			return next;
		}
	});

	$effect(() => {
		if (value && $pickerValue?.toString() !== value.toString()) {
			pickerValue.set(value);
		}
	});

	$effect(() => {
		if (checkDisabled) options.isDateDisabled.set(checkDisabled);
	});

	let prevMonthStr = '';
	$effect(() => {
		const last = $months[$months.length - 1];
		if (!last) return;
		const monthStr = `${last.value.year}-${String(last.value.month).padStart(2, '0')}-01`;
		if (monthStr === prevMonthStr) return;
		const wasEmpty = prevMonthStr === '';
		prevMonthStr = monthStr;
		if (!wasEmpty) onMonthChange?.(monthStr);
	});
</script>

<div class="relative w-full {wrapperClass}">
	<!-- Date Field Trigger -->
	<FakeSelectButton
		icon={Calendar}
		{disabled}
		placeholder="Seleccionar fecha"
		disabledPlaceholder="Selecciona asistentes primero"
		value={$pickerValue ? format($pickerValue.toDate('UTC'), 'd MMM yyyy', { locale: es }) : null}
		open={$open}
		{trigger}
	/>

	<!-- Popover Content -->
	{#if $open}
		<!-- $open -->
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$content}
			class="absolute z-50 mt-2 w-auto min-w-[600px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
		>
			<!-- Calendar Header -->
			<header class="mb-4 flex items-center justify-between">
				<button
					use:melt={$prevButton}
					class="rounded-lg p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Mes anterior"
				>
					<AltArrowLeft />
				</button>

				<div use:melt={$heading} class="font-semibold text-gray-800">
					{$headingValue}
				</div>

				<button
					use:melt={$nextButton}
					class="rounded-lg p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Mes siguiente"
				>
					<AltArrowRight />
				</button>
			</header>

			<!-- Two Months Grid -->
			<div use:melt={$calendar} class="flex gap-6">
				{#each $months as month, monthIndex (monthIndex)}
					<div class="flex-1">
						<div class="mb-2 text-center font-semibold text-gray-700">
							{month.value
								.toDate('UTC')
								.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
						</div>

						<table use:melt={$grid} class="w-full border-collapse">
							<thead>
								<tr>
									{#each $weekdays as day, j (j)}
										<th class="p-xs text-center font-medium text-gray-500">
											{day.slice(0, 2)}
										</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each month.weeks as weekDates, wi (wi)}
									<tr>
										{#each weekDates as date, di (di)}
											{@const isDisabled = checkDisabled
												? checkDisabled(date)
												: $isDateDisabled(date)}
											{@const isUnavailable = $isDateUnavailable(date)}
											<td
												role="gridcell"
												class="p-0.5 text-center"
												aria-disabled={isDisabled || isUnavailable}
											>
												<button
													use:melt={$cell(date, month.value)}
													disabled={isDisabled || isUnavailable}
													class="p-sm flex h-9 w-9 cursor-pointer items-center justify-center rounded transition-colors
														{isDisabled || isUnavailable
														? '!cursor-not-allowed text-gray-300'
														: 'hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none'}
														[&[data-outside-month]]:pointer-events-none [&[data-outside-month]]:text-gray-300
														[&[data-selected]:not([data-outside-month])]:bg-blue-500 [&[data-selected]:not([data-outside-month])]:text-white [&[data-selected]:not([data-outside-month])]:hover:bg-blue-600
														[&[data-today]]:ring-1 [&[data-today]]:ring-blue-400"
												>
													{date.day}
												</button>
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/each}
			</div>

			<!-- Footer -->
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="p-sm rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200"
					onclick={() => open.set(false)}
				>
					Cancelar
				</button>
				<button
					class="p-sm rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
					onclick={() => open.set(false)}
				>
					Aceptar
				</button>
			</div>
		</div>
	{/if}
</div>
