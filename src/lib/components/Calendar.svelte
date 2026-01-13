<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';

	type Props = {
		value?: DateValue;
		onValueChange?: (value: DateValue | undefined) => void;
		class?: string;
	};

	let { value = $bindable(), onValueChange, class: className = '' }: Props = $props();
</script>

<CalendarPrimitive.Root
	class="mt-6 rounded-[15px] border border-base-300 bg-base-100 p-[22px] shadow-sm {className}"
	weekdayFormat="short"
	fixedWeeks={true}
	type="single"
	bind:value
	{onValueChange}
>
	{#snippet children({ months, weekdays })}
		<CalendarPrimitive.Header class="flex items-center justify-between">
			<CalendarPrimitive.PrevButton
				class="inline-flex size-10 items-center justify-center rounded-lg bg-base-100 hover:bg-base-200 active:scale-[0.98] active:transition-all"
			>
				<span>←</span>
			</CalendarPrimitive.PrevButton>
			<CalendarPrimitive.Heading class="text-[15px] font-medium" />
			<CalendarPrimitive.NextButton
				class="inline-flex size-10 items-center justify-center rounded-lg bg-base-100 hover:bg-base-200 active:scale-[0.98] active:transition-all"
			>
				<span>→</span>
			</CalendarPrimitive.NextButton>
		</CalendarPrimitive.Header>
		<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
			{#each months as month, i (i)}
				<CalendarPrimitive.Grid class="w-full border-collapse space-y-1 select-none">
					<CalendarPrimitive.GridHead>
						<CalendarPrimitive.GridRow class="mb-1 flex w-full justify-between">
							{#each weekdays as day, i (i)}
								<CalendarPrimitive.HeadCell class="w-10 rounded-md text-xs font-normal opacity-60">
									<div>{day.slice(0, 2)}</div>
								</CalendarPrimitive.HeadCell>
							{/each}
						</CalendarPrimitive.GridRow>
					</CalendarPrimitive.GridHead>
					<CalendarPrimitive.GridBody>
						{#each month.weeks as weekDates, i (i)}
							<CalendarPrimitive.GridRow class="flex w-full">
								{#each weekDates as date, i (i)}
									<CalendarPrimitive.Cell
										{date}
										month={month.value}
										class="relative size-10 p-0 text-center text-sm"
									>
										<CalendarPrimitive.Day
											class="group relative inline-flex size-10 items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-sm font-normal whitespace-nowrap hover:border-base-content data-disabled:pointer-events-none data-disabled:opacity-30 data-outside-month:pointer-events-none data-selected:bg-primary data-selected:font-medium data-selected:text-primary-content data-unavailable:line-through data-unavailable:opacity-50"
										>
											<div
												class="absolute top-[5px] hidden size-1 rounded-full bg-base-content group-data-selected:bg-primary-content group-data-today:block"
											></div>
											{date.day}
										</CalendarPrimitive.Day>
									</CalendarPrimitive.Cell>
								{/each}
							</CalendarPrimitive.GridRow>
						{/each}
					</CalendarPrimitive.GridBody>
				</CalendarPrimitive.Grid>
			{/each}
		</div>
	{/snippet}
</CalendarPrimitive.Root>
