<!-- 
Componente RangeCalendar reutilizable con Melt-UI y estilos DaisyUI
https://melt-ui.com/docs/builders/range-calendar

Ejemplo de uso:
<RangeCalendarMelt bind:value={rangeValue} />

Props disponibles:
- value: DateRange | undefined (bindable)
- onValueChange: (value: DateRange | undefined) => void
- numberOfMonths: number (default: 2)
- class: string (clases adicionales)
-->

<script lang="ts">
	import { createRangeCalendar, melt, type CreateRangeCalendarProps } from '@melt-ui/svelte';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';
	import cn from 'clsx';

	type DateRange = CreateRangeCalendarProps['defaultValue'];

	type Props = {
		value?: DateRange;
		onValueChange?: (value: DateRange | undefined) => void;
		numberOfMonths?: number;
		class?: string;
	};

	let {
		value = $bindable(),
		onValueChange,
		numberOfMonths = 2,
		class: className = ''
	}: Props = $props();

	const {
		elements: { calendar, heading, grid, cell, prevButton, nextButton },
		states: { months, headingValue, weekdays, value: calendarValue },
		helpers: { isDateDisabled, isDateUnavailable }
	} = createRangeCalendar({
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
	});

	// Sincronizar value externo con el calendario
	$effect(() => {
		// Si el value externo cambia, actualizar el calendario
		if (value !== $calendarValue) {
			calendarValue.set(value as any);
		}
	});
</script>

<div
	use:melt={$calendar}
	class="rounded-box border border-base-content/10 bg-base-100 p-6 shadow-lg {className}"
>
	<header class="flex items-center justify-between">
		<button
			use:melt={$prevButton}
			class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
		>
			<NavArrowLeft />
		</button>
		<div class="text-sm font-medium">
			{$headingValue}
		</div>
		<button
			use:melt={$nextButton}
			class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
		>
			<NavArrowRight />
		</button>
	</header>

	<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
		{#each $months as month}
			<table use:melt={$grid} class="border-collapse space-y-1 select-none">
				<thead>
					<tr class="mb-2 inline-flex justify-between">
						{#each $weekdays as day}
							<th class="w-10 text-xs font-semibold opacity-60">
								<div>{day.slice(0, 2)}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each month.weeks as weekDates}
						<tr class="flex w-full">
							{#each weekDates as date}
								<td class="relative m-0 size-10 p-0 text-center text-sm focus-within:z-20">
									<button
										use:melt={$cell(date, month.value)}
										class={cn(
											'group rounded-btn relative inline-flex size-10 cursor-pointer items-center justify-center border border-transparent bg-transparent p-0 text-sm font-normal transition-colors',
											'hover:bg-base-200',
											'data-[disabled]:pointer-events-none data-[disabled]:opacity-30',
											'data-[outside-month]:pointer-events-none data-[outside-month]:opacity-40',
											'data-[unavailable]:line-through',
											'data-[selected]:bg-primary/20 data-[selected]:font-semibold',
											'data-[selection-start]:bg-primary data-[selection-start]:font-bold data-[selection-start]:text-primary-content',
											'data-[selection-end]:bg-primary data-[selection-end]:font-bold data-[selection-end]:text-primary-content',
											'data-[selected]:not([data-selection-start]):not([data-selection-end]):rounded-none'
										)}
									>
										<div
											class="absolute top-1 hidden size-1.5 rounded-full bg-primary group-data-[selected]:bg-primary group-data-[today]:block"
										></div>
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
