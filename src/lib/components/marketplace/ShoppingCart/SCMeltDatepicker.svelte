<!--
  SCMeltDatepicker - DatePicker para Shopping Cart
  Usa Melt UI createDatePicker con dos meses en un popover
-->

<script lang="ts">
	import { createDatePicker, melt } from '@melt-ui/svelte';
	import { AltArrowLeft, AltArrowRight, Calendar } from '$lib/icons/Linear';
	import type { DateValue } from '@internationalized/date';
	import { fade } from 'svelte/transition';

	type Props = {
		value?: DateValue;
		onSelect?: (date: DateValue) => void;
		disabled?: boolean;
		isDateDisabled?: (date: DateValue) => boolean;
	};

	let {
		value = $bindable(),
		onSelect,
		disabled = false,
		isDateDisabled: checkDisabled
	}: Props = $props();

	const {
		elements: {
			trigger,
			content,
			calendar,
			cell,
			grid,
			heading,
			prevButton,
			nextButton,
			field,
			segment
		},
		states: { months, headingValue, weekdays, segmentContents, open, value: pickerValue },
		helpers: { isDateDisabled, isDateUnavailable },
		options
	} = createDatePicker({
		forceVisible: true,
		numberOfMonths: 2,
		locale: 'es-ES',
		defaultValue: value,
		onValueChange: ({ next }) => {
			value = next;
			if (next) onSelect?.(next);
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
</script>

<div class="relative w-full">
	<!-- Date Field Trigger -->
	<div
		use:melt={$field}
		class="p-sm flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
	>
		<Calendar class="text-gray-400" size={18} />

		<div class="flex items-center gap-0.5">
			{#each $segmentContents as seg, i (i)}
				<div use:melt={$segment(seg.part)} class="px-0.5 outline-none">
					{seg.value}
				</div>
			{/each}
		</div>

		<button
			use:melt={$trigger}
			class="ml-auto rounded p-1 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			aria-label="Abrir calendario"
			{disabled}
		>
			<Calendar size={16} />
		</button>
	</div>

	<!-- Popover Content -->
	{#if true}
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
														[&[data-outside-visible-months]]:pointer-events-none [&[data-outside-visible-months]]:text-gray-300
														[&[data-selected]]:bg-blue-500 [&[data-selected]]:text-white [&[data-selected]]:hover:bg-blue-600
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
