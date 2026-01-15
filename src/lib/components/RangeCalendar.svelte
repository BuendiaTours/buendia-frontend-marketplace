<!-- 
Componente RangeCalendar reutilizable con estilos DaisyUI
https://www.bits-ui.com/docs/components/range-calendar

Ejemplo de uso:
<RangeCalendar bind:value={rangeValue} numberOfMonths={2} />

Props disponibles:
- value: DateRange | undefined (bindable)
- onValueChange: (value: DateRange | undefined) => void
- numberOfMonths: number (default: 2)
- maxDays: number (default: 99)
- class: string (clases adicionales)
-->

<script lang="ts">
	import { RangeCalendar as RangeCalendarPrimitive, type DateRange } from 'bits-ui';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';
	import cn from 'clsx';

	type Props = {
		value?: DateRange;
		onValueChange?: (value: DateRange | undefined) => void;
		numberOfMonths?: number;
		maxDays?: number;
		class?: string;
	};

	let {
		value = $bindable(),
		onValueChange,
		numberOfMonths = 2,
		maxDays = 99,
		class: className = ''
	}: Props = $props();
</script>

<RangeCalendarPrimitive.Root
	class="rounded-box border border-base-content/10 bg-base-100 p-6 shadow-lg {className}"
	weekdayFormat="short"
	fixedWeeks={true}
	bind:value
	{onValueChange}
	{maxDays}
	{numberOfMonths}
	pagedNavigation={true}
	locale="es-ES"
	weekStartsOn={1}
>
	{#snippet children({ months, weekdays })}
		<RangeCalendarPrimitive.Header class="flex items-center justify-between">
			<RangeCalendarPrimitive.PrevButton
				class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
			>
				<span><NavArrowLeft /></span>
			</RangeCalendarPrimitive.PrevButton>
			<RangeCalendarPrimitive.Heading class="text-base font-semibold" />
			<RangeCalendarPrimitive.NextButton
				class="btn inline-flex size-10 items-center justify-center btn-ghost btn-sm"
			>
				<span><NavArrowRight /></span>
			</RangeCalendarPrimitive.NextButton>
		</RangeCalendarPrimitive.Header>
		<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
			{#each months as month (month.value.month)}
				<RangeCalendarPrimitive.Grid class="w-full border-collapse space-y-1 select-none">
					<RangeCalendarPrimitive.GridHead>
						<RangeCalendarPrimitive.GridRow class="mb-2 flex w-full justify-between">
							{#each weekdays as day (day)}
								<RangeCalendarPrimitive.HeadCell class="w-10 text-xs font-semibold opacity-60">
									<div>{day.slice(0, 2)}</div>
								</RangeCalendarPrimitive.HeadCell>
							{/each}
						</RangeCalendarPrimitive.GridRow>
					</RangeCalendarPrimitive.GridHead>
					<RangeCalendarPrimitive.GridBody>
						{#each month.weeks as weekDates, i (i)}
							<RangeCalendarPrimitive.GridRow class="flex w-full">
								{#each weekDates as date, d (d)}
									<RangeCalendarPrimitive.Cell
										{date}
										month={month.value}
										class="relative m-0 size-10 p-0 text-center text-sm focus-within:z-20"
									>
										<RangeCalendarPrimitive.Day
											class={cn(
												'group rounded-btn relative inline-flex size-10 items-center justify-center border border-transparent bg-transparent p-0 text-sm font-normal transition-colors',
												'hover:bg-base-200',
												'data-disabled:pointer-events-none data-disabled:opacity-30',
												'data-outside-month:pointer-events-none data-outside-month:opacity-40',
												'data-unavailable:line-through',
												'data-selected:bg-primary/20 data-selected:font-semibold',
												'data-selection-start:bg-primary data-selection-start:font-bold data-selection-start:text-primary-content',
												'data-selection-end:bg-primary data-selection-end:font-bold data-selection-end:text-primary-content',
												'data-selected:[&:not([data-selection-start])]:[&:not([data-selection-end])]:rounded-none'
											)}
										>
											<div
												class="absolute top-1 hidden size-1.5 rounded-full bg-primary group-data-selected:bg-primary group-data-today:block"
											></div>
											{date.day}
										</RangeCalendarPrimitive.Day>
									</RangeCalendarPrimitive.Cell>
								{/each}
							</RangeCalendarPrimitive.GridRow>
						{/each}
					</RangeCalendarPrimitive.GridBody>
				</RangeCalendarPrimitive.Grid>
			{/each}
		</div>
	{/snippet}
</RangeCalendarPrimitive.Root>
