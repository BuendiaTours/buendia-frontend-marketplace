<!-- 
Componente MeltCalendar con Melt-UI y estilos DaisyUI
https://melt-ui.com/docs/builders/calendar

Ejemplo de uso:
<MeltCalendar bind:value={dateValue} />

Props disponibles:
- value: DateValue | undefined (bindable)
- onValueChange: (value: DateValue | undefined) => void
- class: string (clases adicionales)
-->

<script lang="ts">
	import { createCalendar, melt } from '@melt-ui/svelte';
	import { NavArrowLeft, NavArrowRight } from 'svelte-iconoir';
	import cn from 'clsx';
	import type { DateValue } from '@internationalized/date';

	type Props = {
		value?: DateValue;
		onValueChange?: (value: DateValue | undefined) => void;
		class?: string;
	};

	let { value = $bindable(), onValueChange, class: className = '' }: Props = $props();

	const {
		elements: { calendar, heading, grid, cell, prevButton, nextButton },
		states: { months, headingValue, weekdays, value: calendarValue }
	} = createCalendar({
		...(value && { defaultValue: value }),
		locale: 'es-ES',
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
		if (value !== $calendarValue) {
			calendarValue.set(value as any);
		}
	});
</script>

<div use:melt={$calendar} class="melt-calendar-container rounded-md {className}">
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

	<div class="flex flex-col space-y-4 pt-4">
		{#each $months as month}
			<table use:melt={$grid} class="border-collapse space-y-1 select-none">
				<thead>
					<tr class="mb-1 inline-flex justify-between">
						{#each $weekdays as day}
							<th class="w-10 rounded-md text-xs font-normal opacity-60">
								<div>{day.slice(0, 2)}</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each month.weeks as weekDates}
						<tr class="flex w-full">
							{#each weekDates as date}
								<td class="relative size-10 p-0 text-center text-sm">
									<button
										use:melt={$cell(date, month.value)}
										class={cn(
											'group relative inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent p-0 text-sm font-normal whitespace-nowrap',
											'hover:border-base-content',
											'data-[disabled]:pointer-events-none data-[disabled]:opacity-30',
											'data-[outside-month]:pointer-events-none',
											'data-[selected]:bg-primary data-[selected]:font-medium data-[selected]:text-primary-content',
											'data-[unavailable]:line-through data-[unavailable]:opacity-50'
										)}
									>
										<div
											class="absolute top-[5px] hidden size-1 rounded-full bg-base-content group-data-[selected]:bg-primary-content group-data-[today]:block"
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
