<!--
Componente MeltCalendar con Melt-UI (marketplace)
https://melt-ui.com/docs/builders/calendar

Ejemplo de uso:
<MeltCalendar bind:value={dateValue} />

Props disponibles:
- value: DateValue | undefined (bindable)
- onValueChange: (value: DateValue | undefined) => void
- wrapperClass: string (clases adicionales)

Estilos en: src/lib/styles/marketplace/components/c-melt-calendar.css
Personaliza con variables CSS: --c-melt-calendar-bg, --c-melt-calendar-selected-bg, etc.
-->

<script lang="ts">
	import { createCalendar, melt } from '@melt-ui/svelte';
	import { AltArrowLeft, AltArrowRight } from '$lib/icons/Linear';
	import type { DateValue } from '@internationalized/date';

	type DayInfo = { price?: string | number; available?: boolean };

	type Props = {
		value?: DateValue;
		onValueChange?: (value: DateValue | undefined) => void;
		dayInfo?: (date: DateValue) => DayInfo;
		wrapperClass?: string;
	};

	let { value = $bindable(), onValueChange, dayInfo, wrapperClass = '' }: Props = $props();

	const {
		elements: { calendar, grid, cell, prevButton, nextButton },
		states: { months, headingValue, weekdays, value: calendarValue }
	} = createCalendar({
		...(value && { defaultValue: value }),
		locale: 'es-ES',
		weekStartsOn: 0,
		fixedWeeks: true,
		isDateDisabled: (date) => dayInfo?.(date)?.available === false,
		onValueChange: ({ next }) => {
			value = next;
			onValueChange?.(next);
			return next;
		}
	});

	// Sincronizar value externo con el calendario
	$effect(() => {
		if (value?.toString() !== $calendarValue?.toString()) {
			calendarValue.set(value);
		}
	});
</script>

<div use:melt={$calendar} class="c-melt-calendar {wrapperClass}">
	<header class="flex items-center justify-between">
		<button use:melt={$prevButton} class="c-melt-calendar__nav-btn">
			<AltArrowLeft />
		</button>
		<div class="p-sm font-medium">
			{$headingValue}
		</div>
		<button use:melt={$nextButton} class="c-melt-calendar__nav-btn">
			<AltArrowRight />
		</button>
	</header>

	<div class="flex flex-col space-y-4 pt-4">
		{#each $months as month, i (i)}
			<table use:melt={$grid} class="border-collapse select-none">
				<thead>
					<tr class="mb-1 inline-flex justify-between">
						{#each $weekdays as day, j (j)}
							<th class="p-xs w-10 text-center font-normal opacity-60">
								<div>{day.slice(0, 2)}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each month.weeks as weekDates, wi (wi)}
						<tr class="flex w-full">
							{#each weekDates as date, di (di)}
								{@const info = dayInfo?.(date)}
								<td class="relative w-10 p-0 text-center">
									<button use:melt={$cell(date, month.value)} class="c-melt-calendar__cell">
										<div class="c-melt-calendar__today-dot"></div>
										<span class="c-melt-calendar__day">{date.day}</span>
										{#if info?.price !== undefined}
											<span class="c-melt-calendar__price">{info.price}</span>
										{/if}
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
