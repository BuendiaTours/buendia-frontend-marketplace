<!--
Componente MeltRangeCalendar con Melt-UI (marketplace)
https://melt-ui.com/docs/builders/range-calendar

Ejemplo de uso:
<MeltRangeCalendar bind:value={rangeValue} />

Props disponibles:
- value: DateRange | undefined (bindable)
- onValueChange: (value: DateRange | undefined) => void
- numberOfMonths: number (default: 2)
- wrapperClass: string (clases adicionales)

Estilos en: src/lib/styles/marketplace/components/c-melt-range-calendar.css
Personaliza con variables CSS: --c-melt-range-calendar-bg, --c-melt-range-calendar-selection-start-bg, etc.
-->

<script lang="ts">
	import { createRangeCalendar, melt, type CreateRangeCalendarProps } from '@melt-ui/svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';
	import { untrack } from 'svelte';

	type DateRange = CreateRangeCalendarProps['defaultValue'];

	type Props = {
		value?: DateRange;
		onValueChange?: (value: DateRange | undefined) => void;
		numberOfMonths?: number;
		wrapperClass?: string;
	};

	let {
		value = $bindable(),
		onValueChange,
		numberOfMonths = 2,
		wrapperClass = ''
	}: Props = $props();

	const {
		elements: { calendar, grid, cell, prevButton, nextButton },
		states: { months, headingValue, weekdays, value: calendarValue }
	} = untrack(() =>
		createRangeCalendar({
			...(value && { defaultValue: value }),
			locale: 'es-ES',
			numberOfMonths,
			weekStartsOn: 0,
			fixedWeeks: true,
			onValueChange: ({ next }) => {
				value = next;
				onValueChange?.(next);
				return next;
			}
		})
	);

	// Sincronizar value externo con el calendario
	$effect(() => {
		const isSame =
			value?.start?.toString() === $calendarValue?.start?.toString() &&
			value?.end?.toString() === $calendarValue?.end?.toString();
		if (!isSame && value) {
			calendarValue.set(value);
		}
	});
</script>

<div use:melt={$calendar} class="c-melt-range-calendar {wrapperClass}">
	<header class="flex items-center justify-between">
		<button use:melt={$prevButton} class="c-melt-range-calendar__nav-btn">
			<AltArrowLeft />
		</button>
		<div class="p-sm font-medium">
			{$headingValue}
		</div>
		<button use:melt={$nextButton} class="c-melt-range-calendar__nav-btn">
			<AltArrowRight />
		</button>
	</header>

	<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
		{#each $months as month, i (i)}
			<table use:melt={$grid} class="border-collapse select-none">
				<thead>
					<tr class="mb-2 inline-flex justify-between">
						{#each $weekdays as day, j (j)}
							<th class="p-xs w-10 text-center font-semibold opacity-60">
								<div>{day.slice(0, 2)}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each month.weeks as weekDates, wi (wi)}
						<tr class="flex w-full">
							{#each weekDates as date, di (di)}
								<td class="p-sm relative m-0 size-10 p-0 text-center focus-within:z-20">
									<button use:melt={$cell(date, month.value)} class="c-melt-range-calendar__cell">
										<div class="c-melt-range-calendar__today-dot"></div>
										{date.day}
									</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/each}
	</div>
</div>
